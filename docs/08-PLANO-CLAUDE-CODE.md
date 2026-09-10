# 08 — Plano de Execução no Claude Code

## 0. Antes de abrir o Claude Code (15 min)

1. `git init prospere && cd prospere` — copie este pacote: `CLAUDE.md`, `.ai/`, `.claude/`, `docs/` (arquivos 00–08 + `docs/06-schema.sql`), `seed/`, `scripts/`, `.gitignore`.
2. Crie `sources/` (já está no `.gitignore` — os materiais são protegidos por direitos autorais e não podem ir para o repositório) e rode `python3 scripts/extract-sources.py <pasta-com-os-arquivos-originais> sources/`. O script converte os "PDFs" (na verdade texto puro e ZIPs por página) em `.txt`, removendo as linhas de licença com dados pessoais.
3. Confirme Node LTS, pnpm, Docker (Postgres local) e o MCP **Context7** ativo no Claude Code — use-o para verificar as versões atuais de Next.js, shadcn/ui, Drizzle, Auth.js antes de instalar.

## 1. Sprints

### Sprint 0 — Fundação (sem UI)
- Monorepo pnpm: `apps/web`, `packages/engine`, `packages/content`, `packages/db`.
- `packages/db`: schema Drizzle equivalente a `docs/06-schema.sql`, migration inicial, seed idempotente do catálogo.
- `packages/content`: fases, missões (67), ferramentas (54) e livros (7) tipados a partir de `docs/03-CONTEUDO-TRILHA.md`; testes de integridade (IDs únicos, pré-requisitos existem, toda missão tem fase, `min_weight` válido).
- `packages/engine`: `generateTrail(answers, board) → { archetype, weights, adjustments, phases[], missions[], estimate, explanation }`; testes para as 6 personas + bordas.
- CI: lint, typecheck, testes, seed em Postgres efêmero (Testcontainers).
- ADR-001..006 em `docs/adr/`.
**Pronto quando**: `pnpm test` verde e `pnpm seed` popula o catálogo.

### Sprint 1 — Board → Trilha
- Auth (e-mail/senha + link mágico), workspace pessoal automático.
- Onboarding: 1 pergunta por tela, progresso salvo, revisão final.
- Server Action `completeBoard` → grava `board_responses`, chama o engine, cria `trails`, `trail_phases`, `trail_missions`.
- Tela **Trilha** (8 fases, pesos, "por quê", próxima missão) e tela **Hoje**.
- e2e: cadastro → board → trilha gerada para a persona A3.

### Sprint 2 — Missões + primeiras ferramentas
- Tela de missão (objetivo, passos, resultado, concluir/desfazer, pré-requisitos).
- Ferramentas: Canvas do Rumo, Raio-X Financeiro + Bola de Neve, Orçamento 50-30-20, Revisão Semanal (ritual + streak + gráfico).
- Padrão de ferramenta: `schema.ts` (Zod) + `Form.tsx` (react-hook-form + shadcn) + `render.ts` (artefato em Markdown) + teste.

### Sprint 3 — Completar o P0
- Ferramentas: Quadro Construir-Medir-Aprender, Construtor de Oferta + Checklist Ético, Plano de Relacionamentos (CRM simples), Pipeline + Rotina Diária.
- Progresso (% por fase, nível, selos), Biblioteca (7 livros + método + glossário), Exportar (Markdown/PDF), Refazer board.
- Lembretes por e-mail (Resend ou equivalente) para a Revisão Semanal.

### Sprint 4 — Qualidade e lançamento beta
- Mobile 360 px, acessibilidade AA, estados vazios, telemetria (`events`).
- LGPD: consentimento, exportação e exclusão de conta; decisão sobre cifra de campos financeiros (ADR-006).
- Dockerfile + deploy Dokploy a partir de `main`; `dev` com testes locais.
- Beta com 6 pessoas (1 por arquétipo); ajustar regras do board com o que aparecer.

