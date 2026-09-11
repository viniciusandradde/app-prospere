import {
  missionById,
  phases as catalogPhases,
  PREREQUISITE_MISSION_IDS,
  RITUAL_MISSION_ID,
  type Mission,
  type PhaseId,
} from '@prospere/content';
import {
  board as defaultBoard,
  boardAnswersSchema,
  gateConfig,
  gateForAnswer,
  REFERENCE_CONVERSION,
  WEEKS_PER_MONTH,
  type Archetype,
  type BoardAdjustment,
  type BoardAnswers,
  type BoardFile,
  type GateValue,
} from './board';

export interface GoalBreakdown {
  /** Nome da métrica que importa, derivado do objetivo (q02). */
  metricName: string;
  monthlyTarget: number;
  ticket: number;
  deadlineMonths: number;
  salesPerWeek: number;
  contactsPerWeek: number;
  /** Conversão usada na decomposição — referência inicial, calibrável pelo usuário. */
  assumedConversion: number;
}

export type LaunchKind = 'seed' | 'internal';

export interface TrailMission extends Mission {
  position: number;
  /** Entrou por uma regra de ajuste, e não pela trilha base do arquétipo. */
  optional: boolean;
  /** Regra que trouxe esta missão, quando aplicável. */
  addedBy?: string;
  /** Missões que precisam estar concluídas antes desta. */
  blockedBy: string[];
}

export interface TrailPhase {
  id: PhaseId;
  position: number;
  name: string;
  question: string;
  objective: string;
  credit?: string;
  missionIds: string[];
  effortHours: number;
  estWeeks: number;
}

export interface AppliedAdjustment {
  id: string;
  why: string;
}

export interface TrailExplanation {
  intro: string;
  goal: string;
  launchKind: string;
  adjustments: AppliedAdjustment[];
}

export interface QuickStart {
  /** As missões da primeira semana, na ordem em que devem ser feitas. */
  missionIds: string[];
  why: string;
}

export interface Gate {
  value: GateValue;
  edition: string;
  message: string;
}

export interface GateResult {
  kind: 'gate';
  boardVersion: string;
  gate: Gate;
}

export interface TrailResult {
  kind: 'trail';
  boardVersion: string;
  archetype: Archetype;
  archetypeLabel: string;
  goal: GoalBreakdown;
  launchKind: LaunchKind;
  essentialMode: boolean;
  adjustments: AppliedAdjustment[];
  prerequisiteMissionIds: string[];
  ritualMissionId: string;
  quickStart: QuickStart;
  phases: TrailPhase[];
  missions: TrailMission[];
  estimate: { totalHours: number; weeks: number; hoursPerWeek: number };
  explanation: TrailExplanation;
}

export type GenerateTrailResult = TrailResult | GateResult;

const round = (value: number, step: number): number => Math.round(value / step) * step;

/** Arredonda para meia semana, com mínimo de 1 (`seed/board.negocio.json`, `estimation`). */
const weeksFor = (hours: number, hoursPerWeek: number): number =>
  Math.max(1, round(hours / hoursPerWeek, 0.5));

/** Aplica o override ARC-VALIDATED: quem já tem clientes pagantes está em operação. */
export function resolveArchetype(answers: BoardAnswers, board: BoardFile = defaultBoard): Archetype {
  for (const override of board.archetype_rules.overrides) {
    const matches = Object.entries(override.when).every(
      ([key, expected]) => (answers as Record<string, unknown>)[key] === expected,
    );
    if (matches) return override.archetype;
  }
  return answers.q01 as Archetype;
}

export function decomposeGoal(answers: BoardAnswers, board: BoardFile = defaultBoard): GoalBreakdown {
  const { valor, ticket, prazo_meses } = answers.q03;
  const salesPerWeek = Math.ceil(valor / ticket / WEEKS_PER_MONTH);
  const contactsPerWeek = Math.ceil(salesPerWeek / REFERENCE_CONVERSION);
  return {
    metricName: board.goal.metric_by_objective[answers.q02] ?? 'faturamento mensal',
    monthlyTarget: valor,
    ticket,
    deadlineMonths: prazo_meses,
    salesPerWeek,
    contactsPerWeek,
    assumedConversion: REFERENCE_CONVERSION,
  };
}

