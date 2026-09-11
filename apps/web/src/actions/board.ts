'use server';

import { redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { boardAnswersSchema, generateTrail, type TrailResult } from '@prospere/engine';
import { getDb, schema } from '@/db';
import { requireUser } from '@/lib/auth';
import { track } from '@/lib/telemetry';

export interface BoardSubmitState {
  status: 'idle' | 'gate' | 'error';
  message?: string;
  edition?: string;
}

/**
 * Grava as respostas, roda o motor determinístico e materializa a trilha.
 * Refazer o board cria uma nova versão e uma nova trilha ativa; as missões já concluídas
 * na trilha anterior continuam registradas no histórico (PRD N-02, R-10).
 */
export async function submitBoardAction(rawAnswers: unknown): Promise<BoardSubmitState> {
  const user = await requireUser();
  const parsed = boardAnswersSchema.safeParse(rawAnswers);
  if (!parsed.success) {
    return { status: 'error', message: 'Faltou responder alguma pergunta. Volte e revise.' };
  }

  const result = generateTrail(parsed.data);

  if (result.kind === 'gate') {
    await track('gate_hit', {
      userId: user.id,
      workspaceId: user.workspaceId,
      props: { edition: result.gate.edition },
    });
    return { status: 'gate', edition: result.gate.edition, message: result.gate.message };
  }

  await persistTrail(user.id, user.workspaceId, parsed.data, result);
  redirect('/trilha');
}

async function persistTrail(
  userId: string,
  workspaceId: string,
  answers: z.infer<typeof boardAnswersSchema>,
  trail: TrailResult,
): Promise<void> {
  const db = getDb();

  const [latest] = await db
    .select({ version: schema.boardResponses.version })
    .from(schema.boardResponses)
    .where(eq(schema.boardResponses.workspaceId, workspaceId))
    .orderBy(desc(schema.boardResponses.version))
    .limit(1);

  const version = (latest?.version ?? 0) + 1;

  await db.transaction(async (tx) => {
    const [boardResponse] = await tx
      .insert(schema.boardResponses)
      .values({
        workspaceId,
        userId,
        version,
        boardVersion: trail.boardVersion,
        edition: 'negocio',
        answers,
        archetype: trail.archetype,
        weights: {},
        adjustments: trail.adjustments.map((a) => a.id),
        flags: { launch_kind: trail.launchKind, essential_mode: trail.essentialMode },
        explanation: trail.explanation,
        completedAt: new Date(),
      })
      .returning();

    // Uma trilha ativa por workspace: a anterior vira histórico.
    await tx
      .update(schema.trails)
      .set({ isActive: false })
      .where(and(eq(schema.trails.workspaceId, workspaceId), eq(schema.trails.isActive, true)));

    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + answers.q03.prazo_meses);

    const [createdTrail] = await tx
      .insert(schema.trails)
      .values({
        workspaceId,
        boardResponseId: boardResponse!.id,
        goalMetricName: trail.goal.metricName,
        goalMetricValue: String(trail.goal.monthlyTarget),
        goalDeadline: deadline.toISOString().slice(0, 10),
        hoursPerWeek: String(answers.q07),
        essentialMode: trail.essentialMode,
        plan: trail,
        isActive: true,
      })
      .returning();

    const missionIds = trail.phases.flatMap((phase) => phase.missionIds);
    await tx.insert(schema.trailMissions).values(
      missionIds.map((missionId, index) => ({
        trailId: createdTrail!.id,
        missionId,
        position: index + 1,
      })),
    );

    const [ritual] = await tx
      .select()
      .from(schema.rituals)
      .where(
        and(
          eq(schema.rituals.workspaceId, workspaceId),
          eq(schema.rituals.kind, 'weekly_review'),
        ),
      )
      .limit(1);

    if (!ritual) {
      await tx.insert(schema.rituals).values({
        workspaceId,
        kind: 'weekly_review',
        cadence: 'weekly',
        weekday: 5, // sexta-feira, ajustável em Conta
        timeLocal: '18:00:00',
      });
    }
  });

  await track('board_completed', { userId, workspaceId, props: { version } });
  await track('trail_generated', {
    userId,
    workspaceId,
    props: {
      archetype: trail.archetype,
      adjustments: trail.adjustments.map((a) => a.id),
      essential_mode: trail.essentialMode,
      weeks: trail.estimate.weeks,
    },
  });
}

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
  edition: z.enum(['escalar', 'pessoal']),
});

/** Quem ficou fora do escopo deixa contato em vez de receber uma trilha que não serve. */
export async function joinWaitlistAction(
  input: { email: string; edition: string; answers: unknown },
): Promise<{ status: 'ok' | 'error'; message: string }> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'E-mail inválido.' };
  }

  await getDb().insert(schema.waitlist).values({
    email: parsed.data.email,
    edition: parsed.data.edition,
    answers: (input.answers ?? {}) as Record<string, unknown>,
  });

  return { status: 'ok', message: 'Contato registrado. Avisamos você quando essa edição abrir.' };
}

export async function startBoardAction(): Promise<void> {
  const user = await requireUser();
  await track('board_started', { userId: user.id, workspaceId: user.workspaceId });
}
