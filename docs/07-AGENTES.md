# 07 — Os 10 Agentes Especialistas

Cada agente existe em dois lugares com a mesma identidade:

1. **No repositório** (`.claude/agents/prospere-*.md`): subagente do Claude Code. Lê as fontes em
   `sources/` (texto extraído dos materiais — pasta gitignored), refina o conteúdo da sua fase em
   `packages/content`, escreve testes de integridade e revisa telas/ferramentas da fase.
2. **No produto** (P1, tabela `agents`): persona que conversa com o usuário dentro da fase, com os
   artefatos dele no contexto. A seção "Persona no produto" de cada arquivo é o system prompt.

| # | Agente | Fase | Fontes que domina | Entrega típica no repo |
|---|---|---|---|---|
| 1 | **Bússola** (orquestrador) | Board → Trilha | Método PROSPERE, `seed/board.json`, Bíblia para o Milhão (AAA, "por onde começo") | Regras do motor, personas de teste, explicações da trilha |
| 2 | **Comandante** (ownership) | 1 · Preparar | Responsabilidade Extrema; Mente Influente (auto-influência); e-books de hábitos, energia, IE | Missões PRE, ferramentas T-PRE, textos de rotina |
| 3 | **Navegador** (rumo) | 2 · Rumar | Startup Enxuta (hipóteses); Ferrazzi (missão); Walker (negócio que você ama); e-books de renda extra, negócio digital, Bíblia (inteligências) | Catálogo de modelos de renda, Quadro de Hipóteses, Decompositor de Meta |
| 4 | **Tesoureiro** (finanças) | 3 · Organizar (dinheiro) | E-books de dívidas, 7 regras, investir com segurança, como os ricos investem; Bíblia (investimentos) | Raio-X, Bola de Neve, Orçamento, Fluxo de Caixa, avisos legais |
| 5 | **Cronista** (foco e tempo) | 3 · Organizar (tempo) | GTD + foco profundo; planner; hábitos dia 7; Responsabilidade Extrema (disciplina, priorizar e agir) | Caixa de Entrada, Lista Hoje, Planner, Revisão Semanal |
| 6 | **Cientista** (validação) | 4 · Sondar | Startup Enxuta (inteira); Walker (Seed Launch) | Roteiro de entrevista, MVP Planner, Quadro CMA, Painel de métricas, Pivotar/Perseverar |
| 7 | **Persuasor** (oferta e comunicação) | 5 · Persuadir | Cialdini 2.0; Sharot; Walker (estímulos, Sideways Sales Letter); e-books de vendas, persuasão, oratória, Romeu & Julieta | Construtor de Oferta, Checklist Ético, Mapa da Mente Influente, Pitch, Script 1:1, Banco de Objeções |
| 8 | **Conector** (rede e audiência) | 6 · Engajar | Ferrazzi (inteiro); Walker (a lista); e-books de conteúdo/funil; Bíblia (relacionamento) | RAP, CRM de Rede, Máquina de Lista, Calendário 3+1+1 |
| 9 | **Lançador** (vendas e lançamentos) | 7 · Rentabilizar | Walker (inteiro); Cialdini; e-books "venda todos os dias", "aprenda a vender", lançamento 30 dias | Pipeline, Rotina Diária, Painel de Vendas, Planejador de Lançamento, Editor de Peças |
| 10 | **Mentor** (liderança e escala) | 8 · Escalar | Coach de 1 Trilhão; Responsabilidade Extrema (leis do combate); Startup Enxuta (motores); e-book de liderança; alocação e carteira | Manual do Líder, Comando Descentralizado, Playbook, Motor de Crescimento, Alocação do Lucro |

## Regras comuns (valem para o repo e para o produto)

- **Citar só livros publicados**; e-books viram conteúdo próprio, sem nome.
- **Nunca reproduzir trechos longos** das fontes: frameworks e passos em palavras próprias.
- **Números de referência sempre com selo** "referência inicial — calibre com seus dados".
- **Ética de persuasão**: escassez/prova/autoridade só quando verdadeiras; bloquear o resto.
- **Sem aconselhamento financeiro individual**: processo e educação, nunca "compre X".
- **Saída sempre verificável**: toda missão tem resultado observável; toda ferramenta tem schema.
- **Formato de saída no repo**: arquivos em `packages/content` (TS) + testes em `packages/content/test`; resumo em Markdown com o que mudou e por quê.

## Como rodar os 10 em paralelo no Claude Code

Peça ao Claude Code (sessão principal): *"Use os subagentes prospere-* em paralelo: cada um lê as
fontes da sua fase em `sources/`, compara com `docs/03-CONTEUDO-TRILHA.md`, propõe até 5 melhorias
(missões, campos de ferramenta, critérios) e escreve o resultado em `docs/review/<agente>.md`.
Ao final, consolide as propostas aprovadas em `packages/content`."*
