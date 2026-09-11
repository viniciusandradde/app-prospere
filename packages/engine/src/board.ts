import { z } from 'zod';
// A fonte da verdade das regras é o seed versionado, importado como dado.
import boardJson from '../../../seed/board.negocio.json';

/**
 * O board é dado versionado (`seed/board.negocio.json`), não código: as regras de trilha
 * moram lá e o motor as interpreta (ADR-001 — determinístico e auditável).
 */

export const ARCHETYPES = ['A3', 'A4'] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export const GATE_VALUES = ['OUT_ESCALAR', 'OUT_PESSOAL'] as const;
export type GateValue = (typeof GATE_VALUES)[number];

export const boardAnswersSchema = z.object({
  q01: z.enum(['A3', 'A4', ...GATE_VALUES]),
  q02: z.enum(['primeiras_vendas', 'crescer_faturamento', 'previsibilidade', 'novo_produto']),
  q03: z.object({
    valor: z.number().positive('Informe o faturamento mensal alvo.'),
    ticket: z.number().positive('Informe o preço médio do que você vende.'),
    prazo_meses: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  }),
  q04: z.enum(['sem_ideia', 'ideia', 'prototipo', 'validado_pagantes']),
  q05: z.enum(['nunca_vendi', 'vendi_pouco', 'vendo_regular', 'time_de_vendas']),
  /** Tamanho da audiência (valor representativo da faixa escolhida). */
  q06: z.number().nonnegative(),
  /** Horas por semana disponíveis (valor representativo da faixa escolhida). */
  q07: z.number().positive(),
});

export type BoardAnswers = z.infer<typeof boardAnswersSchema>;

/** Respostas parciais durante o preenchimento (uma pergunta por tela). */
export const partialBoardAnswersSchema = boardAnswersSchema.partial();
export type PartialBoardAnswers = z.infer<typeof partialBoardAnswersSchema>;

export interface BoardAdjustment {
  id: string;
  when: Record<string, unknown>;
  effects: Array<Record<string, unknown>>;
  why: string;
}

export interface BoardFile {
  board_version: string;
  edition: string;
  phases_order: string[];
  phases: Record<string, { name: string; question: string; status?: string; note?: string }>;
  questions: unknown[];
  gates: Record<string, { action: string; edition: string; message: string }>;
  archetype_rules: {
    primary: string;
    overrides: Array<{ id: string; when: Record<string, unknown>; archetype: Archetype; why: string }>;
    labels: Record<string, string>;
  };
  prerequisites: { missions: string[]; ritual: string; note: string };
  quick_start: {
    note: string;
    default: { missions: string[]; why: string };
    overrides: Array<{ id: string; when: Record<string, unknown>; missions: string[]; why: string }>;
  };
  missions_by_archetype: Record<string, string[]>;
  mission_bindings: {
    tools: Record<string, string>;
    response_templates: string[];
    lists: string[];
    external_hints: Record<string, string>;
    counters_only: string[];
  };
  adjustments: BoardAdjustment[];
  goal: { metric_by_objective: Record<string, string>; decomposition: string };
  estimation: Record<string, string>;
  explanation_templates: {
    intro: Record<string, string>;
    goal: string;
    launch_kind: Record<string, string>;
  };
}

export const board = boardJson as unknown as BoardFile;
export const BOARD_VERSION = board.board_version;

/** Conversão estimada usada para decompor a meta — referência inicial, calibrável. */
export const REFERENCE_CONVERSION = 0.05;
/** Semanas por mês usadas na decomposição da meta (`seed/board.negocio.json`). */
export const WEEKS_PER_MONTH = 4.33;
/** Janela de 4 semanas usada para estimar o esforço das missões recorrentes. */
export const RECURRING_WINDOW_WEEKS = 4;

export const gateForAnswer = (q01: string): GateValue | null =>
  q01 === 'OUT_ESCALAR' || q01 === 'OUT_PESSOAL' ? q01 : null;

export function gateConfig(gate: GateValue): { action: string; edition: string; message: string } {
  const key = gate === 'OUT_ESCALAR' ? 'waitlist_escalar' : 'waitlist_pessoal';
  const config = board.gates[key];
  if (!config) throw new Error(`Gate ${key} ausente do board ${board.board_version}.`);
  return config;
}
