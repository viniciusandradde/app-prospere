# 04 — PRD do MVP · PROSPERE Negócio

> Substitui `04-PRD-MVP.md` como escopo ativo. O documento anterior fica como visão completa (ano 2).
> Recorte: **A3 Fundador(a)** e **A4 Operador(a)**. Tudo o mais sai do MVP — sem exceção.

## 1. Tese

Quem tem uma ideia ou um negócio pequeno não falha por falta de conteúdo; falha por não saber **o que
fazer esta semana**, por construir antes de validar e por não medir. O PROSPERE Negócio entrega uma
trilha personalizada de 5 fases (Rumar → Sondar → Persuadir → Engajar → Rentabilizar), ~20 missões
com resultado verificável, 3 ferramentas e um ritual semanal com números.

## 2. Hipóteses que este MVP existe para testar (regra 5 do método aplicada a nós)

| Hipótese | Como medimos | Critério de sucesso (20 usuários beta, 8 semanas) |
|---|---|---|
| **Valor**: fundadores/operadores seguem uma trilha personalizada e mantêm a revisão semanal | % com ≥ 3 revisões semanais consecutivas | ≥ 40% |
| **Resultado**: a trilha muda o número deles | % que registra 1ª venda, pré-venda ou experimento concluído | ≥ 30% |
| **Disposição a pagar**: o valor justifica assinatura | teste de preço com 3 âncoras na semana 6; entrevistas de saída | ≥ 5 usuários aceitam pagar a âncora média |
| **Crescimento** (a testar depois): rede, alunos e clientes atuais trazem os próximos 50 | origem dos cadastros | registrar, sem meta |

**Gate da semana 8**: bate pelo menos 2 das 3 primeiras → v1.1. Bate 1 → ajustar (trilha, ritual ou
preço) e repetir 4 semanas. Bate 0 → pivotar (edição Pessoal ou companion de consultoria).

## 3. Quem entra e quem não entra

- **Entra**: A3 (ideia/protótipo, sem faturamento) e A4 (negócio em operação, até ~R$ 1 mi/ano).
- **Não entra, mas deixa contato** (gates do board): empresa com time acima de R$ 1 mi/ano → lista de
  espera *Escalar* (serviço); renda extra/dívidas sem negócio → lista de espera *Pessoal*.
- Quem se diz A3 mas já tem clientes pagantes é tratado como A4 (regra ARC-VALIDATED).

## 4. O que saiu do MVP e para onde foi

| Cortado | Destino |
|---|---|
| Arquétipos A1, A2 (pessoa física) | Edição Pessoal (v2) — mesma engine, outro conteúdo e funil |
| Arquétipos A5, A6 e a fase Escalar | Serviço de consultoria/mentoria; app só como companion (v2) |
| 51 das 54 ferramentas | 2 voltam na v1.1 (Pipeline, Planejador de Lançamento); o resto só com demanda comprovada |
| Fases Preparar e Organizar completas | Checklist de 3 pré-requisitos + o ritual semanal |
| 10 agentes no produto | v1.1: 1 runtime de chat com prompt por fase (5 personas), com consentimento por conversa |
| Biblioteca, gamificação além do streak, exportar PDF, workspace de empresa, notificações push | Depois do gate |
| Catálogo no banco (`phases`, `missions`, `tools`, `books`) | Conteúdo como código (`packages/content`); sem tabelas |

## 5. Fluxo (5 telas)

1. **Board** — 7 perguntas, uma por tela, com os 2 gates de fora de escopo.
2. **Sua trilha** — resumo (arquétipo, meta decomposta em vendas/semana, tipo de lançamento), pré-requisitos, 5 fases com missões e estimativa de semanas.
3. **Missão** — objetivo, passos, resultado verificável, campo de resposta com template *ou* ferramenta *ou* contador; concluir/desfazer.
4. **Ferramenta** — Quadro Construir-Medir-Aprender · Construtor de Oferta · Revisão Semanal.
5. **Hoje** — próxima missão, 3 prioridades da semana, ritual pendente, número da semana vs. meta.

