import { NextResponse } from 'next/server';
import {
  missionById,
  ofertaSchema,
  quadroCmaSchema,
  renderOferta,
  renderQuadroCma,
  renderRevisao,
  revisaoSemanalSchema,
} from '@prospere/content';
import { currentUser } from '@/lib/auth';
import { getActiveTrail, getArtifact, getWeeklyRitual, toMissionViews } from '@/lib/queries';
import { track } from '@/lib/telemetry';
import { brl, dataBR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Exportação em Markdown (PRD N-09): um clique, arquivo legível fora do app. */
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse('Não autenticado.', { status: 401 });

  const tipo = new URL(request.url).searchParams.get('tipo') ?? 'tudo';
  const partes: string[] = [];

  if (tipo === 'trilha' || tipo === 'tudo') {
    const trilha = await renderTrilha(user.workspaceId);
    if (trilha) partes.push(trilha);
  }

  if (tipo === 'quadro' || tipo === 'tudo') {
    const artifact = await getArtifact(user.workspaceId, 'T-SON-03');
    const parsed = quadroCmaSchema.safeParse(artifact?.data ?? { cards: [] });
    if (parsed.success && parsed.data.cards.length > 0) partes.push(renderQuadroCma(parsed.data));
  }

  if (tipo === 'oferta' || tipo === 'tudo') {
    const artifact = await getArtifact(user.workspaceId, 'T-PER-01');
    if (artifact) {
      const parsed = ofertaSchema.safeParse(artifact.data);
      if (parsed.success) partes.push(renderOferta(parsed.data));
    }
  }

  if (tipo === 'revisoes' || tipo === 'tudo') {
    const ritual = await getWeeklyRitual(user.workspaceId);
    for (const entry of ritual?.entries ?? []) {
      const parsed = revisaoSemanalSchema.safeParse(entry.data);
      if (parsed.success) partes.push(renderRevisao(parsed.data));
    }
  }

  if (partes.length === 0) {
    partes.push('# PROSPERE\n\nAinda não há nada para exportar.');
  }

  await track('export_done', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { tipo },
  });

  return new NextResponse(partes.join('\n\n---\n\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="prospere-${tipo}.md"`,
    },
  });
}

async function renderTrilha(workspaceId: string): Promise<string | null> {
  const trail = await getActiveTrail(workspaceId);
  if (!trail) return null;

  const views = toMissionViews(trail);
  const statusById = new Map(views.map((view) => [view.id, view.row.status]));
  const { plan } = trail;

  const linhas: string[] = [
    '# Minha trilha PROSPERE',
    '',
    `**Ponto de partida:** ${plan.archetypeLabel}`,
    '',
    plan.explanation.intro,
    '',
    plan.explanation.goal,
    '',
    plan.explanation.launchKind,
    '',
    `**Meta:** ${brl(plan.goal.monthlyTarget)} por mês · ticket ${brl(plan.goal.ticket)} · ${plan.goal.salesPerWeek} vendas por semana`,
    `**Estimativa:** ${plan.estimate.weeks} semanas a ${plan.estimate.hoursPerWeek} h por semana (${plan.estimate.totalHours} h no total)`,
    '',
  ];

  if (plan.explanation.adjustments.length > 0) {
    linhas.push('## Por que a trilha é assim', '');
    for (const adjustment of plan.explanation.adjustments) linhas.push(`- ${adjustment.why}`);
    linhas.push('');
  }

  for (const phase of plan.phases) {
    linhas.push(`## ${phase.name} — ${phase.question}`, '', `_Estimativa: ${phase.estWeeks} semanas._`, '');
    for (const missionId of phase.missionIds) {
      const mission = missionById.get(missionId);
      if (!mission) continue;
      const marca = statusById.get(missionId) === 'done' ? 'x' : ' ';
      linhas.push(`- [${marca}] **${mission.title}** (${mission.id}) — ${mission.result}`);
    }
    linhas.push('');
  }

  linhas.push(
    '---',
    '',
    `_Exportado do PROSPERE em ${dataBR(new Date().toISOString().slice(0, 10))}. Números são referência inicial — calibre com seus dados._`,
  );
  return linhas.join('\n');
}
