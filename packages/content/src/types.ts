/**
 * Tipos do catálogo. O conteúdo é código (ADR-003): missões, ferramentas e livros vivem
 * aqui, versionados no Git, e não em CMS ou tabelas de catálogo.
 */

/** Fases da edição Negócio. `PRQ` condensa Preparar + Organizar (PRD Negócio, seção 7). */
export const PHASE_IDS = ['PRQ', 'RUM', 'SON', 'PER', 'ENG', 'REN'] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

export type Archetype = 'A3' | 'A4';

/** Como o usuário entrega o resultado da missão. */
export type MissionKind =
  | 'checklist' // pré-requisito: marca como feito
  | 'template' // campo de resposta guiado por template
  | 'counter' // contador com registro datado
  | 'tool' // uma das 3 ferramentas do MVP
  | 'external'; // template externo (planilha, página de captura)

export type Recurrence = 'daily' | 'weekly' | 'monthly';

export interface MissionTemplateSection {
  /** Chave estável usada no artefato de texto salvo. */
  id: string;
  label: string;
  hint?: string;
}

export interface MissionCounter {
  /** O que se conta: entrevistas, conversas, encontros, dias de rotina. */
  unit: string;
  target: number;
  /** Cada registro guarda data + nota curta. */
  noteLabel: string;
}

export interface Mission {
  id: string;
  phaseId: PhaseId;
  title: string;
  objective: string;
  steps: string[];
  /** Resultado verificável — toda missão tem um (CONTRIBUTING.md). */
  result: string;
  /**
   * Horas estimadas já expandidas para a janela de 4 semanas do MVP: missões recorrentes
   * somam o total do período (ex.: REN-02, 1 h/dia útil × 4 semanas = 20 h).
   */
  effortHours: number;
  recurring?: Recurrence;
  kind: MissionKind;
  toolId?: ToolId;
  template?: MissionTemplateSection[];
  counter?: MissionCounter;
  /** Ferramenta externa sugerida (planilha, página de captura). */
  external?: string;
  /** Crédito visível ao usuário — apenas livros publicados. */
  credit?: string;
  /** Missões que precisam estar concluídas antes desta. */
  prerequisites?: string[];
}

export const TOOL_IDS = ['T-SON-03', 'T-PER-01', 'T-ORG-07'] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export interface Tool {
  id: ToolId;
  phaseId: PhaseId;
  name: string;
  description: string;
  /** Versão do schema Zod gravada no artefato (ADR-002). */
  schemaVersion: number;
  outputKind: 'document' | 'board' | 'tracker';
  slug: string;
}

export interface Phase {
  id: PhaseId;
  position: number;
  name: string;
  question: string;
  objective: string;
  credit?: string;
}

export interface Book {
  id: string;
  title: string;
  authors: string;
  thesis: string;
  usedIn: PhaseId[];
}
