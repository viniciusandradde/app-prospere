import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Schema do MVP Negócio — as 11 tabelas de `docs/04-PRD-MVP-NEGOCIO.md` (seção 8), fiéis aos
 * nomes de `docs/06-schema.sql`, mais `waitlist` (gates do board) e duas tabelas de sessão.
 * O catálogo (fases, missões, ferramentas, livros) não tem tabela: vive em `@prospere/content`
 * (ADR-003), então `mission_id`/`tool_id` são texto validado pelo catálogo na aplicação.
 * Toda leitura e escrita de dados do usuário filtra por `workspace_id` (ADR-005).
 */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  locale: text('locale').notNull().default('pt-BR'),
  timezone: text('timezone').notNull().default('America/Campo_Grande'),
  /** LGPD: aceite de termos e privacidade. */
  consentAt: timestamp('consent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  kind: text('kind').notNull().default('personal'),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Token de uso único do link mágico. */
export const loginTokens = pgTable('login_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Gates do board: quem ficou fora do escopo deixa contato (PRD N-02). */
export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  edition: text('edition').notNull(),
  answers: jsonb('answers').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const boardResponses = pgTable(
  'board_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    version: integer('version').notNull(),
    boardVersion: text('board_version').notNull(),
    edition: text('edition').notNull().default('negocio'),
    answers: jsonb('answers').notNull(),
    archetype: text('archetype').notNull(),
    weights: jsonb('weights').notNull().default({}),
    adjustments: text('adjustments').array().notNull().default([]),
    /** Flags derivadas: launch_kind, essential_mode. */
    flags: jsonb('flags').notNull().default({}),
    explanation: jsonb('explanation').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('board_responses_ws_version').on(table.workspaceId, table.version)],
);

export const trails = pgTable(
  'trails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    boardResponseId: uuid('board_response_id')
      .notNull()
      .references(() => boardResponses.id),
    goalMetricName: text('goal_metric_name').notNull(),
    goalMetricValue: numeric('goal_metric_value', { precision: 14, scale: 2 }),
    goalDeadline: date('goal_deadline'),
    hoursPerWeek: numeric('hours_per_week', { precision: 4, scale: 1 }).notNull(),
    essentialMode: boolean('essential_mode').notNull().default(false),
    /** Snapshot da trilha gerada: fases, missões, estimativa e explicação. */
    plan: jsonb('plan').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('trails_ws_active').on(table.workspaceId, table.isActive)],
);

export const trailMissions = pgTable(
  'trail_missions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    trailId: uuid('trail_id')
      .notNull()
      .references(() => trails.id, { onDelete: 'cascade' }),
    /** ID do catálogo em `@prospere/content` (sem FK: conteúdo é código). */
    missionId: text('mission_id').notNull(),
    position: smallint('position').notNull(),
    status: text('status').notNull().default('todo'),
    dueAt: date('due_at'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    /** Resposta guiada por template (PRD N-05). */
    responseText: jsonb('response_text').notNull().default({}),
    /** Registros datados do contador: [{date, note}]. */
    counter: jsonb('counter').notNull().default([]),
  },
  (table) => [uniqueIndex('trail_missions_trail_mission').on(table.trailId, table.missionId)],
);

export const artifacts = pgTable(
  'artifacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    toolId: text('tool_id').notNull(),
    trailMissionId: uuid('trail_mission_id').references(() => trailMissions.id, {
      onDelete: 'set null',
    }),
    title: text('title'),
    schemaVersion: integer('schema_version').notNull(),
    data: jsonb('data').notNull(),
    version: integer('version').notNull().default(1),
    status: text('status').notNull().default('draft'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('artifacts_ws_tool').on(table.workspaceId, table.toolId)],
);

export const rituals = pgTable('rituals', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('weekly_review'),
  cadence: text('cadence').notNull().default('weekly'),
  /** 0 = domingo … 6 = sábado. */
  weekday: smallint('weekday').default(0),
  timeLocal: time('time_local'),
  reminder: boolean('reminder').notNull().default(true),
  streak: integer('streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ritualEntries = pgTable(
  'ritual_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ritualId: uuid('ritual_id')
      .notNull()
      .references(() => rituals.id, { onDelete: 'cascade' }),
    /** Segunda-feira da semana revisada. */
    periodStart: date('period_start').notNull(),
    data: jsonb('data').notNull(),
    metricValue: numeric('metric_value', { precision: 14, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('ritual_entries_ritual_period').on(table.ritualId, table.periodStart)],
);

export const metricEntries = pgTable(
  'metric_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    metric: text('metric').notNull(),
    periodStart: date('period_start').notNull(),
    period: text('period').notNull().default('week'),
    value: numeric('value', { precision: 14, scale: 2 }).notNull(),
    source: text('source').notNull().default('manual'),
  },
  (table) => [
    uniqueIndex('metric_entries_unique').on(
      table.workspaceId,
      table.metric,
      table.period,
      table.periodStart,
    ),
  ],
);

/** Telemetria mínima (PRD N-10). Sem PII nos props. */
export const events = pgTable(
  'events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    workspaceId: uuid('workspace_id'),
    userId: uuid('user_id'),
    name: text('name').notNull(),
    props: jsonb('props').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('events_name_time').on(table.name, table.createdAt)],
);
