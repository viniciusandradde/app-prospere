import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { sendEmail, weeklyReviewEmail } from '@/lib/email';
import { safeEqual } from '@/lib/auth';
import { weekStart } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Lembrete da Revisão Semanal (PRD N-08). Pensado para um agendador externo (cron do
 * Dokploy) chamando de hora em hora com o cabeçalho `Authorization: Bearer $CRON_SECRET`.
 * Envia para quem tem lembrete ligado, está no dia/hora escolhidos e ainda não revisou
 * a semana corrente.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ erro: 'CRON_SECRET não configurada.' }, { status: 503 });
  }

  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ') || !safeEqual(header.slice(7), secret)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  const db = getDb();
  const agora = new Date();
  const periodStart = weekStart(agora);

  const candidatos = await db
    .select({
      ritualId: schema.rituals.id,
      weekday: schema.rituals.weekday,
      timeLocal: schema.rituals.timeLocal,
      email: schema.users.email,
    })
    .from(schema.rituals)
    .innerJoin(schema.workspaces, eq(schema.workspaces.id, schema.rituals.workspaceId))
    .innerJoin(schema.users, eq(schema.users.id, schema.workspaces.ownerId))
    .where(
      and(
        eq(schema.rituals.kind, 'weekly_review'),
        eq(schema.rituals.reminder, true),
        eq(schema.rituals.isActive, true),
        isNull(schema.users.deletedAt),
      ),
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  let enviados = 0;

  for (const candidato of candidatos) {
    if (candidato.weekday !== agora.getUTCDay()) continue;
    const hora = Number((candidato.timeLocal ?? '18:00:00').slice(0, 2));
    if (hora !== agora.getUTCHours()) continue;

    const [jaRevisou] = await db
      .select({ id: schema.ritualEntries.id })
      .from(schema.ritualEntries)
      .where(
        and(
          eq(schema.ritualEntries.ritualId, candidato.ritualId),
          eq(schema.ritualEntries.periodStart, periodStart),
        ),
      )
      .limit(1);

    if (jaRevisou) continue;

    const { delivered } = await sendEmail(weeklyReviewEmail(candidato.email, appUrl));
    if (delivered) enviados += 1;
  }

  return NextResponse.json({ candidatos: candidatos.length, enviados });
}