interface AdjustmentContext {
  answers: BoardAnswers;
  archetype: Archetype;
}

/** Interpreta as condições declaradas no seed, para que as regras fiquem versionadas fora do código. */
function matchesCondition(when: Record<string, unknown>, ctx: AdjustmentContext): boolean {
  return Object.entries(when).every(([key, expected]) => {
    const answers = ctx.answers as unknown as Record<string, unknown>;
    if (key === 'archetype') return ctx.archetype === expected;
    if (key.endsWith('_in')) {
      const field = key.slice(0, -3);
      return Array.isArray(expected) && expected.includes(answers[field]);
    }
    if (key.endsWith('_gte')) {
      const field = key.slice(0, -4);
      return Number(answers[field]) >= Number(expected);
    }
    if (key.endsWith('_lte')) {
      const field = key.slice(0, -4);
      return Number(answers[field]) <= Number(expected);
    }
    if (key.endsWith('_lt')) {
      const field = key.slice(0, -3);
      return Number(answers[field]) < Number(expected);
    }
    return answers[key] === expected;
  });
}

interface AdjustmentOutcome {
  applied: AppliedAdjustment[];
  missionIds: string[];
  addedBy: Map<string, string>;
  launchKind: LaunchKind;
  essentialMode: boolean;
}

function applyAdjustments(
  baseMissionIds: string[],
  ctx: AdjustmentContext,
  board: BoardFile,
): AdjustmentOutcome {
  const missionIds = [...baseMissionIds];
  const addedBy = new Map<string, string>();
  const applied: AppliedAdjustment[] = [];
  let launchKind: LaunchKind = 'seed';
  let essentialMode = false;

  // O índice da âncora é recalculado a cada inserção: inserir antes desloca a própria âncora.
  const insert = (ids: string[], anchor: string | undefined, before: boolean) => {
    let inserted = 0;
    for (const id of ids) {
      if (missionIds.includes(id)) continue;
      const anchorAt = anchor ? missionIds.indexOf(anchor) : -1;
      const at =
        anchorAt === -1 ? missionIds.length : before ? anchorAt : anchorAt + 1 + inserted;
      missionIds.splice(at, 0, id);
      inserted += 1;
    }
  };

  for (const adjustment of board.adjustments as BoardAdjustment[]) {
    if (!matchesCondition(adjustment.when, ctx)) continue;
    applied.push({ id: adjustment.id, why: adjustment.why });

    for (const effect of adjustment.effects) {
      const add = effect.add_missions as { ids: string[]; before?: string; after?: string } | undefined;
      if (add) {
        insert(add.ids, add.before ?? add.after, Boolean(add.before));
        for (const id of add.ids) addedBy.set(id, adjustment.id);
      }
      const flag = effect.set_flag as { launch_kind?: LaunchKind } | undefined;
      if (flag?.launch_kind) launchKind = flag.launch_kind;
      if (effect.essential_mode === true) essentialMode = true;
    }
  }

  return { applied, missionIds, addedBy, launchKind, essentialMode };
}

/**
 * O começo da trilha. A regra mora no seed; aqui só interpretamos e filtramos pelo que
 * realmente está na trilha da pessoa — indicar missão que ela não tem seria mentira.
 */
function resolveQuickStart(
  ctx: AdjustmentContext,
  missionIds: string[],
  board: BoardFile,
): QuickStart {
  const regra =
    board.quick_start.overrides.find((override) => matchesCondition(override.when, ctx)) ??
    board.quick_start.default;

  const disponiveis = new Set(missionIds);
  return {
    missionIds: regra.missions.filter((id) => disponiveis.has(id)),
    why: regra.why,
  };
}

function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const brl = (value: number): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Gera a trilha a partir das respostas do board. Função pura: mesma entrada, mesma saída
 * (ADR-001). A IA, quando entrar na v1.1, apenas reescreve a explicação — nunca decide.
 */
