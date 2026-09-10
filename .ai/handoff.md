# Handoff — próximo passo

**Decisão (2026-09-08)**: o MVP é a edição **Negócio** (A3 Fundador / A4 Operador). Escopo em
`docs/04-PRD-MVP-NEGOCIO.md`; board em `seed/board.negocio.json`. O restante (edição Pessoal, Escalar
como serviço, 51 ferramentas, 10 agentes no produto) fica como visão para depois do gate da semana 8.

1. Rodar `scripts/extract-sources.py` sobre os materiais originais → `sources/` (gitignored).
2. Semana 1: monorepo reduzido (`apps/web`, `packages/engine`, `packages/content`); engine com testes
   (2 personas + 7 ajustes + combinações); conteúdo das ~26 missões tipado; board de 7 perguntas com gates.
3. Schema: só as 11 tabelas listadas no PRD Negócio (+ `waitlist`); catálogo em código.
4. Pendências que não bloqueiam: nome final; provedor de e-mail; âncoras do teste de preço.
