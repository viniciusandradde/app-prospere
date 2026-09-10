# CLAUDE.md — PROSPERE

Sistema de trilhas para prosperidade: board de diagnóstico → trilha personalizada em 8 fases
(Preparar, Rumar, Organizar, Sondar, Persuadir, Engajar, Rentabilizar, Escalar) → missões +
ferramentas que geram artefatos → rituais semanais/mensais → (P1) 10 agentes de IA por fase.

## Leia primeiro
1. `.ai/context.md` (estado e decisões vivas) e `.ai/handoff.md` (próximo passo).
2. `docs/02-METODO-PROSPERE.md` (o método) e `docs/03-CONTEUDO-TRILHA.md` (conteúdo, IDs).
3. `docs/04-PRD-MVP.md` (escopo P0/P1/P2), `docs/05-ARQUITETURA-E-ADRS.md`, `docs/06-schema.sql`.

## Stack
Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · PostgreSQL + Drizzle · Auth.js · Zod ·
Vitest + Playwright + Testcontainers · Docker → Dokploy. Versões: verificar no Context7 e registrar
em `docs/adr/000-versoes.md` antes de instalar.

## Regras não negociáveis
- **Schema-first**: alterar `packages/db/schema.ts` → migration → testes → UI. Nunca assumir nomes
  de campos; conferir no schema.
- **TDD**: testes antes do código em `packages/engine`, `packages/content` e em cada ferramenta.
- **ADR** para toda decisão estrutural (`docs/adr/NNN-titulo.md`).
- **Tenancy**: toda leitura/escrita filtra por `workspace_id`.
- **Motor de trilha determinístico** (ADR-001): regras em `seed/board.json` + `packages/engine`; IA só explica.
- **Conteúdo**: citar apenas livros publicados (Walker, Ries, Sharot, Cialdini, Ferrazzi, Campbell,
  Willink & Babin); e-books viram conteúdo próprio sem nome; nunca reproduzir trechos longos;
  números com selo "referência inicial — calibre com seus dados"; persuasão só com gatilhos reais;
  finanças = processo educativo, sem recomendar ativos.
- **LGPD**: consentimento, exportação e exclusão no P0; artefatos financeiros são sensíveis.
- Idioma: UI e conteúdo em português (pt-BR); código, tabelas, commits em inglês.

## Fluxo
Branch `dev` (testes locais) → PR → `main` → Dokploy. Ao fim de cada sessão: atualizar
`.ai/progress.md` e `.ai/handoff.md`.

## Subagentes
`.claude/agents/prospere-*.md` — 10 especialistas (1 orquestrador + 9 de fase). Fontes em `sources/`
(gitignored). Use-os em paralelo para revisar conteúdo; a sessão principal consolida.
