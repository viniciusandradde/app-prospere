# CLAUDE.md — PROSPERE

Diagnóstico de 7 perguntas → trilha personalizada → missões com resultado verificável +
ferramentas que geram artefatos → ritual semanal com números.

**Estado**: o MVP da **edição Negócio** está implementado e testado (5 fases, 27 missões,
3 ferramentas). O método completo — 8 fases, 67 missões, 54 ferramentas — segue documentado
em `docs/02` e `docs/03` como biblioteca, **fora do escopo atual**.

## Leia primeiro
1. `.ai/handoff.md` (próximo passo) e `.ai/context.md` (estado e decisões vivas).
2. `docs/04-PRD-MVP-NEGOCIO.md` — **escopo ativo**. O que não está nele não entra agora.
   `docs/04-PRD-MVP.md` é a visão de longo prazo, não o escopo.
3. `docs/02-METODO-PROSPERE.md` (o método) e `docs/03-CONTEUDO-TRILHA.md` (missões e IDs).
4. `docs/adr/` para o porquê das decisões estruturais.

## Rodar

```bash
pnpm install
docker compose -f docker/compose.yaml up -d        # PostgreSQL 16 em localhost:5432
cp .env.example .env                               # preencha DATABASE_URL e EMAIL_*
pnpm --filter @prospere/web db:push                # cria as tabelas
pnpm dev                                           # http://localhost:3000
```

Sem `EMAIL_API_KEY`, o e-mail vai para o log do servidor e o link de acesso aparece na própria
tela de login (só fora de produção). Para entrar: `/entrar` → informe o e-mail → siga o link.

| Comando | O que faz |
|:--|:--|
| `pnpm test` | Unitários (Vitest): motor, catálogo, ferramentas |
| `pnpm test:e2e` | Fluxo real no navegador (Playwright); precisa do Postgres de pé |
| `pnpm lint` · `pnpm typecheck` | ESLint e TypeScript no monorepo inteiro |
| `pnpm build` | Build de produção do app |
| `pnpm --filter @prospere/web db:generate` | Gera migration a partir do schema Drizzle |
| `pnpm email:dns` | Confere os registros DNS que a Resend exige |
| `pnpm email:testar <e-mail>` | Envia um e-mail de teste pela Resend |

Antes de dar qualquer tarefa por concluída: `pnpm lint && pnpm typecheck && pnpm test`.
Mexeu em tela ou fluxo, rode também `pnpm test:e2e`.

## Mapa do código

```
apps/web/src/
├── app/                    telas (Server Components) e rotas
│   ├── entrar/               login por link mágico (+ verificar/route.ts)
│   ├── onboarding/board/     wizard das 7 perguntas (client)
│   ├── (app)/                hoje · trilha · missao/[id] · ferramenta/[slug] · ritual · conta
│   └── api/                  export (Markdown) e cron/lembretes
├── actions/                Server Actions: auth, board, mission, tools, ritual, account
├── db/schema.ts            13 tabelas Drizzle — a fonte da verdade dos campos
├── lib/                    auth, queries, email, telemetry, utils
└── components/ui/          primitivas no padrão shadcn/ui (escritas no repo)

packages/engine/            generateTrail(answers, board) — puro, sem UI nem banco
packages/content/           catálogo: missions.ts, phases.ts, books.ts, tools/*.ts (Zod + render)
seed/board.negocio.json     as regras da trilha (perguntas, gates, ajustes, textos)
e2e/                        Playwright: cadastro → board → trilha → missão → ferramentas
```

**O caminho de uma trilha**: board (7 respostas) → `generateTrail` → snapshot em `trails.plan`
→ `trail_missions` → a UI lê o snapshot + o estado do usuário (`lib/queries.ts`).

## Stack

