# Contexto — PROSPERE

**O que é**: app web (Next.js + shadcn/ui + PostgreSQL) que transforma um diagnóstico de ~12 perguntas
em uma trilha personalizada de 8 fases para ganhar dinheiro e prosperar, de pessoa endividada a grande
empresa. Cada fase tem missões e ferramentas que geram artefatos; rituais semanais/mensais dão ritmo.

**Fontes do método**: 7 livros publicados (A Fórmula do Lançamento; A Startup Enxuta; A Mente Influente;
As Armas da Persuasão 2.0; Nunca Almoce Sozinho; O Coach de 1 Trilhão de Dólares; Responsabilidade
Extrema) + 21 e-books do bundle Projeto Milhão (absorvidos sem citação).

**Documentos**: `docs/00` a `docs/08`, `docs/06-schema.sql`, `seed/board.json`, `.claude/agents/`.

**Decisões vivas**: ADR-001 motor determinístico; ADR-002 artefatos JSONB + Zod versionado;
ADR-003 conteúdo como código; ADR-004 Server Actions/RSC; ADR-005 multi-tenant no schema;
ADR-006 LGPD/dados financeiros; ADR-007 auth própria por link mágico (em vez de Auth.js);
ADR-008 catálogo só em código, sem tabelas nem seed.

**Estado**: MVP da edição Negócio implementado (monorepo `apps/web` + `packages/engine` +
`packages/content`), com testes unitários e e2e verdes. Ver `.ai/progress.md` e `.ai/handoff.md`.

**Escopo ativo**: edição Negócio (A3/A4) — `docs/04-PRD-MVP-NEGOCIO.md` + `seed/board.negocio.json`.
**Fora do escopo agora**: edição Pessoal (A1/A2), Escalar (A5/A6, vira serviço), 51 ferramentas, agentes no produto, integrações, comunidade, app nativo, cobrança.

**Nome**: PROSPERE (codinome; domínio/INPI não verificados). Alternativas: NORTE, ASCENDA, VETOR.
