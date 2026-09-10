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
prospere/
├── README.md                     ← este arquivo
├── CLAUDE.md                     ← instruções para o Claude Code
├── .ai/                          ← context.md / progress.md / handoff.md (sua convenção multi-IDE)
├── .claude/agents/               ← 10 subagentes prontos (YAML frontmatter + system prompt)
├── seed/board.json               ← board completo (6 arquétipos, referência)
├── seed/board.negocio.json       ← BOARD ATIVO: 7 perguntas, gates, A3/A4, ajustes
├── scripts/extract-sources.py    ← converte os materiais originais em texto para `sources/` (gitignored)
└── docs/
    ├── 00-LEIA-ME.md
    ├── 01-FONTES-E-ANALISE.md    ← o que cada livro/material contribui e onde entra na trilha
    ├── 02-METODO-PROSPERE.md     ← a metodologia (fácil de aprender): 8 fases, ciclo AAA, arquétipos
    ├── 03-CONTEUDO-TRILHA.md     ← conteúdo completo: 67 missões, 54 ferramentas, critérios, créditos
    ├── 04-PRD-MVP.md             ← visão completa (referência)
    ├── 04-PRD-MVP-NEGOCIO.md     ← ESCOPO ATIVO: MVP da edição Negócio (A3/A4), 6 semanas
    ├── 05-ARQUITETURA-E-ADRS.md  ← stack (Next.js + shadcn/ui + PostgreSQL), decisões, estrutura
    ├── 06-schema.sql             ← schema PostgreSQL completo (MVP usa 11 tabelas — ver PRD Negócio)
    ├── 07-AGENTES.md             ← os 10 agentes especialistas (papel no repo + persona no produto)
    └── 08-PLANO-CLAUDE-CODE.md   ← sprints, prompts iniciais e checklist de execução
```

## 4. Como usar no Claude Code

1. Descompacte o ZIP: a pasta `prospere/` já é a raiz do repositório (`CLAUDE.md`, `.ai/`, `.claude/`, `docs/`, `seed/`, `scripts/`).
2. Abra o Claude Code e rode o prompt de kickoff de `08-PLANO-CLAUDE-CODE.md` (Sprint 0).
3. Os 10 subagentes em `.claude/agents/` podem ser acionados em paralelo para (a) revisar as
   fontes com mais profundidade e (b) refinar o conteúdo da fase que cada um domina.
4. A partir daí, o fluxo é o seu de sempre: schema-first → TDD → ADR → branch `dev` → `main` → Dokploy.

## 5. Nota de honestidade sobre o processo

Nesta conversa não existe execução paralela de agentes. A análise foi feita por mim, organizada em
**10 lentes especialistas** (as mesmas que viraram os 10 agentes). Os arquivos em `.claude/agents/`
são o meio de rodar esse trabalho de verdade em paralelo dentro do Claude Code — e também servem
de base para as personas dos agentes dentro do produto.

Observação técnica: os arquivos do projeto chamados `.pdf` não são PDFs — os livros são texto puro e
os e-books são pacotes ZIP (texto por página + imagem). A extração foi feita sobre esse conteúdo.