Next.js 16 (App Router) + TypeScript · Tailwind 4 + primitivas shadcn/ui · PostgreSQL 16 +
Drizzle · Zod · react-hook-form · Vitest + Playwright · Docker → Dokploy.
Auth é própria, por link mágico (ADR-007) — **não** Auth.js. E-mail pela Resend (ADR-009).
Versões fixadas em `docs/adr/000-versoes.md`; subir versão maior exige atualizar o ADR.

## Regras não negociáveis

- **Escopo**: o PRD Negócio manda. Missão, ferramenta ou fase fora dele não entra sem decisão
  explícita registrada.
- **Schema-first**: alterar `apps/web/src/db/schema.ts` → migration → testes → UI. Nunca assumir
  nome de campo; conferir no schema.
- **TDD**: teste antes do código em `packages/engine`, `packages/content` e em cada ferramenta.
- **Motor determinístico** (ADR-001): regras em `seed/board.negocio.json`, interpretadas por
  `packages/engine`. Mesma entrada, mesma saída — provado por teste. A IA explica, nunca decide.
- **Catálogo só em código** (ADR-008): sem tabelas de missão/ferramenta; `mission_id` e `tool_id`
  são texto validado na aplicação e cobertos por teste de integridade.
- **Tenancy** (ADR-005): toda leitura e escrita filtra por `workspace_id`. Ação que escreve
  confere antes se a linha pertence ao workspace da sessão.
- **ADR** para toda decisão estrutural, em `docs/adr/NNN-titulo.md` (use `000-template.md`).
- **Conteúdo**: citar apenas os livros publicados (Walker, Ries, Sharot, Cialdini, Ferrazzi,
  Campbell, Willink & Babin); e-books viram conteúdo próprio, sem nome; nunca reproduzir trechos
  longos; número de referência sempre com o selo "referência inicial — calibre com seus dados";
  persuasão só com gatilho verdadeiro (o Construtor de Oferta **bloqueia** o artificial);
  finanças como processo educativo, sem recomendar ativo.
- **LGPD**: consentimento no cadastro, exportação e exclusão de conta funcionando; segredo
  nenhum no repositório — chaves vivem em `.env` (ignorado) e nas variáveis do Dokploy.
- **Idioma**: UI e conteúdo em pt-BR; código, tabelas, commits e ADRs em inglês
  (os documentos de método e os ADRs deste repositório estão em português, por decisão do autor).

## Armadilhas já pagas

- **Cookie só em route handler ou Server Action.** Gravar cookie durante a renderização de uma
  página quebra em produção — foi por isso que `/entrar/verificar` é `route.ts`.
- **Imports internos sem extensão `.js`** em `packages/*`: o Turbopack não resolve para `.ts`.
- **`pnpm test:e2e` precisa do Postgres de pé** e roda o build de produção. O e-mail usa
  `EMAIL_TRANSPORT=console` nesse cenário, então a tela mostra a mensagem real de sucesso.
- **Wizard do board hidrata antes de responder**: clique perdido em teste significa hidratação
  incompleta, não regra errada. O rascunho fica em `localStorage` até o diagnóstico terminar.
- **Ambiente com Chromium pré-instalado**: aponte `PLAYWRIGHT_CHROMIUM_PATH` em vez de baixar.
- **Missão recorrente** guarda em `effortHours` o total das 4 semanas (REN-02 = 20 h), não a
  hora por dia — as estimativas do PRD dependem disso.

## Fluxo de trabalho

Branch `dev` → PR → `main` → Dokploy. Commits no padrão Conventional Commits, em inglês.
Ao fim de cada sessão, atualize `.ai/progress.md` (o que foi feito) e `.ai/handoff.md`
(o próximo passo) — é de onde a próxima sessão parte.

## Subagentes

`.claude/agents/prospere-*.md` — 10 especialistas (1 orquestrador + 9 de fase), úteis para
revisar e refinar o **conteúdo** do método. As fontes originais ficam em `sources/`
(gitignored, não versionar). A sessão principal consolida o que eles propõem.
