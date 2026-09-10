-- PROSPERE — schema inicial (PostgreSQL 16+)
-- Convenções: snake_case, uuid v7 (ou gen_random_uuid), timestamps com fuso, soft delete só onde indicado.
-- Este arquivo é a referência humana; a fonte executável é packages/db/schema.ts (Drizzle) + migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Identidade e tenancy ----------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext UNIQUE NOT NULL,
  name          text,
  password_hash text,                              -- nulo quando login por link mágico
  locale        text NOT NULL DEFAULT 'pt-BR',
  timezone      text NOT NULL DEFAULT 'America/Campo_Grande',
  consent_at    timestamptz,                       -- LGPD: aceite de termos/privacidade
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz                        -- exclusão de conta (LGPD)
);

CREATE TABLE workspaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('personal','company')),
  owner_id    uuid NOT NULL REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workspace_members (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','leader','member')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- ---------- Catálogo (semeado a partir de packages/content) ----------
CREATE TABLE phases (
  id          text PRIMARY KEY,                    -- 'PRE','RUM','ORG','SON','PER','ENG','REN','ESC'
  position    smallint NOT NULL,
  name        text NOT NULL,
  question    text NOT NULL,                       -- "Estou no comando de mim?"
  objective   text NOT NULL,
  exit_criteria jsonb NOT NULL                     -- {light:[...], medium:[...], full:[...]} ids de missões
);

CREATE TABLE missions (
  id            text PRIMARY KEY,                  -- 'PRE-01'
  phase_id      text NOT NULL REFERENCES phases(id),
  position      smallint NOT NULL,
  title         text NOT NULL,
  min_weight    text NOT NULL CHECK (min_weight IN ('light','medium','full')),
  effort_hours  numeric(5,2) NOT NULL,
  recurring     text CHECK (recurring IN ('daily','weekly','monthly')),
  result        text NOT NULL,                     -- resultado verificável
  steps         jsonb NOT NULL DEFAULT '[]',       -- passos resumidos
  tool_id       text,                              -- ferramenta principal (FK abaixo)
  prerequisites text[] NOT NULL DEFAULT '{}',      -- ids de missões
  archetypes    text[],                            -- nulo = todos; ex.: {'A5','A6'}
  content_version int NOT NULL DEFAULT 1
);

CREATE TABLE tools (
  id             text PRIMARY KEY,                 -- 'T-ORG-01'
  phase_id       text NOT NULL REFERENCES phases(id),
  name           text NOT NULL,
  description    text NOT NULL,
  schema_version int NOT NULL DEFAULT 1,           -- versão do Zod schema em packages/content
  output_kind    text NOT NULL DEFAULT 'document', -- document | tracker | board | calculator
  priority       text NOT NULL CHECK (priority IN ('P0','P1','P2'))
);
ALTER TABLE missions ADD CONSTRAINT missions_tool_fk FOREIGN KEY (tool_id) REFERENCES tools(id);

CREATE TABLE books (
  id        text PRIMARY KEY,                      -- 'walker-formula-lancamento'
  title     text NOT NULL,
  authors   text NOT NULL,
  thesis    text NOT NULL,
  frameworks jsonb NOT NULL,                       -- [{name, summary, used_in:[phase ids]}]
  reading_suggestion text
);

CREATE TABLE phase_books (
  phase_id text REFERENCES phases(id),
  book_id  text REFERENCES books(id),
  PRIMARY KEY (phase_id, book_id)
);

-- ---------- Diagnóstico e trilha (instância por workspace) ----------
CREATE TABLE board_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id),
  version       int NOT NULL,                      -- 1, 2, ... (refazer board)
  board_version text NOT NULL,                     -- versão do seed/board.json usado
  answers       jsonb NOT NULL,                    -- {q01: 'A3', q03: 8000, ...}
  archetype     text NOT NULL CHECK (archetype IN ('A1','A2','A3','A4','A5','A6')),
  weights       jsonb NOT NULL,                    -- {PRE:'full', RUM:'light', ...}
  adjustments   text[] NOT NULL DEFAULT '{}',      -- ids das regras de ajuste disparadas
  explanation   jsonb NOT NULL,                    -- resumo estruturado (base do texto)
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, version)
);

CREATE TABLE trails (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  board_response_id uuid NOT NULL REFERENCES board_responses(id),
  goal_metric_name  text NOT NULL,                 -- "renda extra mensal", "faturamento", "dívida"
  goal_metric_value numeric(14,2),
  goal_deadline     date,
  hours_per_week    numeric(4,1) NOT NULL,
  essential_mode    boolean NOT NULL DEFAULT false,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX trails_one_active ON trails(workspace_id) WHERE is_active;

CREATE TABLE trail_phases (
  trail_id   uuid NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  phase_id   text NOT NULL REFERENCES phases(id),
  position   smallint NOT NULL,                    -- ordem gerada (pode diferir da canônica)
  weight     text NOT NULL CHECK (weight IN ('skip','light','medium','full')),
  why        text NOT NULL,                        -- "porquê" mostrado ao usuário
  est_weeks  numeric(4,1),
  status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','done','skipped')),
  PRIMARY KEY (trail_id, phase_id)
);

CREATE TABLE trail_missions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id     uuid NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  mission_id   text NOT NULL REFERENCES missions(id),
  position     smallint NOT NULL,
  status       text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  due_at       date,
  completed_at timestamptz,
  notes        text,
  UNIQUE (trail_id, mission_id)
);