export function generateTrail(
  rawAnswers: unknown,
  board: BoardFile = defaultBoard,
): GenerateTrailResult {
  const answers = boardAnswersSchema.parse(rawAnswers);

  const gateValue = gateForAnswer(answers.q01);
  if (gateValue) {
    const config = gateConfig(gateValue);
    return {
      kind: 'gate',
      boardVersion: board.board_version,
      gate: { value: gateValue, edition: config.edition, message: config.message },
    };
  }

  const archetype = resolveArchetype(answers, board);
  const baseMissionIds = board.missions_by_archetype[archetype] ?? [];
  const ctx: AdjustmentContext = { answers, archetype };
  const outcome = applyAdjustments(baseMissionIds, ctx, board);

  const hoursPerWeek = answers.q07;
  const prerequisiteIds = [...PREREQUISITE_MISSION_IDS];

  const missions: TrailMission[] = outcome.missionIds.map((id, index) => {
    const mission = missionById.get(id);
    if (!mission) throw new Error(`Missão ${id} referenciada no board e ausente do catálogo.`);
    const addedBy = outcome.addedBy.get(id);
    return {
      ...mission,
      position: index + 1,
      optional: Boolean(addedBy),
      ...(addedBy ? { addedBy } : {}),
      blockedBy: mission.prerequisites ?? [],
    };
  });

  const prerequisiteHours = prerequisiteIds.reduce(
    (total, id) => total + (missionById.get(id)?.effortHours ?? 0),
    0,
  );
  const ritualHours = missionById.get(RITUAL_MISSION_ID)?.effortHours ?? 0;

  const trailPhases: TrailPhase[] = catalogPhases
    .map((phase) => {
      const missionIds =
        phase.id === 'PRQ'
          ? [...prerequisiteIds, RITUAL_MISSION_ID]
          : missions.filter((m) => m.phaseId === phase.id).map((m) => m.id);
      const effortHours =
        phase.id === 'PRQ'
          ? prerequisiteHours + ritualHours
          : missions
              .filter((m) => m.phaseId === phase.id)
              .reduce((total, m) => total + m.effortHours, 0);
      return {
        id: phase.id,
        position: phase.position,
        name: phase.name,
        question: phase.question,
        objective: phase.objective,
        ...(phase.credit ? { credit: phase.credit } : {}),
        missionIds,
        effortHours,
        estWeeks: outcome.essentialMode
          ? Math.max(1, missionIds.length)
          : weeksFor(effortHours, hoursPerWeek),
      };
    })
    .filter((phase) => phase.missionIds.length > 0);

  const totalHours = trailPhases.reduce((total, phase) => total + phase.effortHours, 0);
  const weeks = outcome.essentialMode
    ? missions.length + prerequisiteIds.length
    : Math.max(1, round(totalHours / hoursPerWeek, 0.5));

  const goal = decomposeGoal(answers, board);
  const explanation: TrailExplanation = {
    intro: board.explanation_templates.intro[archetype] ?? '',
    goal: fillTemplate(board.explanation_templates.goal, {
      valor: brl(goal.monthlyTarget),
      ticket: brl(goal.ticket),
      vendas_semana: goal.salesPerWeek,
      contatos_semana: goal.contactsPerWeek,
    }),
    launchKind: board.explanation_templates.launch_kind[outcome.launchKind] ?? '',
    adjustments: outcome.applied,
  };

  return {
    kind: 'trail',
    boardVersion: board.board_version,
    archetype,
    archetypeLabel: board.archetype_rules.labels[archetype] ?? archetype,
    goal,
    launchKind: outcome.launchKind,
    essentialMode: outcome.essentialMode,
    adjustments: outcome.applied,
    prerequisiteMissionIds: prerequisiteIds,
    ritualMissionId: RITUAL_MISSION_ID,
    quickStart: resolveQuickStart(ctx, outcome.missionIds, board),
    phases: trailPhases,
    missions,
    estimate: { totalHours, weeks, hoursPerWeek },
    explanation,
  };
}
