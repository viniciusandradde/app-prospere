import { z } from 'zod';
import type { Tool } from '../types';

/**
 * T-SON-03 · Quadro Construir-Medir-Aprender.
 * Regra do PRD (N-06): um cartão não vai para "Rodando" sem critério de sucesso, e o prazo
 * do experimento não passa de 14 dias.
 */
export const CMA_COLUMNS = ['a_testar', 'rodando', 'medido', 'aprendido'] as const;
export type CmaColumn = (typeof CMA_COLUMNS)[number];

export const CMA_COLUMN_LABELS: Record<CmaColumn, string> = {
  a_testar: 'A testar',
  rodando: 'Rodando',
  medido: 'Medido',
  aprendido: 'Aprendido',
};

export const DECISIONS = ['perseverar', 'ajustar', 'pivotar'] as const;
export const DECISION_LABELS: Record<(typeof DECISIONS)[number], string> = {
  perseverar: 'Perseverar',
  ajustar: 'Ajustar',
  pivotar: 'Pivotar',
};

export const cmaCardSchema = z
  .object({
    id: z.string().min(1),
    hipotese: z.string().min(10, 'Escreva a hipótese como uma afirmação que pode ser derrubada.'),
    experimento: z.string().default(''),
    metrica: z.string().default(''),
    criterio_sucesso: z.string().default(''),
    prazo: z.string().default(''),
    resultado: z.string().default(''),
    aprendizado: z.string().default(''),
    decisao: z.enum(DECISIONS).nullable().default(null),
    coluna: z.enum(CMA_COLUMNS).default('a_testar'),
  })
  .superRefine((card, ctx) => {
    const rodandoOuDepois = card.coluna !== 'a_testar';
    if (rodandoOuDepois && card.criterio_sucesso.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['criterio_sucesso'],
        message: 'Defina o critério de sucesso antes de rodar o experimento.',
      });
    }
    if (rodandoOuDepois && card.metrica.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['metrica'],
        message: 'Defina a métrica antes de rodar o experimento.',
      });
    }
    if (card.coluna === 'aprendido' && card.decisao === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['decisao'],
        message: 'Um cartão aprendido precisa de uma decisão: perseverar, ajustar ou pivotar.',
      });
    }
  });

export const quadroCmaSchema = z.object({
  cards: z.array(cmaCardSchema).default([]),
});

export type CmaCard = z.infer<typeof cmaCardSchema>;
export type QuadroCma = z.infer<typeof quadroCmaSchema>;

export const quadroCmaTool: Tool = {
  id: 'T-SON-03',
  phaseId: 'SON',
  name: 'Quadro Construir-Medir-Aprender',
  description:
    'Cada aposta vira um cartão com métrica e critério de sucesso definidos antes de rodar. O cartão atravessa A testar → Rodando → Medido → Aprendido e termina em uma decisão.',
  schemaVersion: 1,
  outputKind: 'board',
  slug: 'quadro',
};

export function emptyCard(id: string, hipotese = ''): CmaCard {
  return {
    id,
    hipotese,
    experimento: '',
    metrica: '',
    criterio_sucesso: '',
    prazo: '',
    resultado: '',
    aprendizado: '',
    decisao: null,
    coluna: 'a_testar',
  };
}

export function renderQuadroCma(data: QuadroCma): string {
  const linhas: string[] = ['# Quadro Construir-Medir-Aprender', ''];
  for (const coluna of CMA_COLUMNS) {
    const cards = data.cards.filter((c) => c.coluna === coluna);
    linhas.push(`## ${CMA_COLUMN_LABELS[coluna]} (${cards.length})`, '');
    if (cards.length === 0) {
      linhas.push('_Nenhum cartão nesta coluna._', '');
      continue;
    }
    for (const card of cards) {
      linhas.push(`### ${card.hipotese}`, '');
      if (card.experimento) linhas.push(`- **Experimento:** ${card.experimento}`);
      if (card.metrica) linhas.push(`- **Métrica:** ${card.metrica}`);
      if (card.criterio_sucesso) linhas.push(`- **Critério de sucesso:** ${card.criterio_sucesso}`);
      if (card.prazo) linhas.push(`- **Prazo:** ${card.prazo}`);
      if (card.resultado) linhas.push(`- **Resultado:** ${card.resultado}`);
      if (card.aprendizado) linhas.push(`- **Aprendizado:** ${card.aprendizado}`);
      if (card.decisao) linhas.push(`- **Decisão:** ${DECISION_LABELS[card.decisao]}`);
      linhas.push('');
    }
  }
  linhas.push('---', '', '_Gerado pelo PROSPERE. Método: A Startup Enxuta (Eric Ries)._');
  return linhas.join('\n');
}