## 6. Requisitos P0

| ID | Requisito | Critérios de aceite |
|---|---|---|
| N-01 | Conta (e-mail + link mágico), workspace pessoal automático, consentimento e exclusão (LGPD) | Cadastro em < 1 min; exclusão apaga tudo do workspace |
| N-02 | Board de 7 perguntas (`seed/board.negocio.json`) com gates e lista de espera | Progresso salvo; gate registra e-mail + edição desejada e encerra com mensagem; conclui em < 4 min |
| N-03 | Motor de trilha determinístico | Mesma entrada → mesma saída; testes: 2 personas base + 7 ajustes + combinações (A4 com ideia; A3 sem ideia e nunca vendeu; < 5 h) |
| N-04 | Meta decomposta | vendas/semana e contatos/semana calculados do board; aparecem na trilha e na revisão semanal |
| N-05 | Trilha e missões | Pré-requisitos como checklist; REN-* bloqueadas até ORG-09; missões com template de resposta salvam texto; contadores (SON-01, PER-07, ENG-02, REN-02) incrementam com data |
| N-06 | Ferramenta 1 — Quadro Construir-Medir-Aprender | Cartões {hipótese, experimento, métrica, critério de sucesso, prazo ≤ 14 dias, resultado, aprendizado, decisão}; colunas A testar → Rodando → Medido → Aprendido; não vai para "Rodando" sem critério; as 2 hipóteses de RUM-05 nascem como cartões |
| N-07 | Ferramenta 2 — Construtor de Oferta | Promessa "ajudo [cliente] a [resultado] sem [obstáculo]", 3+3 benefícios, prova, garantia, escassez real ou "nenhuma", preço, ≥ 3 objeções com resposta; etapa final = checklist ético dos 7 princípios; não marca "final" com item "artificial"; gera a oferta em Markdown |
| N-08 | Ferramenta 3 — Revisão Semanal | 3 vitórias, 1 fuga de responsabilidade, números da semana (contatos, conversas, propostas, vendas, receita), aprendizado, 3 prioridades; streak; gráfico vs. meta; a cada 4ª revisão entra o bloco Pivotar/Perseverar; lembrete por e-mail no dia/hora escolhidos |
| N-09 | Exportar em Markdown (trilha, oferta, quadro, revisões) | Um clique; arquivo legível fora do app |
| N-10 | Telemetria mínima | `board_started`, `board_completed`, `gate_hit`, `mission_completed`, `artifact_saved`, `review_completed` |
| N-11 | Mobile-first (360 px), contraste AA, foco visível | Fluxo completo utilizável só no celular |

### v1.1 (só após o gate)
- Pipeline (T-REN-01) e Planejador de Lançamento (T-REN-04/05), absorvendo o Launch OS.
- Chat com contexto da fase: 1 runtime, 5 prompts (Navegador, Cientista, Persuasor, Conector, Lançador), artefatos só com consentimento explícito na conversa.
- Teste de preço em produção; cobrança.

### v2
- Edição Pessoal (A1/A2). Escalar como programa acompanhado + companion. Workspace de empresa.

## 7. A trilha Negócio (missões do MVP — IDs de `docs/03-CONTEUDO-TRILHA.md`)

**Pré-requisitos** (checklist, sem ferramenta): PRE-01 Auditoria de Responsabilidade (3 desculpas → 3 ações) · ORG-06 Lista Hoje com 3 prioridades · ORG-09 Conta separada + planilha de caixa (template externo) · ORG-08 Revisão Semanal (ritual, ferramenta 3).

