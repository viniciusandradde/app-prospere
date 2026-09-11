'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { missionById } from '@prospere/content';
import type { TrailResult } from '@prospere/engine';
import { getDb, schema } from '@/db';
import { requireUser } from '@/lib/auth';
import { draft, isAiEnabled, type DraftContext, type DraftTarget } from '@/lib/ai';
import { track } from '@/lib/telemetry';

export interface DraftState {
  status: 'ok' | 'error' | 'needs_consent' | 'unavailable';
  message?: string;
  data?: unknown;
}

const ROTULOS_SITUACAO: Record<string, Record<string, string>> = {
  q04: {
    sem_ideia: 'ainda não sabe o que vender',
    ideia: 'tem a ideia, nada construído',
    prototipo: 'tem protótipo ou versão inicial',
    validado_pagantes: 'já tem clientes pagantes',
  },
  q05: {
    nunca_vendi: 'nunca vendeu por conta própria',
    vendi_pouco: 'já vendeu, de forma irregular',
    vendo_regular: 'vende com regularidade',
    time_de_vendas: 'tem time ou processo de vendas',
  },
};

/**
 * Monta o contexto que vai para a IA — e nada além dele. São as respostas do board e os
 * textos que a própria pessoa escreveu; números vêm do motor, nunca do modelo (ADR-010).
 */
async function buildContext(
  workspaceId: string,
  secoes?: Array<{ id: string; label: string; hint?: string }>,
): Promise<DraftContext | null> {
  const db = getDb();

  const [trailRow] = await db
    .select()
    .from(schema.trails)
    .where(and(eq(schema.trails.workspaceId, workspaceId), eq(schema.trails.isActive, true)))
    .orderBy(desc(schema.trails.createdAt))
    .limit(1);

  if (!trailRow) return null;

  const [boardRow] = await db
    .select()
    .from(schema.boardResponses)
    .where(eq(schema.boardResponses.id, trailRow.boardResponseId))
    .limit(1);

  const plan = trailRow.plan as TrailResult;
  const answers = (boardRow?.answers ?? {}) as Record<string, string>;

  const missionRows = await db
    .select()
    .from(schema.trailMissions)
    .where(eq(schema.trailMissions.trailId, trailRow.id));

  const respostas = missionRows.flatMap((row) => {
    const texto = Object.values((row.responseText ?? {}) as Record<string, string>)
      .filter((valor) => valor.trim() !== '')
      .join('\n');
    if (!texto) return [];
    const titulo = missionById.get(row.missionId)?.title ?? row.missionId;
    return [{ missionId: row.missionId, titulo, texto }];
  });

  const [ofertaRow] = await db
    .select()
    .from(schema.artifacts)
    .where(and(eq(schema.artifacts.workspaceId, workspaceId), eq(schema.artifacts.toolId, 'T-PER-01')))
    .orderBy(desc(schema.artifacts.updatedAt))
    .limit(1);

  return {
    archetype: plan.archetype,
    goal: {
      monthlyTarget: plan.goal.monthlyTarget,
      ticket: plan.goal.ticket,
      salesPerWeek: plan.goal.salesPerWeek,
    },
    situacao: {
      Produto: ROTULOS_SITUACAO.q04?.[answers.q04 ?? ''] ?? '—',
      Vendas: ROTULOS_SITUACAO.q05?.[answers.q05 ?? ''] ?? '—',
    },
    respostas,
    ...(ofertaRow ? { oferta: ofertaRow.data as Record<string, unknown> } : {}),
    ...(secoes ? { secoes } : {}),
  };
}

/** Pede um rascunho. Exige consentimento explícito para enviar o contexto à IA. */
export async function draftAction(
  target: DraftTarget,
  missionId?: string,
): Promise<DraftState> {
  const user = await requireUser();

  if (!isAiEnabled()) {
    return { status: 'unavailable', message: 'A escrita assistida não está ativa neste ambiente.' };
  }

  const db = getDb();
  const [row] = await db
    .select({ aiConsentAt: schema.users.aiConsentAt })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);

  if (!row?.aiConsentAt) {
    return {
      status: 'needs_consent',
      message:
        'Para escrever o rascunho, a IA precisa ler o que você já respondeu nesta trilha. Você autoriza?',
    };
  }

  const secoes =
    target === 'missao.template' && missionId
      ? missionById.get(missionId)?.template?.map((secao) => ({
          id: secao.id,
          label: secao.label,
          ...(secao.hint ? { hint: secao.hint } : {}),
        }))
      : undefined;

  const context = await buildContext(user.workspaceId, secoes);
  if (!context) return { status: 'error', message: 'Gere sua trilha antes de pedir rascunhos.' };

  await track('ai_draft_requested', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { target, mission_id: missionId ?? null },
  });

  const resultado = await draft(target, context);
  if (!resultado.ok) {
    return { status: 'error', message: resultado.error };
  }

  return { status: 'ok', data: resultado.data };
}

/** Registra o que a pessoa fez com o rascunho — é assim que medimos se a IA ajuda. */
export async function recordDraftOutcomeAction(
  target: DraftTarget,
  outcome: 'accepted' | 'edited' | 'discarded',
): Promise<void> {
  const user = await requireUser();
  await track('ai_draft_resolved', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { target, outcome },
  });
}

export async function setAiConsentAction(granted: boolean): Promise<{ status: 'ok' }> {
  const user = await requireUser();
  await getDb()
    .update(schema.users)
    .set({ aiConsentAt: granted ? new Date() : null })
    .where(eq(schema.users.id, user.id));
  revalidatePath('/conta');
  return { status: 'ok' };
}