### Sprint 5+ — P1
- Agentes de IA por fase (personas dos 10 arquivos em `.claude/agents/`, seção "Persona no produto"), com consentimento por conversa para usar artefatos.
- Workspace de empresa (papéis, 1:1 compartilhado, priorizar e agir em time).
- Demais ferramentas do `docs/03`.

## 2. Prompts prontos

**Kickoff (Sprint 0)**
> Leia `CLAUDE.md`, `.ai/context.md` e `docs/00` a `docs/06`. Monte o monorepo pnpm conforme `docs/05-ARQUITETURA-E-ADRS.md`. Antes de instalar qualquer dependência, consulte o Context7 para as versões estáveis atuais de Next.js, shadcn/ui, Drizzle, Auth.js e Vitest e registre-as em `docs/adr/000-versoes.md`. Comece por `packages/db` (schema Drizzle fiel a `docs/06-schema.sql`, migration e seed) e `packages/content` (catálogo tipado a partir de `docs/03-CONTEUDO-TRILHA.md` com testes de integridade). TDD: escreva os testes antes. Não invente nomes de campos: use exatamente os do schema. Ao terminar, atualize `.ai/progress.md` e `.ai/handoff.md`.

**Motor de trilha**
> Implemente `packages/engine` com base em `seed/board.json` e `docs/02-METODO-PROSPERE.md` (seções 4 e 5). Primeiro os testes: uma persona por arquétipo (`docs/04-PRD-MVP.md`, seção 4) e os casos de borda listados em `.claude/agents/prospere-bussola.md`. A função é pura e determinística; a explicação sai estruturada (arquétipo, pesos, ajustes disparados, templates). Registre decisões em ADR se precisar desviar do seed.

**Revisão paralela do conteúdo (10 agentes)**
> Use os subagentes `prospere-bussola`, `prospere-comandante`, `prospere-navegador`, `prospere-tesoureiro`, `prospere-cronista`, `prospere-cientista`, `prospere-persuasor`, `prospere-conector`, `prospere-lancador` e `prospere-mentor` em paralelo. Cada um lê as fontes da sua fase em `sources/`, compara com `docs/03-CONTEUDO-TRILHA.md` e escreve em `docs/review/<agente>.md` até 5 propostas de melhoria (missões, campos, critérios, textos) com justificativa e a fonte. Regras: citar só livros publicados; nada de trechos longos; números como referência inicial. Depois consolide as propostas que eu aprovar em `packages/content`.

**Uma ferramenta por vez (padrão)**
> Implemente a ferramenta `T-ORG-01 Raio-X Financeiro` seguindo o padrão `schema.ts + Form.tsx + render.ts + test`. Campos e saída conforme `docs/03-CONTEUDO-TRILHA.md`. Use shadcn/ui (form, table, input, select) e Zod. Teste o cálculo de saldo, total de dívida e juros mensais com 3 cenários. Autosave a cada 2 s de inatividade; "gerar artefato" cria nova versão.

## 3. Checklist de qualidade (repetir a cada PR)

- [ ] Testes escritos antes do código; `pnpm test` verde
- [ ] Nenhum nome de campo assumido — conferido no schema
- [ ] Textos de UI em português; sem citar e-books; livros citados corretamente
- [ ] Números de referência com o selo "referência inicial"
- [ ] Toda missão nova tem resultado verificável; toda ferramenta tem schema Zod
- [ ] Filtro por `workspace_id` em toda leitura/escrita
- [ ] `.ai/progress.md` e `.ai/handoff.md` atualizados; ADR se houve decisão estrutural

## 4. Relação com o Launch OS

O Launch OS (produto anterior: criar/lançar produtos e cadastrar leads) cabe inteiro na fase 7 —
`T-REN-04 Planejador de Lançamento`, `T-REN-05 Editor de Peças`, `T-REN-01 Pipeline` — e na captura
da fase 6. Recomendação: absorver como módulo do PROSPERE em vez de manter dois produtos.
