'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { missionById } from '@prospere/content';
import { getDb, schema } from '@/db';
import { requireUser } from '@/lib/auth';
import { track } from '@/lib/telemetry';

/** Toda escrita confere que a missão pertence a uma trilha do workspace (ADR-005). */
async function ownedMission(workspaceId: string, trailMissionId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: schema.trailMissions.id,
      missionId: schema.trailMissions.missionId,
      status: schema.trailMissions.status,
      counter: schema.trailMissions.counter,
      rows: schema.trailMissions.rows,
      trailId: schema.trailMissions.trailId,
    })
    .from(schema.trailMissions)
    .innerJoin(schema.trails, eq(schema.trails.id, schema.trailMissions.trailId))
    .where(
      and(
        eq(schema.trailMissions.id, trailMissionId),
        eq(schema.trails.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!row) throw new Error('Missão não encontrada neste workspace.');
  return row;
}

/** Uma missão só conclui quando os pré-requisitos dela estão concluídos (PRD N-05). */
async function assertUnblocked(trailId: string, missionId: string): Promise<void> {
  const prerequisites = missionById.get(missionId)?.prerequisites ?? [];
  if (prerequisites.length === 0) return;

  const rows = await getDb()
    .select({ missionId: schema.trailMissions.missionId, status: schema.trailMissions.status })
    .from(schema.trailMissions)
    .where(eq(schema.trailMissions.trailId, trailId));

  const done = new Set(rows.filter((r) => r.status === 'done').map((r) => r.missionId));
  const faltando = prerequisites.filter((id) => !done.has(id));
  if (faltando.length > 0) {
    throw new Error(`Conclua antes: ${faltando.join(', ')}.`);
  }
}

export async function completeMissionAction(trailMissionId: string): Promise<void> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);
  await assertUnblocked(row.trailId, row.missionId);

  await getDb()
    .update(schema.trailMissions)
    .set({ status: 'done', completedAt: new Date() })
    .where(eq(schema.trailMissions.id, trailMissionId));

  await track('mission_completed', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { mission_id: row.missionId },
  });

  revalidatePath('/trilha');
  revalidatePath('/hoje');
  revalidatePath(`/missao/${row.missionId}`);
}

export async function undoMissionAction(trailMissionId: string): Promise<void> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);

  await getDb()
    .update(schema.trailMissions)
    .set({ status: 'todo', completedAt: null })
    .where(eq(schema.trailMissions.id, trailMissionId));

  revalidatePath('/trilha');
  revalidatePath('/hoje');
  revalidatePath(`/missao/${row.missionId}`);
}

export async function saveResponseAction(
  trailMissionId: string,
  responseText: Record<string, string>,
): Promise<{ status: 'ok' }> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);

  await getDb()
    .update(schema.trailMissions)
    .set({ responseText, status: row.status === 'done' ? 'done' : 'doing' })
    .where(eq(schema.trailMissions.id, trailMissionId));

  revalidatePath(`/missao/${row.missionId}`);
  return { status: 'ok' };
}

/** Cada registro do contador guarda a data — é o que torna o resultado verificável. */
export async function addCounterEntryAction(
  trailMissionId: string,
  note: string,
): Promise<{ status: 'ok'; count: number }> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);

  const entries = [
    ...((row.counter ?? []) as Array<{ date: string; note: string }>),
    { date: new Date().toISOString().slice(0, 10), note: note.trim() },
  ];

  await getDb()
    .update(schema.trailMissions)
    .set({ counter: entries, status: row.status === 'done' ? 'done' : 'doing' })
    .where(eq(schema.trailMissions.id, trailMissionId));

  revalidatePath(`/missao/${row.missionId}`);
  return { status: 'ok', count: entries.length };
}

/** Linhas das missões do tipo lista (plano de relacionamentos, por exemplo). */
export async function saveRowsAction(
  trailMissionId: string,
  rows: Array<Record<string, string>>,
): Promise<{ status: 'ok'; count: number }> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);

  const limpas = rows.filter((linha) => Object.values(linha).some((valor) => valor.trim() !== ''));

  await getDb()
    .update(schema.trailMissions)
    .set({ rows: limpas, status: row.status === 'done' ? 'done' : 'doing' })
    .where(eq(schema.trailMissions.id, trailMissionId));

  revalidatePath(`/missao/${row.missionId}`);
  return { status: 'ok', count: limpas.length };
}

export async function removeCounterEntryAction(
  trailMissionId: string,
  index: number,
): Promise<{ status: 'ok' }> {
  const user = await requireUser();
  const row = await ownedMission(user.workspaceId, trailMissionId);

  const entries = ((row.counter ?? []) as Array<{ date: string; note: string }>).filter(
    (_, i) => i !== index,
  );

  await getDb()
    .update(schema.trailMissions)
    .set({ counter: entries })
    .where(eq(schema.trailMissions.id, trailMissionId));

  revalidatePath(`/missao/${row.missionId}`);
  return { status: 'ok' };
}
