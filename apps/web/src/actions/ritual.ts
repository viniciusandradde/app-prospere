'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { computeStreak, requiresPivotBlock, revisaoSemanalSchema } from '@prospere/content';
import { getDb, schema } from '@/db';
import { requireUser } from '@/lib/auth';
import { track } from '@/lib/telemetry';

export interface SaveReviewState {
  status: 'ok' | 'error';
  message?: string;
  issues?: Array<{ path: string; message: string }>;
  streak?: number;
}

/**
 * Grava a Revisão Semanal, atualiza o streak e desnormaliza os números da semana em
 * `metric_entries` — é deles que sai o gráfico do número da semana (PRD N-08).
 */
export async function saveReviewAction(data: unknown): Promise<SaveReviewState> {
  const user = await requireUser();
  const parsed = revisaoSemanalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revise os campos destacados.',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const db = getDb();
  const [ritual] = await db
    .select()
    .from(schema.rituals)
    .where(
      and(eq(schema.rituals.workspaceId, user.workspaceId), eq(schema.rituals.kind, 'weekly_review')),
    )
    .limit(1);

  const ritualRow =
    ritual ??
    (
      await db
        .insert(schema.rituals)
        .values({ workspaceId: user.workspaceId, kind: 'weekly_review', cadence: 'weekly' })
        .returning()
    )[0]!;

  const review = parsed.data;
  const existingEntries = await db
    .select({ periodStart: schema.ritualEntries.periodStart })
    .from(schema.ritualEntries)
    .where(eq(schema.ritualEntries.ritualId, ritualRow.id));

  const reviewNumber = existingEntries.some((e) => e.periodStart === review.period_start)
    ? existingEntries.length
    : existingEntries.length + 1;

  if (requiresPivotBlock(reviewNumber) && !review.pivot) {
    return {
      status: 'error',
      message:
        'Esta é a 4ª revisão do ciclo: decida entre perseverar, ajustar ou pivotar antes de fechar.',
      issues: [{ path: 'pivot', message: 'Decisão obrigatória a cada 4 semanas.' }],
    };
  }

  await db
    .insert(schema.ritualEntries)
    .values({
      ritualId: ritualRow.id,
      periodStart: review.period_start,
      data: review,
      metricValue: String(review.numero_da_semana),
    })
    .onConflictDoUpdate({
      target: [schema.ritualEntries.ritualId, schema.ritualEntries.periodStart],
      set: { data: review, metricValue: String(review.numero_da_semana) },
    });

  const periods = [...new Set([...existingEntries.map((e) => e.periodStart), review.period_start])];
  const streak = computeStreak(periods);

  await db
    .update(schema.rituals)
    .set({ streak, bestStreak: sql`greatest(${schema.rituals.bestStreak}, ${streak})` })
    .where(eq(schema.rituals.id, ritualRow.id));

  const metrics: Array<[string, number]> = [
    ['contacts', review.numeros.contatos],
    ['conversations', review.numeros.conversas],
    ['proposals', review.numeros.propostas],
    ['sales', review.numeros.vendas],
    ['revenue', review.numeros.receita],
  ];

  for (const [metric, value] of metrics) {
    await db
      .insert(schema.metricEntries)
      .values({
        workspaceId: user.workspaceId,
        metric,
        periodStart: review.period_start,
        period: 'week',
        value: String(value),
        source: 'ritual',
      })
      .onConflictDoUpdate({
        target: [
          schema.metricEntries.workspaceId,
          schema.metricEntries.metric,
          schema.metricEntries.period,
          schema.metricEntries.periodStart,
        ],
        set: { value: String(value), source: 'ritual' },
      });
  }

  await track('review_completed', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { streak, pivot: review.pivot?.decisao ?? null },
  });

  revalidatePath('/ritual');
  revalidatePath('/hoje');
  return { status: 'ok', streak };
}

/** Dia e hora do lembrete da revisão. */
export async function updateReminderAction(
  weekday: number,
  timeLocal: string,
  reminder: boolean,
): Promise<{ status: 'ok' }> {
  const user = await requireUser();
  await getDb()
    .update(schema.rituals)
    .set({ weekday, timeLocal, reminder })
    .where(
      and(eq(schema.rituals.workspaceId, user.workspaceId), eq(schema.rituals.kind, 'weekly_review')),
    );
  revalidatePath('/conta');
  return { status: 'ok' };
}
