import 'server-only';
import { and, asc, desc, eq } from 'drizzle-orm';
import { missionById, type Mission } from '@prospere/content';
import type { TrailResult } from '@prospere/engine';
import { getDb, schema } from '@/db';

export interface TrailMissionRow {
  id: string;
  missionId: string;
  position: number;
  status: string;
  completedAt: Date | null;
  responseText: Record<string, string>;
  counter: Array<{ date: string; note: string }>;
}

export interface ActiveTrail {
  id: string;
  plan: TrailResult;
  goalMetricName: string;
  goalMetricValue: number | null;
  hoursPerWeek: number;
  essentialMode: boolean;
  missions: TrailMissionRow[];
}

/** A trilha ativa do workspace, com o snapshot do plano gerado pelo motor. */
export async function getActiveTrail(workspaceId: string): Promise<ActiveTrail | null> {
  const db = getDb();
  const [trail] = await db
    .select()
    .from(schema.trails)
    .where(and(eq(schema.trails.workspaceId, workspaceId), eq(schema.trails.isActive, true)))
    .orderBy(desc(schema.trails.createdAt))
    .limit(1);

  if (!trail) return null;

  const missions = await db
    .select()
    .from(schema.trailMissions)
    .where(eq(schema.trailMissions.trailId, trail.id))
    .orderBy(asc(schema.trailMissions.position));

  return {
    id: trail.id,
    plan: trail.plan as TrailResult,
    goalMetricName: trail.goalMetricName,
    goalMetricValue: trail.goalMetricValue === null ? null : Number(trail.goalMetricValue),
    hoursPerWeek: Number(trail.hoursPerWeek),
    essentialMode: trail.essentialMode,
    missions: missions.map((row) => ({
      id: row.id,
      missionId: row.missionId,
      position: row.position,
      status: row.status,
      completedAt: row.completedAt,
      responseText: (row.responseText ?? {}) as Record<string, string>,
      counter: (row.counter ?? []) as Array<{ date: string; note: string }>,
    })),
  };
}

export interface MissionView extends Mission {
  row: TrailMissionRow;
  /** Pré-requisitos ainda não concluídos — a missão fica bloqueada enquanto houver. */
  blockedBy: string[];
  counterCount: number;
  /** Entrou por uma regra de ajuste do board, não pela trilha base do arquétipo. */
  optional: boolean;
}

/** Junta o catálogo (código) com o estado do usuário (banco). */
export function toMissionViews(trail: ActiveTrail): MissionView[] {
  const doneIds = new Set(
    trail.missions.filter((m) => m.status === 'done').map((m) => m.missionId),
  );
  const optionalIds = new Set(
    trail.plan.missions.filter((m) => m.optional).map((m) => m.id),
  );

  return trail.missions.flatMap((row) => {
    const mission = missionById.get(row.missionId);
    if (!mission) return [];
    const blockedBy = (mission.prerequisites ?? []).filter((id) => !doneIds.has(id));
    return [
      {
        ...mission,
        row,
        blockedBy,
        counterCount: row.counter.length,
        optional: optionalIds.has(row.missionId),
      },
    ];
  });
}

export interface PhaseProgress {
  id: string;
  name: string;
  question: string;
  estWeeks: number;
  total: number;
  done: number;
  percent: number;
  missions: MissionView[];
}

export function phaseProgress(trail: ActiveTrail, views: MissionView[]): PhaseProgress[] {
  const byId = new Map(views.map((view) => [view.id, view]));
  return trail.plan.phases.map((phase) => {
    const missions = phase.missionIds.flatMap((id) => {
      const view = byId.get(id);
      return view ? [view] : [];
    });
    const done = missions.filter((m) => m.row.status === 'done').length;
    return {
      id: phase.id,
      name: phase.name,
      question: phase.question,
      estWeeks: phase.estWeeks,
      total: missions.length,
      done,
      percent: missions.length === 0 ? 0 : Math.round((done / missions.length) * 100),
      missions,
    };
  });
}

/** A próxima missão: a primeira não concluída e não bloqueada. */
export function nextMission(views: MissionView[]): MissionView | null {
  return views.find((view) => view.row.status !== 'done' && view.blockedBy.length === 0) ?? null;
}

export async function getArtifact(workspaceId: string, toolId: string) {
  const db = getDb();
  const [artifact] = await db
    .select()
    .from(schema.artifacts)
    .where(and(eq(schema.artifacts.workspaceId, workspaceId), eq(schema.artifacts.toolId, toolId)))
    .orderBy(desc(schema.artifacts.updatedAt))
    .limit(1);
  return artifact ?? null;
}

export async function getWeeklyRitual(workspaceId: string) {
  const db = getDb();
  const [ritual] = await db
    .select()
    .from(schema.rituals)
    .where(
      and(eq(schema.rituals.workspaceId, workspaceId), eq(schema.rituals.kind, 'weekly_review')),
    )
    .limit(1);
  if (!ritual) return null;

  const entries = await db
    .select()
    .from(schema.ritualEntries)
    .where(eq(schema.ritualEntries.ritualId, ritual.id))
    .orderBy(desc(schema.ritualEntries.periodStart));

  return { ritual, entries };
}