| Fase | Base (A3 e A4) | Só A3 | Condicionais |
|---|---|---|---|
| Rumar | RUM-01 Canvas do Rumo (template) · RUM-04 Cliente ideal e dor (template) · RUM-05 Quadro de Hipóteses (cartões na ferramenta 1) | — | `sem_ideia` → RUM-02 Mapa de Forças, RUM-03 Modelo de renda |
| Sondar | SON-03 Experimento 1 (ferramenta 1) · SON-07 Pivotar/Perseverar (mensal, na revisão) | SON-01 10 entrevistas (contador) · SON-02 Definir MVP (template) · SON-04 Seed Launch (template + contador) | A4 com `ideia/prototipo` → SON-01, SON-02 |
| Persuadir | PER-01 + PER-02 Oferta e auditoria ética (ferramenta 2) · PER-04 Pitch de 15 s (template) · PER-07 5 conversas medidas (contador) | — | `nunca_vendi` → PER-05 Script 1:1, PER-06 Banco de objeções (templates) |
| Engajar | ENG-01 Plano de relacionamentos (planilha externa, 30 nomes) · ENG-02 1 encontro por semana (contador, 4 semanas) · ENG-05 Isca + captura (checklist, ferramenta externa) | — | — |
| Rentabilizar | REN-02 Rotina diária de vendas (contador diário) · REN-04 Planejar o lançamento (template; tipo seed ou interno pela audiência) · REN-06 Executar e fechar (retrospectiva em template) | — | `time_de_vendas` → REN-09 Playbook e daily |

Total: 4 pré-requisitos + 15 (A4) ou 18 (A3) missões base + até 4 condicionais. Esforço estimado
(horas fixas do `03` + recorrentes por 4 semanas; a rotina diária de vendas responde por ~20 h):
A4 ≈ 70 h, A3 ≈ 87 h. Em 8 semanas exige 9–11 h/semana; com 5–10 h a trilha se estende para ~12
semanas; com < 5 h entra o modo essencial. O beta mede se essa carga é realista.

## 8. Schema enxuto (11 tabelas — subconjunto de `docs/06-schema.sql`)

`users`, `workspaces`, `board_responses` (+ `edition`, `flags`), `waitlist` (nova: e-mail, edição,
respostas), `trails`, `trail_missions` (+ `counter`, `response_text`), `artifacts`, `rituals`,
`ritual_entries`, `metric_entries`, `events`. Catálogo (fases, missões, ferramentas, livros) vive em
`packages/content`. `artifact_versions`, `contacts`, `deals`, `launches`, `agents*` só na v1.1+.

## 9. Seis semanas

| Semana | Entrega | Pronto quando |
|---|---|---|
| 1 | Monorepo (`apps/web`, `packages/engine`, `packages/content`); engine + testes; conteúdo das ~26 missões tipado; board com gates | `pnpm test` verde; trilha gerada em teste para as personas |
| 2 | Auth, board na UI, tela da trilha, missões com template/contador | e2e: cadastro → board → trilha → concluir missão |
| 3 | Ferramentas 1 e 2 | Quadro e Oferta com schema, form, render Markdown e testes |
| 4 | Revisão Semanal + lembrete, tela Hoje, exportar, telemetria, LGPD básica, deploy Dokploy | Beta aberto para 20 pessoas (10 A3, 10 A4) |
| 5–6 | Acompanhar o beta; corrigir; entrevistas de saída; teste de preço | Decisão do gate documentada em ADR |

## 10. Riscos e mitigação

- **Templates de texto parecem "pobres" frente a ferramentas**: mitigado pelo resultado verificável e pelos contadores; a v1.1 só constrói a ferramenta que o beta pedir.
- **Usuário some entre missões**: o ritual semanal com lembrete e o "número da semana" são o gancho; se não retiver, o problema é a tese, não a feature.
- **Falta de vendas reais no beta em 8 semanas**: aceitar pré-venda e experimento concluído como sinal.

## 11. Impacto nos outros documentos

- `02` e `03` permanecem como mapa completo e biblioteca — nada muda.
- `05`: monorepo reduzido (`apps/web` com o Drizzle dentro, `packages/engine`, `packages/content`); ADR-003 já cobre catálogo em código.
- `06`: usar só as 11 tabelas acima; acrescentar `waitlist`.
- `07`: os 10 subagentes continuam úteis para revisar conteúdo; no produto, v1.1 usa 5 personas em 1 runtime.
- `08`: substituir os sprints pela tabela da seção 9.
