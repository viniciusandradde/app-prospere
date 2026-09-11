# 05 — Arquitetura, Stack e ADRs

## 1. Stack (verificar versões estáveis no dia do kickoff — use o MCP Context7 no Claude Code)

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/RSC, rotas de API no mesmo repo, ecossistema shadcn |
| UI | **Tailwind CSS + shadcn/ui** (exigência do projeto) | Componentes acessíveis, copiáveis, sem lock-in |
| Formulários | react-hook-form + **Zod** | O schema Zod de cada ferramenta é a fonte da verdade do artefato |
| Banco | **PostgreSQL** (exigência) | JSONB para artefatos, integridade relacional para trilha/missões |
| ORM/migrations | **Drizzle ORM + drizzle-kit** | Schema em TS, migrations versionadas, SQL transparente (schema-first) |
| Auth | Própria, por link mágico (ADR-007) | Um método só não paga o schema do adaptador do Auth.js |
| E-mail | Resend por `fetch` direto (ADR-009) | Link de acesso e lembrete do ritual |
| Validação/regras | Módulo puro `packages/engine` (sem dependência de UI ou DB) | Motor de trilha testável isoladamente |
| Testes | **Vitest** (unit) + Playwright (e2e, desktop e 360 px) sobre Postgres real | TDD-first |
| IA (P1) | Anthropic API via rota de servidor; prompts em `content/agentes/` | Personas dos 10 agentes |
| Deploy | Docker → **Dokploy** (main) ; branch `dev` com testes locais | Convenção já usada |
| Observabilidade | Logs estruturados + Sentry (MCP já conectado) | |

## 2. Estrutura do repositório

```
app-prospere/
├── CLAUDE.md · .ai/ (context, progress, handoff) · .claude/agents/ (10 subagentes)
├── docs/ (00..09 + adr/ + capturas/)
├── apps/web/                       # Next.js (App Router) — o Drizzle mora aqui
│   ├── src/app/(auth)             # entrar/ (+ verificar/route.ts: troca token por cookie)
│   ├── src/app/(app)/             # hoje | trilha | missao/[id] | ferramenta/[slug] | ritual | conta
│   ├── src/app/onboarding/board/  # wizard das 7 perguntas
│   ├── src/app/api/               # export (Markdown) · cron/lembretes
│   ├── src/actions/               # Server Actions (ADR-004)
│   ├── src/db/schema.ts           # 13 tabelas — fonte da verdade dos campos
│   ├── src/lib/                   # auth (ADR-007), queries, email (ADR-009), telemetry
│   └── src/components/ui/         # primitivas no padrão shadcn/ui
├── packages/engine/               # motor de trilha (puro)
│   ├── src/board.ts               # Zod das respostas + leitura do seed
│   ├── src/trail.ts               # arquétipo, meta, ajustes, fases, explicação
│   └── test/                      # personas + bordas + combinações do PRD
├── packages/content/              # catálogo tipado (ADR-003/008)
│   ├── src/missions.ts · phases.ts · books.ts · tools/*.ts (Zod + render Markdown)
│   └── test/                      # integridade: ids únicos, catálogo × board
├── e2e/                           # Playwright: fluxo completo, desktop e 360 px
├── seed/board.negocio.json        # as regras da trilha, versionadas
├── scripts/                       # extract-sources · testar-email · checar-dns-email · capturas
└── docker/                        # Dockerfile (Dokploy) + Postgres local
```

> `packages/db` não existe: o MVP mantém o Drizzle dentro de `apps/web` (PRD Negócio, seção 11).
> Não há tabelas de catálogo nem seed — ver ADR-008.

## 3. Decisões (ADRs iniciais)

**ADR-001 · Motor de trilha determinístico, IA só explica.**
Contexto: a trilha precisa ser previsível, testável e auditável. Decisão: regras em código puro
(`packages/engine`), com testes por persona; IA (P1) apenas reescreve o resumo das regras disparadas.
Consequência: sem "mágica" inexplicável; personalização mais profunda vem de regras novas, versionadas.

**ADR-002 · Artefatos em JSONB validados por Zod, com versionamento.**
Contexto: 54 ferramentas com formatos diferentes que evoluem. Decisão: tabela única `artifacts`
(`tool_id`, `schema_version`, `data jsonb`, `version`), schema Zod por ferramenta em `packages/content`.
Consequência: adicionar ferramenta = adicionar schema + formulário; migração de dados por versão de schema.

**ADR-003 · Conteúdo como código (TS tipado), não CMS.**
Contexto: missões/ferramentas mudam com o método e precisam de testes de integridade. Decisão:
`packages/content` versionado no Git, `docs/03` é a fonte humana; seed sincroniza o catálogo com o banco
(`phases`, `missions`, `tools`, `books`). Consequência: CMS só se houver editores não-técnicos (P2).

**ADR-004 · Server Actions e RSC por padrão; API pública só quando necessário.**
Consequência: menos boilerplate; endpoints REST para integrações ficam para o P2.

**ADR-005 · Multi-tenant desde o schema, single-tenant na UI do P0.**
Contexto: empresas e times entram no P1. Decisão: toda entidade de usuário pertence a `workspace_id`;
P0 cria um workspace pessoal por conta. Consequência: sem migração dolorosa depois.

**ADR-006 · LGPD e dados financeiros.**
Decisão: criptografia em repouso no volume do banco; exportação e exclusão de conta no P0; nenhum
dado de artefato é enviado para IA sem consentimento explícito por conversa (P1); logs sem PII.

**ADR-007 · Autenticação própria por link mágico**, em vez de Auth.js — ver `adr/007`.
**ADR-008 · Catálogo só em código**, sem tabelas nem seed — ver `adr/008`.
**ADR-009 · Resend como provedor de e-mail transacional** — ver `adr/009`.

## 4. Regras de engenharia (do seu padrão)

- Schema-first: alterar `apps/web/src/db/schema.ts` → migration → testes → UI. Nunca assumir nomes de campos.
- TDD: motor de trilha e schemas de ferramentas nascem com testes; e2e do fluxo board → trilha → missão → artefato → ritual.
- ADR para toda decisão estrutural (`docs/adr/NNN-titulo.md`).
- `.ai/context.md` (o que é o projeto), `.ai/progress.md` (o que foi feito), `.ai/handoff.md` (próximo passo) atualizados ao fim de cada sessão.
- Branches: `dev` → PR → `main` (Dokploy faz deploy).
- Português nos textos de UI e conteúdo; inglês em código, tabelas e commits.

## 5. Modelo de dados (resumo — detalhes em `docs/06-schema.sql`)

- Identidade: `users`, `workspaces`, `workspace_members`.
- Diagnóstico: `board_responses` (versão, respostas jsonb, arquétipo, pesos, explicação).
- Catálogo: `phases`, `missions`, `tools`, `books` (semeados do `packages/content`).
- Instância: `trails`, `trail_phases`, `trail_missions`, `artifacts` (+ `artifact_versions`).
- Rituais: `rituals`, `ritual_entries` (revisão semanal, pivotar/perseverar, 1:1).
- Domínio de vendas/rede: `contacts`, `deals`, `launches`, `metric_entries`.
- IA (P1): `agents`, `agent_conversations`, `agent_messages`.
- Telemetria: `events`.
