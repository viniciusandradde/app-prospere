# PROSPERE

**Sua trilha do zero ao próximo nível.**

Sistema que transforma um diagnóstico de 7 perguntas em uma trilha personalizada de execução — missões com resultado verificável, ferramentas que geram artefatos e um ritual semanal com números — para quem quer tirar um negócio do papel ou fazer o negócio que já existe vender mais.

[![Status](https://img.shields.io/badge/status-MVP%20implementado-blue)](.ai/handoff.md)
[![MVP](https://img.shields.io/badge/MVP-edi%C3%A7%C3%A3o%20Neg%C3%B3cio-success)](docs/04-PRD-MVP-NEGOCIO.md)
[![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20shadcn%2Fui%20%7C%20PostgreSQL-black)](docs/05-ARQUITETURA-E-ADRS.md)
[![Idioma](https://img.shields.io/badge/idioma-pt--BR-green)](#)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-propriet%C3%A1ria-lightgrey)](LICENSE)

---

## Sumário

- [O problema](#o-problema)
- [A solução](#a-solução)
- [O método PROSPERE](#o-método-prospere)
- [Escopo do MVP](#escopo-do-mvp)
- [Como funciona](#como-funciona)
- [Arquitetura e stack](#arquitetura-e-stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Começando](#começando)
- [Roadmap](#roadmap)
- [Documentação](#documentação)
- [Agentes especialistas](#agentes-especialistas)
- [Contribuindo](#contribuindo)
- [Créditos](#créditos)
- [Aviso legal](#aviso-legal)
- [Licença](#licença)

---

## O problema

O Brasil abriu 3,6 milhões de negócios entre janeiro e julho de 2026 e fechou 874,9 mil pequenos negócios só no primeiro trimestre. Apenas 65,3% dos MEIs sobrevivem a dois anos.

Não é falta de conteúdo — é falta de **execução acompanhada**. Quem empreende sabe o que "deveria" fazer; trava porque não sabe o que fazer *esta semana*, constrói antes de validar e não mede nada. Curso não resolve: ensina e vai embora.

## A solução

O PROSPERE não ensina. Ele **faz junto**:

1. **Diagnóstico** de 7 perguntas identifica o ponto de partida (Fundador ou Operador) e a meta em número.
2. **Trilha personalizada** monta a sequência de fases e missões para aquele caso específico — pulando o que não se aplica, aprofundando onde está a alavanca.
3. **Missões** com resultado verificável ("10 entrevistas de descoberta", não "estude seu cliente").
4. **Ferramentas** que produzem artefatos reutilizáveis (oferta, experimento, revisão).
5. **Ritual semanal** com o número que importa, streak e a decisão mensal de pivotar ou perseverar.

## O método PROSPERE

Oito fases, uma pergunta cada. O nome é o método:

| Fase | Pergunta | Saída | Fonte-âncora |
|:--|:--|:--|:--|
| **P**reparar | Estou no comando de mim? | Rotina e responsabilidade instaladas | *Responsabilidade Extrema* |
| **R**umar | Para onde vou e por qual caminho? | Meta numérica + hipóteses testáveis | *A Startup Enxuta* |
| **O**rganizar | Dinheiro e tempo sob controle? | Orçamento, caixa e 3 prioridades/dia | — |
| **S**ondar | Alguém paga por isso? | 1ª venda ou pivô documentado | *A Startup Enxuta*, *A Fórmula do Lançamento* |
| **P**ersuadir | Minha oferta convence? | Oferta escrita + conversão medida | *As Armas da Persuasão 2.0*, *A Mente Influente* |
| **E**ngajar | Quem me conhece e confia? | Rede ativa + lista própria | *Nunca Almoce Sozinho* |
| **R**entabilizar | Estou vendendo todo dia? | Lançamento executado + métricas | *A Fórmula do Lançamento* |
| **E**scalar | Cresce sem depender de mim? | Time, sistemas e motor de crescimento | *O Coach de 1 Trilhão de Dólares* |

**Motor**: ciclo semanal AAA (Autoconhecimento → Ação → Análise) cruzado com Construir-Medir-Aprender mensal.

**As 12 regras** que o usuário decora estão em [`docs/02-METODO-PROSPERE.md`](docs/02-METODO-PROSPERE.md).

## Escopo do MVP

O método completo cobre 6 arquétipos, 67 missões e 54 ferramentas. **O MVP não.** O escopo ativo é a **edição Negócio**:

| | Inclui | Não inclui |
|:--|:--|:--|
| **Público** | Fundador (ideia/protótipo, sem faturamento) e Operador (negócio até ~R$ 1 mi/ano) | Pessoa física endividada, empresa com time (viram lista de espera) |
| **Fases** | Rumar → Sondar → Persuadir → Engajar → Rentabilizar | Preparar e Organizar viram checklist de pré-requisitos; Escalar sai |
| **Missões** | 15 (Operador) a 18 (Fundador) + condicionais | As demais 49 |
| **Ferramentas** | 3: Quadro Construir-Medir-Aprender, Construtor de Oferta, Revisão Semanal | As outras 51 (2 voltam na v1.1) |

O corte é deliberado e está justificado em [`docs/04-PRD-MVP-NEGOCIO.md`](docs/04-PRD-MVP-NEGOCIO.md), com as **hipóteses que o MVP existe para testar** e um gate objetivo na semana 8.

## Como funciona

```
Board (7 perguntas)
   └─> Motor determinístico (packages/engine)
          ├─ arquétipo (A3 Fundador | A4 Operador)
          ├─ meta decomposta (vendas/semana, contatos/semana)
          ├─ tipo de lançamento (semente | interno)
          └─ trilha: fases + missões + estimativa de semanas
                 └─> Missão ──> template | contador | ferramenta
                                    └─> Artefato (JSONB validado por Zod)
                 └─> Ritual semanal ──> números + streak + pivotar/perseverar
```

A personalização é **determinística e auditável** (ADR-001): regras versionadas em [`seed/board.negocio.json`](seed/board.negocio.json), testadas por persona. A IA (v1.1) apenas explica a trilha em linguagem natural — nunca decide por conta própria.

## Arquitetura e stack

| Camada | Escolha |
|:--|:--|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Formulários | react-hook-form + Zod (o schema é a fonte da verdade do artefato) |
| Banco | PostgreSQL + Drizzle ORM (schema-first, migrations versionadas) |
| Motor de trilha | `packages/engine` — módulo puro, sem dependência de UI ou DB |
| Testes | Vitest + Playwright + Testcontainers |
| Deploy | Docker → Dokploy (branch `main`) |

Decisões registradas como ADRs em [`docs/05-ARQUITETURA-E-ADRS.md`](docs/05-ARQUITETURA-E-ADRS.md). Schema em [`docs/06-schema.sql`](docs/06-schema.sql) (o MVP usa 11 das 24 tabelas).

## Estrutura do repositório

```
app-prospere/
├── apps/web/                 Next.js (App Router): board, trilha, missões, ferramentas, ritual
│   ├── src/app/                telas e rotas (Server Components + Server Actions)
│   ├── src/db/                 schema Drizzle (13 tabelas) e conexão
│   └── src/lib/                auth por link mágico, consultas, telemetria, e-mail
├── packages/
│   ├── content/              catálogo como código: 27 missões, 3 ferramentas (Zod), livros
│   └── engine/               motor de trilha determinístico + testes por persona
├── e2e/                      Playwright: cadastro → board → trilha → missão → ferramentas
├── docs/                     Especificação completa (00 a 09) + adr/
│   ├── 02-METODO-PROSPERE.md   O método: fases, arquétipos, regras
│   ├── 03-CONTEUDO-TRILHA.md   67 missões e 54 ferramentas com critérios
│   ├── 04-PRD-MVP-NEGOCIO.md   ESCOPO ATIVO
│   └── 06-schema.sql           Modelo de dados de referência
├── seed/
│   ├── board.negocio.json    Board ativo: 7 perguntas, gates, ajustes
│   └── board.json            Board completo (referência)
├── docker/                   Dockerfile (Dokploy) e Postgres local
├── scripts/                  Utilitários (extração de fontes)
├── .claude/agents/           10 subagentes especialistas
├── .ai/                      Contexto multi-IDE (context/progress/handoff)
└── CLAUDE.md                 Instruções para o Claude Code
```

> O escopo implementado é o da **edição Negócio** ([`docs/04-PRD-MVP-NEGOCIO.md`](docs/04-PRD-MVP-NEGOCIO.md)): 5 fases, 27 missões e 3 ferramentas. As outras 40 missões e 51 ferramentas seguem documentadas em [`docs/03`](docs/03-CONTEUDO-TRILHA.md) como biblioteca do método, fora do MVP.

## Começando

**Pré-requisitos:** Node.js 22 LTS, pnpm 10, Docker (PostgreSQL local), Git.

```bash
git clone https://github.com/viniciusandradde/app-prospere.git
cd app-prospere
pnpm install

docker compose -f docker/compose.yaml up -d     # PostgreSQL 16 local
cp .env.example .env                            # ajuste DATABASE_URL
pnpm --filter @prospere/web db:push             # cria as tabelas

pnpm dev                                        # http://localhost:3000
```

**E-mail (Resend):** o app envia o link de acesso e o lembrete do ritual pela [Resend](https://resend.com) ([ADR-009](docs/adr/009-provedor-de-email.md)). Configure `EMAIL_API_KEY` e `EMAIL_FROM` no `.env`. Enquanto não houver domínio verificado, use o remetente `onboarding@resend.dev` — ele entrega apenas para o e-mail dono da conta Resend. Confira com `pnpm email:testar voce@exemplo.com`.

Sem chave configurada (ou com `EMAIL_TRANSPORT=console`), o e-mail vai para o log do servidor e, fora de produção, o link de acesso aparece na própria tela de login.

**Comandos:**

| Comando | O que faz |
|:--|:--|
| `pnpm dev` | Sobe o app em desenvolvimento |
| `pnpm test` | Testes unitários (motor, catálogo, ferramentas) |
| `pnpm test:e2e` | Fluxo completo no navegador, desktop e mobile |
| `pnpm lint` / `pnpm typecheck` | Lint e tipos em todo o monorepo |
| `pnpm --filter @prospere/web db:generate` | Gera migration a partir do schema Drizzle |
| `pnpm email:testar <e-mail>` | Envia um e-mail de teste pela Resend |

**Lembretes do ritual:** um agendador externo chama `POST /api/cron/lembretes` com o cabeçalho `Authorization: Bearer $CRON_SECRET`.

**Materiais de origem:** os livros e e-books que embasaram o método **não são distribuídos** (direitos autorais). Para trabalhar com eles localmente:

```bash
python3 scripts/extract-sources.py <pasta-com-os-originais> sources/
```

`sources/` está no `.gitignore` e nunca deve ser versionado.

## Roadmap

| Semana | Entrega | Estado |
|:--|:--|:--|
| 1 | Monorepo, motor de trilha, conteúdo tipado, board | ✅ `pnpm test` verde, trilha gerada para as personas |
| 2 | Auth, board na UI, tela da trilha, missões | ✅ e2e: cadastro → board → trilha → missão concluída |
| 3 | Quadro Construir-Medir-Aprender + Construtor de Oferta | ✅ schema, formulário, render Markdown e testes |
| 4 | Revisão Semanal, lembretes, exportar, LGPD, deploy | ⏳ e-mail decidido (Resend); falta verificar o domínio e o deploy no Dokploy |
| 5–6 | Acompanhamento do beta, entrevistas, teste de preço | ⏳ **Gate** documentado em ADR |
| v1.1 | Pipeline, Planejador de Lançamento, chat por fase | Só se o gate passar |
| v2 | Edição Pessoal, Escalar como programa, workspace de empresa | — |

**Gate da semana 8:** 2 de 3 hipóteses batidas → v1.1. 1 → ajustar. 0 → pivotar. Critérios em [`docs/04-PRD-MVP-NEGOCIO.md`](docs/04-PRD-MVP-NEGOCIO.md#2-hipóteses-que-este-mvp-existe-para-testar-regra-5-do-método-aplicada-a-nós).

## Documentação

| Documento | O que traz |
|:--|:--|
| [00 — Visão geral](docs/00-VISAO-GERAL.md) | O pacote inteiro em uma página |
| [01 — Fontes e análise](docs/01-FONTES-E-ANALISE.md) | O que cada livro contribui e onde entra |
| [02 — Método PROSPERE](docs/02-METODO-PROSPERE.md) | Fases, arquétipos, ajustes, 12 regras |
| [03 — Conteúdo da trilha](docs/03-CONTEUDO-TRILHA.md) | Biblioteca de missões e ferramentas |
| [04 — PRD do MVP Negócio](docs/04-PRD-MVP-NEGOCIO.md) | **Escopo ativo**, hipóteses, requisitos, gate |
| [04 — PRD visão completa](docs/04-PRD-MVP.md) | Referência de longo prazo |
| [05 — Arquitetura e ADRs](docs/05-ARQUITETURA-E-ADRS.md) | Stack, decisões, estrutura |
| [06 — Schema](docs/06-schema.sql) | Modelo de dados PostgreSQL |
| [07 — Agentes](docs/07-AGENTES.md) | Os 10 especialistas |
| [08 — Plano de execução](docs/08-PLANO-CLAUDE-CODE.md) | Sprints, prompts, checklist |
| [09 — Pesquisa de mercado](docs/09-PESQUISA-MERCADO.md) | Concorrentes, demanda, precificação |

## Agentes especialistas

Dez subagentes em [`.claude/agents/`](.claude/agents), um por domínio do método. Cada um tem duas vidas: no repositório revisa e refina o conteúdo da sua fase; no produto (v1.1) vira a persona que conversa com o usuário dentro daquela fase.

`Bússola` (orquestrador) · `Comandante` (responsabilidade) · `Navegador` (rumo) · `Tesoureiro` (finanças) · `Cronista` (foco) · `Cientista` (validação) · `Persuasor` (oferta) · `Conector` (rede) · `Lançador` (vendas) · `Mentor` (liderança)

Regras que todos seguem: citar apenas livros publicados, nunca reproduzir trechos longos, números sempre como referência calibrável, persuasão só com gatilhos reais, finanças como processo educativo.

## Contribuindo

Leia [CONTRIBUTING.md](CONTRIBUTING.md). Em resumo: schema-first, TDD, ADR para decisão estrutural, branch `dev` → PR → `main`, português na UI e inglês no código.

## Créditos

O método sintetiza sete obras publicadas, citadas nominalmente no produto:

- **A Fórmula do Lançamento** — Jeff Walker
- **A Startup Enxuta** — Eric Ries
- **A Mente Influente** — Tali Sharot
- **As Armas da Persuasão 2.0** — Robert Cialdini
- **Nunca Almoce Sozinho** — Keith Ferrazzi
- **O Coach de 1 Trilhão de Dólares** — Schmidt, Rosenberg e Eagle
- **Responsabilidade Extrema** — Jocko Willink e Leif Babin

Os frameworks foram reescritos em palavras próprias e transformados em missões e ferramentas. Nenhum trecho é reproduzido. Compre os livros — eles valem muito mais que qualquer resumo.

## Aviso legal

O PROSPERE é uma ferramenta de organização e execução. **Não é** consultoria financeira, contábil, jurídica ou de investimentos. Não recomenda ativos, corretoras ou produtos financeiros: ensina o processo (reserva → quitação de juros altos → diversificação → revisão) e orienta a procurar instituições habilitadas. Números exibidos são referências iniciais para calibrar com dados próprios, nunca promessas de resultado.

## Licença

Software e conteúdo proprietários — © 2026 Vinícius de Souza Andrade / VSA Tecnologia. Todos os direitos reservados. Ver [LICENSE](LICENSE).

---

<sub>Feito em Dourados/MS 🇧🇷</sub>
