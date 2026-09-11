import { z } from 'zod';
import type { Tool } from '../types';
import { DECISIONS, DECISION_LABELS } from './quadro-cma';

/**
 * T-ORG-07 · Revisão Semanal (ciclo AAA: Autoconhecimento → Ação → Análise).
 * Regra do PRD (N-08): a cada 4ª revisão entra o bloco Pivotar/Perseverar.
 */
export const numerosSchema = z.object({
  contatos: z.number().nonnegative().default(0),
  conversas: z.number().nonnegative().default(0),
  propostas: z.number().nonnegative().default(0),
  vendas: z.number().nonnegative().default(0),
  receita: z.number().nonnegative().default(0),
});

export const pivotBlockSchema = z.object({
  decisao: z.enum(DECISIONS),
  motivo: z.string().min(10, 'A decisão precisa de um motivo apoiado nos números.'),
  proximo_experimento: z.string().default(''),
});

export const revisaoSemanalSchema = z
  .object({
    /** Segunda-feira da semana revisada, em ISO (YYYY-MM-DD). */
    period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
    vitorias: z.array(z.string()).max(3).default(['', '', '']),
    fuga_de_responsabilidade: z.string().default(''),
    numeros: numerosSchema.default(() => numerosSchema.parse({})),
    aprendizado: z.string().default(''),
    prioridades_proxima: z.array(z.string()).max(3).default(['', '', '']),
    /** Número da semana comparado à meta da trilha. */
    numero_da_semana: z.number().nonnegative().default(0),
    meta_da_semana: z.number().nonnegative().default(0),
    pivot: pivotBlockSchema.nullable().default(null),
  })
  .superRefine((revisao, ctx) => {
    const vitorias = revisao.vitorias.filter((v) => v.trim() !== '');
    if (vitorias.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['vitorias'],
        message: 'Escreva pelo menos 1 vitória da semana.',
      });
    }
    const prioridades = revisao.prioridades_proxima.filter((p) => p.trim() !== '');
    if (prioridades.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['prioridades_proxima'],
        message: 'A revisão só fecha com pelo menos 1 prioridade para a próxima semana.',
      });
    }
  });

export type RevisaoSemanal = z.infer<typeof revisaoSemanalSchema>;

export const revisaoSemanalTool: Tool = {
  id: 'T-ORG-07',
  phaseId: 'PRQ',
  name: 'Revisão Semanal',
  description:
    '30 minutos por semana: 3 vitórias, 1 fuga de responsabilidade, os números, o aprendizado e as 3 prioridades. A cada 4 semanas, a decisão de pivotar ou perseverar.',
  schemaVersion: 1,
  outputKind: 'tracker',
  slug: 'revisao',
};

/** A cada 4ª revisão (1-indexada) entra o bloco Pivotar/Perseverar. */
export function requiresPivotBlock(reviewNumber: number): boolean {
  return reviewNumber > 0 && reviewNumber % 4 === 0;
}

export function emptyRevisao(periodStart: string): RevisaoSemanal {
  return {
    period_start: periodStart,
    vitorias: ['', '', ''],
    fuga_de_responsabilidade: '',
    numeros: { contatos: 0, conversas: 0, propostas: 0, vendas: 0, receita: 0 },
    aprendizado: '',
    prioridades_proxima: ['', '', ''],
    numero_da_semana: 0,
    meta_da_semana: 0,
    pivot: null,
  };
}

/**
 * Streak = semanas consecutivas revisadas. Recebe as datas de início de período em ISO,
 * em qualquer ordem, e conta para trás a partir da semana mais recente.
 */
export function computeStreak(periodStarts: string[]): number {
  if (periodStarts.length === 0) return 0;
  const ordenadas = [...new Set(periodStarts)].sort().reverse();
  let streak = 1;
  for (let i = 1; i < ordenadas.length; i += 1) {
    const atual = new Date(`${ordenadas[i - 1]}T00:00:00Z`).getTime();
    const anterior = new Date(`${ordenadas[i]}T00:00:00Z`).getTime();
    const diffDias = Math.round((atual - anterior) / 86_400_000);
    if (diffDias === 7) streak += 1;
    else break;
  }
  return streak;
}

const dataBR = (iso: string): string => iso.split('-').reverse().join('/');

export function renderRevisao(data: RevisaoSemanal): string {
  const vitorias = data.vitorias.filter((v) => v.trim() !== '');
  const prioridades = data.prioridades_proxima.filter((p) => p.trim() !== '');
  const linhas: string[] = [
    `# Revisão da semana de ${dataBR(data.period_start)}`,
    '',
    '## Autoconhecimento',
    '',
    ...(vitorias.length > 0 ? vitorias.map((v, i) => `${i + 1}. ${v}`) : ['_Sem vitórias registradas._']),
    '',
  ];
  if (data.fuga_de_responsabilidade) {
    linhas.push(`**Onde eu fugi da responsabilidade:** ${data.fuga_de_responsabilidade}`, '');
  }
  linhas.push(
    '## Análise',
    '',
    '| Número | Semana |',
    '|:--|--:|',
    `| Contatos | ${data.numeros.contatos} |`,
    `| Conversas | ${data.numeros.conversas} |`,
    `| Propostas | ${data.numeros.propostas} |`,
    `| Vendas | ${data.numeros.vendas} |`,
    `| Receita | ${data.numeros.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} |`,
    '',
    `**Número da semana:** ${data.numero_da_semana} (meta: ${data.meta_da_semana})`,
    '',
  );
  if (data.aprendizado) linhas.push(`**Aprendizado:** ${data.aprendizado}`, '');
  linhas.push(
    '## Ação',
    '',
    ...(prioridades.length > 0
      ? prioridades.map((p, i) => `${i + 1}. ${p}`)
      : ['_Sem prioridades definidas._']),
    '',
  );
  if (data.pivot) {
    linhas.push(
      '## Pivotar ou perseverar',
      '',
      `**Decisão:** ${DECISION_LABELS[data.pivot.decisao]}`,
      '',
      data.pivot.motivo,
      '',
    );
    if (data.pivot.proximo_experimento) {
      linhas.push(`**Próximo experimento:** ${data.pivot.proximo_experimento}`, '');
    }
  }
  linhas.push('---', '', '_Gerado pelo PROSPERE._');
  return linhas.join('\n');
}
