# 08 — Trabalhar neste repositório com o Claude Code

> Este documento era o plano de Sprint 0. O Sprint 0 acabou: o MVP da edição Negócio está
> implementado. O que segue é como continuar daqui.

## 1. Preparar a máquina (10 min)

```bash
git clone https://github.com/viniciusandradde/app-prospere.git
cd app-prospere
pnpm install

docker compose -f docker/compose.yaml up -d     # PostgreSQL 16
cp .env.example .env                            # DATABASE_URL, EMAIL_API_KEY, EMAIL_FROM
pnpm --filter @prospere/web db:push             # cria as 13 tabelas
pnpm test && pnpm dev                           # verde e de pé em localhost:3000
```

Abra o Claude Code na raiz. Ele lê `CLAUDE.md` sozinho — lá estão os comandos, o mapa do código,
as regras não negociáveis e as armadilhas já pagas.

**Opcional**: os materiais que embasaram o método não são versionados (direito autoral). Para
trabalhar com eles localmente:
`python3 scripts/extract-sources.py <pasta-com-os-originais> sources/`.

## 2. O que já existe

| Camada | Onde | Estado |
|:--|:--|:--|
| Catálogo do método | `packages/content` | 27 missões, 3 ferramentas com Zod + render, livros |
| Motor de trilha | `packages/engine` | `generateTrail` determinístico, 27 testes |
| App | `apps/web` | Login, board, trilha, missões, 3 ferramentas, ritual, Hoje, exportar, LGPD |
| Banco | `apps/web/src/db/schema.ts` | 13 tabelas (11 do PRD + `waitlist` + sessão) |
| Testes | `packages/*/test`, `e2e/` | 57 unitários + 8 e2e (desktop e mobile) |
| Decisões | `docs/adr/` | ADR-000, 007, 008, 009 escritos; 001–006 em `docs/05` |

## 3. O que falta (na ordem)

1. **Verificar o domínio de e-mail.** Publicar os registros DNS da Resend para
   `prospere.vsatecnologia.com.br`, conferir com `pnpm email:dns`, verificar no painel e fechar
   com `pnpm email:testar`. Sem isso ninguém entra por link novo. Detalhes no ADR-009.
2. **Deploy no Dokploy** a partir de `main`, com `docker/Dockerfile`. Variáveis:
   `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`.
3. **Agendador** de hora em hora para `POST /api/cron/lembretes` com
   `Authorization: Bearer $CRON_SECRET`.
4. **Beta com 20 pessoas** (10 Fundadores, 10 Operadores) e o **gate da semana 8** — critérios na
   seção 2 do PRD Negócio. A decisão do gate vira ADR.
5. **v1.1, só se o gate passar**: Pipeline, Planejador de Lançamento e chat por fase.

## 4. Prompts que funcionam bem aqui

**Nova ferramenta** (só depois do gate, e só a que o beta pedir)
> Implemente a ferramenta `T-REN-01 Pipeline` seguindo o padrão das três existentes em
> `packages/content/src/tools/`: schema Zod + `render*` em Markdown + testes primeiro, depois o
> formulário em `apps/web/src/app/(app)/ferramenta/[slug]/`. Campos conforme
> `docs/03-CONTEUDO-TRILHA.md`. Registre a ferramenta em `tools/index.ts` e vincule a missão no
> `seed/board.negocio.json`. Rode `pnpm test` e `pnpm test:e2e`.

**Mudar regra de trilha**
> Quero que [regra]. A regra mora em `seed/board.negocio.json`, não no código: adicione o ajuste
> lá, faça `packages/engine` interpretá-lo se for uma condição nova, e escreva o teste da persona
> afetada em `packages/engine/test/trail.test.ts` antes de mudar o comportamento. Explique em
> `why` o que o usuário vai ler.

**Conteúdo de uma fase** (subagentes)
> Use os subagentes `prospere-*` das fases envolvidas: cada um compara `packages/content` com
> `docs/03-CONTEUDO-TRILHA.md` e as fontes em `sources/`, e propõe até 5 melhorias em
> `docs/review/<agente>.md`. Regras: citar só livros publicados, nada de trecho longo, número
> sempre como referência inicial. Depois consolide o que eu aprovar.

**Antes de abrir PR**
> Rode `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`, atualize `.ai/progress.md` e
> `.ai/handoff.md`, e escreva um ADR se houve decisão estrutural.

## 5. Checklist de qualidade (a cada PR)

- [ ] Testes escritos antes do código; `pnpm test` e `pnpm test:e2e` verdes
- [ ] Nenhum nome de campo assumido — conferido em `apps/web/src/db/schema.ts`
- [ ] Filtro por `workspace_id` em toda leitura e escrita de dado de usuário
- [ ] Textos de UI em pt-BR; sem citar e-books; livros citados corretamente
- [ ] Número de referência com o selo "referência inicial"
- [ ] Missão nova tem resultado verificável; ferramenta nova tem schema Zod
- [ ] Nenhum segredo no diff (`git diff --cached | grep -i "api.key\|secret"`)
- [ ] `.ai/progress.md` e `.ai/handoff.md` atualizados; ADR se houve decisão estrutural

## 6. Relação com o Launch OS

O Launch OS (produto anterior: criar/lançar produtos e cadastrar leads) cabe inteiro na fase
Rentabilizar — `T-REN-04 Planejador de Lançamento`, `T-REN-05 Editor de Peças`, `T-REN-01
Pipeline` — e na captura da fase Engajar. Recomendação mantida: absorver como módulo do
PROSPERE na v1.1, em vez de manter dois produtos.
