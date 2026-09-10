# 05 — Arquitetura, Stack e ADRs

## 1. Stack (verificar versões estáveis no dia do kickoff — use o MCP Context7 no Claude Code)

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/RSC, rotas de API no mesmo repo, ecossistema shadcn |
| UI | **Tailwind CSS + shadcn/ui** (exigência do projeto) | Componentes acessíveis, copiáveis, sem lock-in |
| Formulários | react-hook-form + **Zod** | O schema Zod de cada ferramenta é a fonte da verdade do artefato |
| Banco | **PostgreSQL** (exigência) | JSONB para artefatos, integridade relacional para trilha/missões |
| ORM/migrations | **Drizzle ORM + drizzle-kit** | Schema em TS, migrations versionadas, SQL transparente (schema-first) |
| Auth | Auth.js (NextAuth) com credenciais + link mágico | Simples no P0; OAuth depois |
| E-mail | Resend (ou equivalente) via Nodemailer abstraído | Lembretes de ritual |
| Validação/regras | Módulo puro `packages/engine` (sem dependência de UI ou DB) | Motor de trilha testável isoladamente |
| Testes | **Vitest** (unit/integration) + Playwright (e2e) + Testcontainers (Postgres) | TDD-first |
| IA (P1) | Anthropic API via rota de servidor; prompts em `content/agentes/` | Personas dos 10 agentes |
| Deploy | Docker → **Dokploy** (main) ; branch `dev` com testes locais | Convenção já usada |
| Observabilidade | Logs estruturados + Sentry (MCP já conectado) | |

## 2. Estrutura do repositório

```
prospere/
├── CLAUDE.md
├── .ai/ (context.md, progress.md, handoff.md)
├── .claude/agents/ (10 subagentes)
├── docs/ (00..08 deste pacote + adr/)
├── apps/web/                      # Next.js
│   ├── app/(auth)/ (login, cadastro)
│   ├── app/(app)/hoje | trilha | missao/[id] | ferramenta/[id] | rituais | biblioteca | config
│   ├── app/onboarding/board/[step]
│   ├── app/api/ (rotas mínimas; preferir Server Actions)
│   ├── components/ (shadcn + componentes de domínio)
│   └── lib/ (db, auth, actions, email)
├── packages/engine/               # motor de trilha (puro)
│   ├── src/board.schema.ts        # Zod das respostas
│   ├── src/archetype.ts           # classificação
│   ├── src/weights.ts             # pesos + ajustes
│   ├── src/trail.ts               # montagem da trilha
│   ├── src/explain.ts             # resumo das regras disparadas
│   └── test/ (6 personas + casos de borda)
├── packages/content/              # biblioteca de missões/ferramentas/livros (TS tipado, gerado a partir de docs/03)
│   ├── phases.ts, missions.ts, tools/*.schema.ts, books.ts, agents.ts
│   └── test/ (integridade: IDs únicos, pré-requisitos válidos, toda missão tem fase)
├── packages/db/                   # Drizzle schema + migrations + seed
└── docker/ (Dockerfile, compose para dev com Postgres)
```

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

## 4. Regras de engenharia (do seu padrão)

- Schema-first: alterar `packages/db/schema.ts` → migration → testes → UI. Nunca assumir nomes de campos.
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
