> **Novo por aqui?** Comece pelo [README](../README.md) na raiz do repositório.
> Escopo ativo do MVP: [04-PRD-MVP-NEGOCIO.md](04-PRD-MVP-NEGOCIO.md).

# PROSPERE — Sistema de Trilhas para Prosperidade

> Pacote de planejamento do MVP. Gerado a partir da leitura dos 28 materiais do projeto
> (7 livros publicados + 21 e-books/materiais do Projeto Milhão). Pronto para continuar no Claude Code.

## 1. Nome sugerido

**PROSPERE** — imperativo de "prosperar". Curto, brandável, funciona em PT/ES/EN e o próprio nome
é o acrônimo do método (8 fases = 8 letras):

| Letra | Fase | Verbo-guia |
|---|---|---|
| **P** | Preparar | Assumir o comando de si (mentalidade, hábitos, energia) |
| **R** | Rumar | Definir objetivo, modelo de renda e hipóteses |
| **O** | Organizar | Dinheiro e tempo sob controle |
| **S** | Sondar | Validar com o mercado antes de investir pesado |
| **P** | Persuadir | Oferta, mensagem e habilidade de vender |
| **E** | Engajar | Rede, audiência e lista |
| **R** | Rentabilizar | Lançar e vender todos os dias |
| **E** | Escalar | Time, liderança, sistemas e multiplicação |

Tagline: **"Sua trilha do zero ao próximo nível."**

Alternativas, se preferir: **NORTE** (bússola/direção), **ASCENDA**, **VETOR** (direção + magnitude).
Não verifiquei disponibilidade de domínio nem registro no INPI — fazer antes de fixar a marca.

## 2. O que o sistema faz (em uma frase)

A pessoa (ou empresa) responde um **Board de Diagnóstico** de ~12 perguntas; o sistema identifica o
**ponto de partida** (6 arquétipos, de "Recomeço" a "Corporação"), gera uma **trilha personalizada**
pelas 8 fases (pulando, resumindo ou aprofundando cada uma), e entrega em cada fase **missões +
ferramentas** (formulários estruturados que viram artefatos: orçamento, oferta, experimento, plano de
lançamento etc.), com um **ritual semanal de revisão** e, na fase 2 do produto, **10 agentes de IA
especialistas** que acompanham cada etapa.

## 3. Estrutura do pacote

```
app-prospere/
├── CLAUDE.md                     ← instruções para o Claude Code (comece por aqui)
├── .ai/                          ← context.md / progress.md / handoff.md
├── .claude/agents/               ← 10 subagentes especialistas
├── apps/web/                     ← o app: board, trilha, missões, ferramentas, ritual
├── packages/engine/              ← motor de trilha determinístico
├── packages/content/             ← catálogo como código (missões, ferramentas, livros)
├── e2e/                          ← Playwright: o fluxo completo no navegador
├── docker/                       ← Dockerfile (Dokploy) e Postgres local
├── seed/board.negocio.json       ← BOARD ATIVO: 7 perguntas, gates, A3/A4, ajustes
├── seed/board.json               ← board completo (referência)
├── scripts/                      ← extração de fontes, checagens de e-mail
└── docs/
    ├── 00-VISAO-GERAL.md
    ├── 01-FONTES-E-ANALISE.md    ← o que cada livro contribui e onde entra na trilha
    ├── 02-METODO-PROSPERE.md     ← a metodologia: 8 fases, ciclo AAA, arquétipos
    ├── 03-CONTEUDO-TRILHA.md     ← biblioteca completa: 67 missões, 54 ferramentas
    ├── 04-PRD-MVP.md             ← visão completa (referência)
    ├── 04-PRD-MVP-NEGOCIO.md     ← ESCOPO ATIVO: edição Negócio (A3/A4)
    ├── 05-ARQUITETURA-E-ADRS.md  ← stack, decisões, estrutura
    ├── 06-schema.sql             ← schema de referência (o executável é o Drizzle)
    ├── 07-AGENTES.md             ← os 10 agentes especialistas
    ├── 08-PLANO-CLAUDE-CODE.md   ← como rodar e continuar no Claude Code
    ├── 09-PESQUISA-MERCADO.md    ← concorrentes, demanda, precificação
    └── adr/                      ← Architecture Decision Records
```

> **O que está implementado**: a edição Negócio — 5 fases, 27 missões e 3 ferramentas. As demais
> missões e ferramentas seguem em `docs/03` como biblioteca do método, fora do escopo atual.

## 4. Como usar no Claude Code

1. Clone o repositório e siga a seção 1 de [`08-PLANO-CLAUDE-CODE.md`](08-PLANO-CLAUDE-CODE.md):
   `pnpm install`, Postgres no Docker, `.env`, `db:push`, `pnpm dev`.
2. Abra o Claude Code na raiz — ele lê `CLAUDE.md` sozinho (comandos, mapa do código, regras).
3. O que fazer em seguida está em `.ai/handoff.md`.
4. Os 10 subagentes em `.claude/agents/` revisam e refinam o conteúdo de cada fase; a sessão
   principal consolida.
5. O fluxo é o de sempre: schema-first → TDD → ADR → branch `dev` → `main` → Dokploy.

## 5. Nota de honestidade sobre o processo

Nesta conversa não existe execução paralela de agentes. A análise foi feita por mim, organizada em
**10 lentes especialistas** (as mesmas que viraram os 10 agentes). Os arquivos em `.claude/agents/`
são o meio de rodar esse trabalho de verdade em paralelo dentro do Claude Code — e também servem
de base para as personas dos agentes dentro do produto.

Observação técnica: os arquivos do projeto chamados `.pdf` não são PDFs — os livros são texto puro e
os e-books são pacotes ZIP (texto por página + imagem). A extração foi feita sobre esse conteúdo.
