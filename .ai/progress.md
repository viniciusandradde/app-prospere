# Progresso

## 2026-09-08 — Planejamento (fora do repo)
- Leitura e validação das 28 fontes; frameworks conferidos contra o texto.
- Método PROSPERE definido (8 fases, ciclo AAA × Construir-Medir-Aprender, 6 arquétipos, 11 ajustes).
- Conteúdo: 67 missões, 54 ferramentas, critérios por fase (docs/03).
- PRD P0/P1/P2, arquitetura + 6 ADRs, schema SQL, seed do board, 10 subagentes, plano de sprints.

## Próximo
- Sprint 0 (fundação) — ver `.ai/handoff.md`.

## 2026-09-08 — Corte de escopo
- Análise de overfeat: 6 públicos, 54 ferramentas e 10 agentes no MVP. Decisão: 2 produtos + 1 serviço,
  mesma engine, construídos em sequência; primeiro a edição Negócio.
- Criados `docs/04-PRD-MVP-NEGOCIO.md` (escopo ativo) e `seed/board.negocio.json` (7 perguntas, gates).

## 2026-09-11 — Sistema construído (semanas 1 a 4 do PRD Negócio)
- **Monorepo pnpm**: `apps/web` (Next.js 16 + Tailwind 4 + Drizzle), `packages/content`, `packages/engine`.
- **`packages/content`**: catálogo tipado com as 27 missões do MVP (IDs canônicos de `docs/03`),
  as 3 ferramentas com schema Zod + render em Markdown, os livros citados. Testes de integridade
  cruzam catálogo × `seed/board.negocio.json`.
- **`packages/engine`**: `generateTrail(answers, board)` puro e determinístico — arquétipo (com
  ARC-VALIDATED), meta decomposta, os 7 ajustes, fases com estimativa e explicação. 27 testes.
- **`apps/web`**: link mágico + workspace pessoal; board de 7 perguntas com gates e lista de espera;
  trilha com o "por quê"; missões com template, contador e bloqueio por pré-requisito; Quadro
  Construir-Medir-Aprender; Construtor de Oferta com auditoria ética que bloqueia gatilho artificial;
  Revisão Semanal com streak, gráfico e bloco Pivotar/Perseverar a cada 4 semanas; Hoje; exportar em
  Markdown; telemetria dos 6 eventos; exclusão de conta (LGPD); lembrete por e-mail via cron.
- **Testes**: 57 unitários (Vitest) + 8 e2e (Playwright, desktop e mobile 360 px) contra Postgres real.
- **ADRs**: 000 (versões), 007 (auth própria em vez de Auth.js), 008 (catálogo sem tabelas).

## 2026-09-11 — Provedor de e-mail definido
- **Resend** escolhida e integrada por `fetch` direto, sem SDK (ADR-009) — resolve a questão
  aberta que bloqueava N-08 (lembrete da Revisão Semanal).
- `EMAIL_TRANSPORT` explícito: `resend` envia, `console` escreve no log (dev e e2e).
- Falha de envio em produção devolve erro tratado e **não** expõe o link mágico na tela;
  tempo limite de 10 s para a API não segurar a ação do usuário.
- `pnpm email:testar <e-mail>` confere chave, remetente e domínio antes do deploy.
- Pendente: verificar domínio próprio na Resend (o remetente de teste só entrega para o dono da conta).

## 2026-09-11 — Domínio de e-mail
- Remetente do produto passa a ser `nao-responda@prospere.vsatecnologia.com.br` (código, `.env.example`
  e script de teste).
- Domínio adicionado no painel da Resend; os registros DNS obrigatórios ainda não estavam no ar
  (conferido em 3 resolvedores). `pnpm email:dns` verifica MX, SPF, DKIM e DMARC a qualquer momento.

## 2026-09-11 — Acessibilidade dos formulários e capturas de tela
- Bug real encontrado ao gerar as capturas: o `Field` injetava o `id` no elemento filho mesmo
  quando ele era um arranjo (campo + botão), criando id duplicado — o `<label>` apontava para o
  `div` e o campo ficava sem rótulo para leitor de tela. `Input`/`Textarea` são `forwardRef`,
  cujo `type` é objeto, o que também confundia a detecção. Regra reescrita e coberta por e2e.
- `aria-label` nas listas sem rótulo individual (vitórias, prioridades, benefícios da oferta).
- `docs/capturas/` com 12 telas (desktop e 360 px), geradas do app real por `scripts/capturas.mjs`.
- Documentação atualizada para quem for continuar no Claude Code: `CLAUDE.md` reescrito
  (comandos, mapa do código, armadilhas), `docs/08` virou guia de continuação, `docs/00` e
  `docs/05` com a estrutura real, CONTRIBUTING com os comandos de verificação.