-- ---------- Artefatos (saída das ferramentas) ----------
CREATE TABLE artifacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tool_id        text NOT NULL REFERENCES tools(id),
  trail_mission_id uuid REFERENCES trail_missions(id) ON DELETE SET NULL,
  title          text,
  schema_version int NOT NULL,
  data           jsonb NOT NULL,                   -- validado pelo Zod da ferramenta
  version        int NOT NULL DEFAULT 1,           -- incrementa a cada "gerar artefato"
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','final')),
  created_by     uuid NOT NULL REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX artifacts_ws_tool ON artifacts(workspace_id, tool_id);
CREATE INDEX artifacts_data_gin ON artifacts USING gin (data jsonb_path_ops);

CREATE TABLE artifact_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id  uuid NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version      int NOT NULL,
  data         jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_id, version)
);

-- ---------- Rituais ----------
CREATE TABLE rituals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('weekly_review','pivot_or_persevere','one_on_one','daily_sales')),
  cadence       text NOT NULL CHECK (cadence IN ('daily','weekly','monthly')),
  weekday       smallint,                          -- 0-6
  time_local    time,
  reminder      boolean NOT NULL DEFAULT true,
  streak        int NOT NULL DEFAULT 0,
  best_streak   int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ritual_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id   uuid NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  period_start date NOT NULL,                      -- semana/mês/dia de referência
  data        jsonb NOT NULL,                      -- {wins:[3], ownership_gap, metric:{name,value,target}, learning, priorities:[3]}
  metric_value numeric(14,2),                      -- "número da semana" (desnormalizado p/ gráfico)
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ritual_id, period_start)
);

-- ---------- Rede, vendas, lançamentos, métricas ----------
CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('client','mentor','peer','gatekeeper','superconnector','partner','lead')),
  origin        text,
  why_matters   text,
  help_first    text,                              -- "como ajudo primeiro"
  next_step     text,
  last_touch_at date,
  ping_every_days smallint CHECK (ping_every_days IN (30,60,90)),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contacts_ws_ping ON contacts(workspace_id, last_touch_at);

CREATE TABLE deals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id    uuid REFERENCES contacts(id) ON DELETE SET NULL,
  title         text NOT NULL,
  value         numeric(14,2),
  stage         text NOT NULL CHECK (stage IN ('lead','contacted','diagnosis','proposal','won','lost')),
  next_action   text,
  next_action_at date,
  lost_reason   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  closed_at     timestamptz
);
CREATE INDEX deals_ws_stage ON deals(workspace_id, stage);

CREATE TABLE launches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('seed','internal','joint','business')),
  open_at       date NOT NULL,
  cart_days     smallint NOT NULL DEFAULT 5,
  plc_days      smallint NOT NULL DEFAULT 7,       -- duração do pré-lançamento (5–12)
  timeline      jsonb NOT NULL,                    -- tarefas datadas geradas pelo planejador
  results       jsonb,                             -- {leads, opens, sales, revenue, conversion, learnings}
  status        text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','prelaunch','open','closed','review')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE metric_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metric        text NOT NULL,                     -- 'contacts','conversations','proposals','sales','revenue','leads','cac','ltv','debt_total','energy'
  period_start  date NOT NULL,
  period        text NOT NULL CHECK (period IN ('day','week','month')),
  value         numeric(14,2) NOT NULL,
  source        text NOT NULL DEFAULT 'manual',    -- manual | tool:<id> | ritual
  UNIQUE (workspace_id, metric, period, period_start)
);

-- ---------- Agentes de IA (P1) ----------
CREATE TABLE agents (
  id           text PRIMARY KEY,                   -- 'orquestrador','ownership',...
  name         text NOT NULL,
  phase_id     text REFERENCES phases(id),         -- nulo para o orquestrador
  persona_md   text NOT NULL,                      -- system prompt (fonte: content/agentes)
  version      int NOT NULL DEFAULT 1
);

CREATE TABLE agent_conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id),
  agent_id      text NOT NULL REFERENCES agents(id),
  context_artifact_ids uuid[] NOT NULL DEFAULT '{}', -- artefatos compartilhados com consentimento
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agent_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user','assistant','system')),
  content         text NOT NULL,
  tokens_in       int, tokens_out int,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- Telemetria de produto ----------
CREATE TABLE events (
  id           bigserial PRIMARY KEY,
  workspace_id uuid,
  user_id      uuid,
  name         text NOT NULL,                      -- board_started, board_completed, trail_generated, mission_completed, artifact_saved, ritual_completed, board_redone, export_done
  props        jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_name_time ON events(name, created_at);

-- Observações
-- 1) Toda leitura/escrita de dados de usuário filtra por workspace_id (tenancy desde o P0 — ADR-005).
-- 2) Artefatos financeiros: considerar coluna cifrada (pgcrypto) para campos sensíveis, decisão pendente (ADR-006).
-- 3) Seed do catálogo é idempotente (upsert por id) e roda em CI para validar integridade do conteúdo.
