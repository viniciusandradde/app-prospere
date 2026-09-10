# 03 — Conteúdo da Trilha (biblioteca de missões e ferramentas)

Convenções:
- **Peso mínimo** da missão: `L` aparece em light/medium/full; `M` em medium/full; `F` só em full.
- **Esforço**: horas estimadas (usado para calendarizar a trilha).
- **Ferramenta** = formulário estruturado que salva um **artefato** (JSON validado por schema).
  Campos: `nome (tipo)`; tipos: `texto`, `numero`, `moeda`, `data`, `lista[...]`, `escolha[a|b]`, `tabela{...}`.
- **Créditos**: só livros publicados aparecem para o usuário. Referências internas (e-books) ficam em `docs/01-FONTES-E-ANALISE.md`.
- Números de referência são pontos de partida, exibidos com o selo "referência inicial — calibre com seus dados".

---

## Fase 1 — PREPARAR · "Estou no comando de mim?"

**Objetivo**: assumir responsabilidade total, instalar uma rotina mínima de energia e foco e mapear
quem você é antes de decidir para onde vai.
**Crédito visível**: *Responsabilidade Extrema* (Willink & Babin); *A Mente Influente* (Sharot).

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| PRE-01 | Auditoria de Responsabilidade | L | 1 h | 5 desculpas recorrentes convertidas em 5 ações sob seu controle |
| PRE-02 | Autoavaliação dos 15 traços | L | 1 h | Nota 1–5 nos 15 traços; 3 prioridades de desenvolvimento escolhidas |
| PRE-03 | Rotina matinal por 7 dias | L | 15 min/dia | 7 check-ins consecutivos (acordar 15 min antes, água, gratidão + 1 objetivo, 5–10 min de movimento, sem celular por 30 min) |
| PRE-04 | Protocolo de energia | M | 30 min + diário | Respiração 4-4-6 (3x/dia), hidratação por blocos, ciclos 90/20, 30 min de luz natural — registrados por 5 dias |
| PRE-05 | Diário emocional de 7 dias | M | 10 min/dia | 3 registros/dia (emoção, gatilho, reação) + mapa dos 10 gatilhos |
| PRE-06 | Círculo de influência | M | 45 min | 10 pessoas classificadas (alimentadores × drenos) + 2 ações (mais tempo com quem eleva, limite com quem drena) |
| PRE-07 | Compromisso público | F | 30 min | Meta e prazo contados a 1 pessoa de confiança + data de check-in marcada |

### Ferramentas
**T-PRE-01 · Auditoria de Responsabilidade** — campos: `situacao (texto)`, `desculpa_habitual (texto)`, `o_que_esta_sob_meu_controle (texto)`, `acao_esta_semana (texto)`, `prazo (data)` × 5 linhas. Saída: lista de ações que entra na Lista Hoje.
**T-PRE-02 · Autoavaliação dos 15 traços** — 15 sliders 1–5 (otimismo, automotivação, orientação a objetivos, autorresponsabilidade, autodisciplina, autoestima, autoconhecimento, inteligência emocional, persistência, paixão, empatia, proatividade, saúde mental, resiliência, controle do ego) + `prioridades (lista[3])`. Saída: radar + 3 prioridades vinculadas a missões.
**T-PRE-03 · Rastreador de Rotina** — tabela diária com 5 checkboxes; streak; lembrete no horário escolhido.
**T-PRE-04 · Protocolo de Energia** — checklist diário (respiração ×3, água por bloco, 4 ciclos 90/20, luz natural, soneca opcional ≤ 20 min antes das 16h) + `energia_percebida (1–10)`.
**T-PRE-05 · Diário Emocional** — `hora`, `emocao (escolha)`, `gatilho (texto)`, `reacao (texto)`, `proporcional? (sim|não)`. Saída automática: top 10 gatilhos.

**Critério de conclusão da fase**: PRE-01, PRE-02 e PRE-03 concluídas (light); + PRE-04/05/06 (medium); + PRE-07 (full).

---

## Fase 2 — RUMAR · "Para onde vou e por qual caminho?"

**Objetivo**: transformar desejo em meta numérica com prazo, escolher um modelo de renda coerente
com suas forças e escrever as duas apostas que precisam de prova.
**Crédito visível**: *A Startup Enxuta* (Ries) — hipóteses de valor e crescimento; *Nunca Almoce Sozinho* (Ferrazzi) — missão antes da rede; *A Fórmula do Lançamento* (Walker) — negócio que você ama.

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| RUM-01 | Canvas do Rumo | L | 1 h | Meta 12 meses em R$ + prazo + "porquê" + 3 marcos trimestrais |
| RUM-02 | Mapa de Forças | L | 1 h | 8 tipos de inteligência pontuados; 5 habilidades; 5 ativos (rede, audiência, equipamentos, tempo, capital); ramo desejado em 10 anos |
| RUM-03 | Escolha do modelo de renda | L | 2 h | 1 modelo escolhido entre as opções filtradas por tempo/capital/habilidade (e 1 reserva) |
| RUM-04 | Cliente ideal e dor | M | 1 h | Avatar (nome, contexto, dor, sonho, objeção) + a transformação prometida |
| RUM-05 | Quadro de Hipóteses | M | 1 h | Hipótese de valor + hipótese de crescimento escritas como afirmações testáveis |
| RUM-06 | Meta decomposta | L | 30 min | Meta mensal → semanal → diária (ex.: R$ 10 mil = 213 vendas de R$ 47 = 7/dia) |
| RUM-07 | Mentor e conversas de campo | F | 3 h | 3 conversas com quem já faz; 1 mentor identificado e abordado |

### Ferramentas
**T-RUM-01 · Canvas do Rumo** — `meta_12m (moeda)`, `prazo (data)`, `porque (texto)`, `marco_90d/180d/270d (texto)`, `o_que_abandono (texto)`.
**T-RUM-02 · Mapa de Forças** — `inteligencias (tabela{tipo, nota 1–5})`, `habilidades (lista)`, `ativos (lista)`, `ramo_10_anos (texto)`.
**T-RUM-03 · Seletor de Modelo de Renda** — filtros: `horas_semana`, `capital_inicial`, `habilidades`, `prefere (digital|físico|serviço)`; catálogo com ~30 modelos (freelance especializado, serviços locais, revenda, artesanal, dropshipping, minicurso, aulas, mentoria, conteúdo, dev web, edição de vídeo, gestão de redes, entregas, design, redação, fotografia, consultoria, eventos, limpeza, beleza, reparos, infoproduto, afiliados, SaaS, assinatura, e-commerce, franquia de serviço, consultoria B2B, treinamento corporativo, licenciamento). Cada modelo tem: capital mínimo, tempo até 1ª venda, ticket típico, escalabilidade, primeiro passo em 7 dias.
**T-RUM-04 · Cliente Ideal** — `nome`, `contexto`, `dor_principal`, `o_que_ja_tentou`, `sonho`, `objecao_provavel`, `transformacao (de → para)`.
**T-RUM-05 · Quadro de Hipóteses** — `hipotese_valor (texto: "Acreditamos que [cliente] paga R$[x] por [solução] porque [dor]")`, `hipotese_crescimento (texto: "Novos clientes chegam por [canal] a custo [y]")`, `risco_maior (escolha)`.
**T-RUM-06 · Decompositor de Meta** — `meta_mensal`, `ticket_medio`, `conversao_estimada` → vendas/dia, contatos/dia, leads/semana.

**Critério de conclusão**: RUM-01, 02, 03, 06 (light); + 04, 05 (medium); + 07 (full).

---

## Fase 3 — ORGANIZAR · "Meu dinheiro e meu tempo estão sob controle?"

**Objetivo**: visibilidade total das finanças, plano de saída das dívidas, reserva iniciada e um sistema
de tempo com 3 prioridades por dia e revisão semanal.
**Crédito visível**: *Responsabilidade Extrema* (disciplina é liberdade; priorizar e agir).

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| ORG-01 | Raio-X financeiro | L | 2 h | Todas as receitas, despesas (fixas/variáveis) e dívidas (credor, saldo, juros, vencimento) registradas; saldo mensal calculado |
| ORG-02 | Plano Bola de Neve | L* | 1 h | Dívidas ordenadas; mínimo em todas; extra na menor; data projetada de quitação (*obrigatória se houver dívida) |
| ORG-03 | Negociação com credores | M* | 2 h | Proposta preparada (renda comprovada, capacidade mensal, pedido: desconto/juros/prazo) e 1 negociação feita e documentada |
| ORG-04 | Orçamento 50-30-20 | L | 1 h | Limites por categoria; reserva com aporte automático (mesmo R$ 50); 3 "caixinhas" (necessidades, dívidas/metas, lazer) |
| ORG-05 | Reserva de emergência | M | 30 min | Meta de 3–6 meses definida; conta/produto de liquidez diária escolhido; aporte recorrente ativo |
| ORG-06 | Caixa de entrada + Lista Hoje | L | 1 h | "Brain dump" completo processado (fazer/delegar/adiar/arquivar); regra dos 2 min; Lista Hoje com ≤ 3 prioridades |
| ORG-07 | Planner de blocos | L | 30 min/sem | Semana com blocos de 90 min protegidos para as prioridades; horários de "não" comunicados |
| ORG-08 | Revisão Semanal (ritual) | L | 30 min/sem | 2 revisões concluídas (3 vitórias, 1 fuga, 3 prioridades, número da semana) |
| ORG-09 | Finanças do negócio | M | 2 h | Conta separada; fluxo de caixa semanal; alocação por categoria (marketing, equipe, tecnologia, operação, impostos, reserva, lucro) — para A3–A6 |

### Ferramentas
**T-ORG-01 · Raio-X Financeiro** — `receitas (tabela{fonte, valor, frequência})`, `despesas (tabela{item, valor, fixa|variável})`, `dividas (tabela{credor, saldo, juros_am, vencimento, tipo})`. Saída: saldo mensal, total de dívida, juros mensais pagos, gráfico.
**T-ORG-02 · Bola de Neve** — usa as dívidas do raio-X; `valor_extra_mensal (moeda)`; simula ordem por menor saldo (bola de neve) e por maior juros (avalanche); mostra data de quitação e juros economizados.
**T-ORG-03 · Script de Negociação** — gera roteiro: preparação (comprovantes, capacidade, proposta), pedidos (desconto, isenção de juros/multa, prazo, parcelamento sem juros), erros a evitar, `registro (texto)`, `resultado (escolha)`.
**T-ORG-04 · Orçamento 50-30-20** — `renda_liquida` → sugestão 50/30/20 editável; alertas de estouro; `caixinhas` opcional.
**T-ORG-05 · Caixa de Entrada GTD** — captura rápida; triagem (`acao? sim|não` → fazer agora ≤ 2 min / agendar / delegar / projeto / algum dia / arquivo / lixo); Lista Hoje limitada a 3.
**T-ORG-06 · Planner Semanal** — grade semanal; blocos de 90 min; vincula prioridade da Lista Hoje.
**T-ORG-07 · Revisão Semanal** — `vitorias (lista[3])`, `fuga_de_responsabilidade (texto)`, `numero_da_semana (numero + meta)`, `aprendizado (texto)`, `prioridades_proxima (lista[3])`. Saída: streak, histórico, gráfico do número.
**T-ORG-08 · Fluxo de Caixa do Negócio** — `entradas/saídas por semana`, categorias com % alvo, reserva operacional (3–6 meses).

**Critério de conclusão**: ORG-01, 04, 06, 07, 08 (light; + 02 se houver dívida); + 03, 05, 09 (medium/full).

---

## Fase 4 — SONDAR · "Alguém paga por isso?"

**Objetivo**: provar (ou derrubar) a hipótese de valor com o menor experimento possível e conseguir a
primeira venda ou pré-venda antes de construir o produto completo.
**Crédito visível**: *A Startup Enxuta* (Ries); *A Fórmula do Lançamento* (Walker) — Seed Launch.

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| SON-01 | 10 entrevistas de descoberta | L | 6 h | 10 conversas registradas com o roteiro (contexto, dor, o que já tentou, quanto custa o problema, o que pagaria) |
| SON-02 | Definir o MVP | L | 1 h | Tipo de MVP escolhido (concierge, protótipo, página + lista de espera, pré-venda, vídeo) e o que fica de fora |
| SON-03 | Experimento 1 (Construir-Medir-Aprender) | L | 8 h | Hipótese, métrica, critério de sucesso definidos **antes**; resultado e aprendizado registrados |
| SON-04 | Seed Launch (pré-venda) | M | 10 h | Oferta simples para 10–30 pessoas da lista/rede; ≥ 1 pagamento ou compromisso firmado |
| SON-05 | Painel de métricas acionáveis | M | 1 h | Funil semanal (contatos → conversas → propostas → vendas) por coorte; métricas de vaidade excluídas |
| SON-06 | Cinco porquês | M | 30 min | 1 problema analisado até a causa-raiz com ação proporcional |
| SON-07 | Reunião Pivotar/Perseverar | L | 1 h/mês | Decisão registrada (perseverar / ajustar / pivotar) com justificativa nas métricas |
| SON-08 | Sandbox de inovação (empresas) | F | 4 h | Time pequeno, escopo protegido, métricas próprias e autonomia para experimentar — A5/A6 |

### Ferramentas
**T-SON-01 · Roteiro de Entrevista** — 8 perguntas abertas (nunca "você compraria?"); `registro por entrevista {nome, contexto, dor citada, intensidade 1–5, solução atual, custo do problema, disposição a pagar, frase marcante}`. Saída: nuvem de dores, ranking de intensidade.
**T-SON-02 · MVP Planner** — `tipo (escolha)`, `o_que_entra (lista)`, `o_que_fica_fora (lista)`, `custo`, `prazo (≤ 14 dias)`, `como_medir`.
**T-SON-03 · Quadro Construir-Medir-Aprender** — cartões: `hipotese`, `experimento`, `metrica`, `criterio_sucesso`, `prazo`, `resultado`, `aprendizado`, `decisao (perseverar|ajustar|pivotar)`. Kanban: A testar → Rodando → Medido → Aprendido.
**T-SON-04 · Seed Launch** — passo a passo: lista de 10–30 pessoas, 3 mensagens (problema → solução em construção → convite com preço e vagas reais), calendário de 7–10 dias, `vendas`, `feedbacks`.
**T-SON-05 · Painel de Métricas** — entrada semanal de `contatos, conversas, propostas, vendas, receita`; taxas automáticas; comparação entre coortes semanais.
**T-SON-06 · Cinco Porquês** — cadeia de 5 perguntas + `acao_proporcional`.
**T-SON-07 · Reunião Pivotar/Perseverar** — resumo automático do quadro + painel; `decisao`, `motivo`, `proximo_experimento`.

**Critério de conclusão**: SON-01, 02, 03, 07 (light); + 04, 05, 06 (medium); + 08 (full, empresas).

---

## Fase 5 — PERSUADIR · "Minha oferta e minha mensagem convencem?"

**Objetivo**: construir uma oferta com valor percebido acima do preço, comunicar em 15 segundos,
conduzir uma conversa de venda e tratar objeções — sempre com gatilhos verdadeiros.
**Crédito visível**: *As Armas da Persuasão 2.0* (Cialdini); *A Mente Influente* (Sharot); *A Fórmula do Lançamento* (Walker) — estímulos mentais e Sideways Sales Letter.

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| PER-01 | Construir a oferta | L | 2 h | Promessa em 1 frase ("Ajudo [cliente] a [resultado] sem [obstáculo]"), 3 benefícios emocionais + 3 práticos, prova, garantia, escassez real, 5 objeções respondidas |
| PER-02 | Auditoria ética dos 7 princípios | L | 45 min | Cada princípio marcado como "verdadeiro/aplicado", "não se aplica" ou "removido por ser artificial" |
| PER-03 | Mapa da Mente Influente | M | 1 h | Para o cliente ideal: crença prévia, emoção a sincronizar, incentivo positivo, escolha oferecida, lacuna de curiosidade, estado ao receber a mensagem, prova dos "outros" |
| PER-04 | Pitch de 15 segundos + SPSA | L | 1 h | Gancho (pergunta/número/história) + Situação-Problema-Solução-Ação; gravado e reescrito 3 vezes |
| PER-05 | Script de venda 1:1 | M | 2 h | Abertura → diagnóstico (perguntas) → proposta (transformação, empilhamento, comparação de valor) → objeções → fechamento com pergunta direta |
| PER-06 | Banco de objeções | M | 1 h | "Está caro", "não sei se funciona", "não preciso agora", + 2 específicas — cada uma com resposta "sim, e…" e prova |
| PER-07 | 5 conversas de venda medidas | L | 5 h | 5 aplicações do script com resultado e taxa de conversão registrados |
| PER-08 | Apresentação de alto impacto | F | 4 h | Checklist de preparação cumprido, 5 ensaios em voz alta, gravação analisada |

### Ferramentas
**T-PER-01 · Construtor de Oferta** — `promessa`, `beneficios_emocionais (lista[3])`, `beneficios_praticos (lista[3])`, `prova (depoimento|caso|número)`, `garantia`, `escassez_real (texto ou "nenhuma")`, `bonus (lista)`, `preco`, `comparacao_de_valor (texto)`, `objecoes (tabela{objeção, resposta})`. Saída: página de oferta em texto pronta para copiar.
**T-PER-02 · Checklist Ético (Cialdini 7)** — para uma peça: reciprocidade, afeição, aprovação social, autoridade, escassez, compromisso e coerência, unidade → `status (aplicado|n/a|removido)`, `como (texto)`. Bloqueia escassez/prova marcadas como artificiais.
**T-PER-03 · Mapa da Mente Influente** — 7 campos (um por fator de Sharot) + `mensagem_reescrita`.
**T-PER-04 · Gerador de Pitch** — `gancho (escolha: pergunta|estatística|história)`, `situacao`, `problema`, `solucao`, `acao`; contador de 15 s; `gravacao (upload opcional)`.
**T-PER-05 · Script 1:1** — template por etapa com perguntas de diagnóstico (contexto, dor, custo, tentativa, critério de decisão, orçamento, prazo) e regra 80/20 de escuta; `notas_por_conversa`.
**T-PER-06 · Banco de Objeções** — tabela reutilizável ligada à oferta.
**T-PER-07 · Checklist de Apresentação** — objetivo, público, esqueleto, histórias, 5 ensaios, gravação, objeções, equipamentos.

**Critério de conclusão**: PER-01, 02, 04, 07 (light); + 03, 05, 06 (medium); + 08 (full).

---

## Fase 6 — ENGAJAR · "Quem me conhece, confia e me indica?"

**Objetivo**: construir a rede de forma generosa e sistemática e transformar atenção em lista própria.
**Crédito visível**: *Nunca Almoce Sozinho* (Ferrazzi); *A Fórmula do Lançamento* (Walker) — a lista.

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| ENG-01 | Plano de Ação de Relacionamentos | L | 2 h | Missão → objetivos de 90 dias → 30 nomes (clientes, mentores, pares, guardiães, super-conectores) com "como ajudo primeiro" |
| ENG-02 | 1 encontro por semana | L | 1 h/sem | 4 encontros (café, almoço, call) com follow-up em 24 h |
| ENG-03 | Dever de casa + abordagem | M | 2 h | 5 abordagens a desconhecidos com pesquisa prévia e pedido pequeno e claro |
| ENG-04 | Rotina de pings | M | 30 min/sem | Contatos-chave tocados a cada 30/60/90 dias (mensagem, indicação, conteúdo útil) |
| ENG-05 | Isca digital + captura | L | 4 h | Lead magnet específico para a dor do cliente ideal; página de captura no ar; meta de leads/dia |
| ENG-06 | Sequência de boas-vindas | M | 3 h | 5–7 mensagens (história, dor, erro comum, método, prova, convite) programadas |
| ENG-07 | Calendário de conteúdo 3+1+1 | M | 2 h/sem | 4 semanas de 3 posts + 1 artigo + 1 vídeo, cada peça com CTA para a captura |
| ENG-08 | Evento âncora | F | 6 h | 1 jantar/encontro/live com convidado âncora e 8–12 participantes; apresentações feitas entre eles |

### Ferramentas
**T-ENG-01 · Plano de Ação de Relacionamentos** — `missao`, `objetivos_90d (lista[3])`, tabela `{nome, tipo (cliente|mentor|par|guardião|super-conector|parceiro), por_que_importa, como_ajudo_primeiro, proximo_passo, data}`.
**T-ENG-02 · CRM de Rede** — contatos com `tipo`, `origem`, `ultimo_contato`, `proximo_ping (30|60|90 dias)`, `notas`, `favores_feitos/recebidos`; lembretes; visão "quem devo tocar esta semana".
**T-ENG-03 · Roteiro de Abordagem** — `pesquisa (3 fatos)`, `ponto_em_comum`, `pedido_pequeno`, `oferta_de_ajuda`, `mensagem_final`.
**T-ENG-04 · Máquina de Lista** — `isca (título, formato, dor que resolve)`, `pagina (headline, promessa, campo)`, `meta_leads_dia`, `origem_de_trafego (orgânico|pago R$/dia|parcerias)`; registro diário de leads.
**T-ENG-05 · Sequência de Mensagens** — 7 slots com objetivo de cada mensagem e texto.
**T-ENG-06 · Calendário de Conteúdo** — grade semanal 3+1+1; `tema`, `formato`, `CTA`, `status`.

**Critério de conclusão**: ENG-01, 02, 05 (light); + 03, 04, 06, 07 (medium); + 08 (full).

---

## Fase 7 — RENTABILIZAR · "Estou vendendo todos os dias — e lançando?"

**Objetivo**: instalar a rotina diária de vendas com métricas e executar lançamentos em ciclos.
**Crédito visível**: *A Fórmula do Lançamento* (Walker); *As Armas da Persuasão 2.0* (Cialdini).

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| REN-01 | Pipeline de vendas | L | 1 h | Todas as oportunidades em estágios (lead → contato → diagnóstico → proposta → ganho/perdido) |
| REN-02 | Rotina diária de vendas | L | 1 h/dia | 30 dias: manhã (meta do dia e abordagens), tarde (follow-ups), fim do dia (registro) |
| REN-03 | Painel de vendas | L | 30 min/sem | Conversão, ticket médio, ciclo, LTV, CAC atualizados semanalmente; 1 ajuste por semana no ponto mais fraco do funil |
| REN-04 | Planejar o lançamento | M | 4 h | Calendário: pré-pré (7 dias, ouvir a lista) → PLC 1-2-3 (5–12 dias) → abertura (4–7 dias) → fecho → pós; estímulos distribuídos por peça |
| REN-05 | Produzir as peças | M | 12 h | PLC1 (oportunidade), PLC2 (transformação), PLC3 (posse), e-mails/mensagens de abertura, meio e último dia |
| REN-06 | Executar e fechar | M | 8 h | Lançamento rodado; vendas, receita e aprendizados registrados; depoimentos coletados no pós |
| REN-07 | Multiplicadores de receita | M | 2 h | 1 multiplicador ativado: high ticket (versão premium), upsell, recorrência ou afiliados |
| REN-08 | Lançamento conjunto (JV) | F | 8 h | 1 parceiro com audiência complementar; oferta co-promovida; divisão de resultados acordada |
| REN-09 | Playbook e daily de vendas (times) | F | 4 h | Playbook (scripts, objeções, KPIs), daily de 15 min, dashboard visível, comissão por faixa — A4/A5/A6 |

### Ferramentas
**T-REN-01 · Pipeline** — kanban de oportunidades: `contato`, `origem`, `valor`, `estagio`, `proxima_acao`, `data`; taxa por estágio.
**T-REN-02 · Rotina Diária** — checklist AM/PM/EOD; `abordagens_meta` (do Decompositor de Meta); `follow_ups`; `vendas_do_dia`.
**T-REN-03 · Painel de Vendas** — entradas semanais → conversão (meta inicial > 5%), ticket, ciclo, LTV, CAC; "ponto mais fraco do funil" destacado com sugestão (leads baixos → isca/divulgação; conversão baixa → oferta/página; engajamento baixo → conteúdo).
**T-REN-04 · Planejador de Lançamento** — wizard: `tipo (seed|interno|conjunto|business)`, `data_abertura`, `dias_carrinho`, gera timeline com tarefas datadas, checklist de peças e mapa de estímulos (autoridade, reciprocidade, expectativa, comunidade, prova social, escassez real) por peça.
**T-REN-05 · Editor de Peças** — 1 template por peça (PLC1: história + oportunidade + o que vem; PLC2: método + transformação + prova; PLC3: como é ter + FAQ + "amanhã abre"; abertura; meio; último dia) com o Checklist Ético embutido.
**T-REN-06 · Retrospectiva de Lançamento** — `leads`, `abertura`, `vendas`, `receita`, `conversao`, `o_que_funcionou`, `o_que_muda`, `depoimentos`.
**T-REN-07 · Mapa de Multiplicadores** — 4 cartões (premium, upsell, recorrência, afiliados) com `oferta`, `preco`, `quem`, `quando`.

**Critério de conclusão**: REN-01, 02, 03 (light); + 04, 05, 06, 07 (medium); + 08, 09 (full).

---

## Fase 8 — ESCALAR · "O negócio cresce sem depender só de mim?"

**Objetivo**: liderar pessoas, descentralizar decisões, documentar sistemas, escolher um motor de
crescimento e multiplicar o lucro com regras de alocação.
**Crédito visível**: *O Coach de 1 Trilhão de Dólares*; *Responsabilidade Extrema*; *A Startup Enxuta* (motores de crescimento); *Nunca Almoce Sozinho* (parcerias).

### Missões
| ID | Missão | Peso | Esforço | Resultado verificável |
|---|---|---|---|---|
| ESC-01 | Manual do Líder | L | 2 h | Pauta fixa de 1:1 (desempenho, pares, time, inovação) e reunião semanal de time (relatos pessoais + prioridades) |
| ESC-02 | 4 semanas de 1:1 | L | 30 min/pessoa/sem | 1:1 com cada liderado direto por 4 semanas, com registro |
| ESC-03 | Missão simples + comando descentralizado | L | 2 h | Missão em 1 frase que todos repetem; "porquê" explicado; matriz de quem decide o quê |
| ESC-04 | Priorizar e agir | M | 1 h | Os 3 maiores problemas ranqueados; o time inteiro no primeiro até resolver |
| ESC-05 | Playbook de processos | M | 6 h | 3 processos mapeados (venda, entrega, cobrança/suporte), automatizados onde couber, documentados em vídeo/texto, com KPI |
| ESC-06 | Contratação com critério | M | 3 h | Perfil: inteligência, dedicação, integridade, resiliência; roteiro de entrevista; período de teste com metas |
| ESC-07 | Motor de crescimento | M | 2 h | Motor escolhido (recorrente, viral ou pago) com a métrica que o move e experimento em curso |
| ESC-08 | Alocação do lucro | L | 1 h | Regra fixa (ex.: reinvestir/ reserva operacional/ investir/ retirar) aplicada mensalmente |
| ESC-09 | Carteira e revisão trimestral | M | 2 h | Reserva completa → renda fixa → diversificação por prazo; aporte automático; revisão trimestral agendada (educativo, sem recomendação de ativo) |
| ESC-10 | Liderar para cima e para baixo | F | 2 h | Para A6: 1 decisão levada ao superior com contexto e proposta; 1 "porquê" explicado ao time |
| ESC-11 | Retrospectiva da dicotomia | F | 1 h/mês | Onde exagerei (micro-gerenciar × abandonar; agressivo × cauteloso) e o ajuste do mês |

### Ferramentas
**T-ESC-01 · Manual do Líder** — pauta de 1:1 (4 blocos), pauta de reunião semanal, `principios (lista)`; registro por 1:1: `pessoa`, `data`, `desempenho`, `pares`, `time`, `inovacao`, `combinados`.
**T-ESC-02 · Mapa de Comando Descentralizado** — `missao_1_frase`, `porque`, tabela `{decisao, quem_decide, limite (R$/prazo), quando_escala}`.
**T-ESC-03 · Priorizar e Agir** — lista de problemas com `impacto`, `urgencia`, ordem; um "em execução" por vez.
**T-ESC-04 · Playbook de Processos** — por processo: `passos`, `dono`, `ferramenta/automação`, `KPI`, `link do vídeo/doc`.
**T-ESC-05 · Roteiro de Contratação** — perfil, perguntas por critério, `teste_pratico`, `metas_dos_90_dias`.
**T-ESC-06 · Motor de Crescimento** — `motor (recorrente|viral|pago)`, métrica-chave (churn/retorno; coeficiente viral; CAC × LTV), `experimento`.
**T-ESC-07 · Alocação do Lucro** — `lucro_mes`, regra em % (editável) → valores; histórico.
**T-ESC-08 · Plano de Carteira** — `reserva (meta e status)`, alocação por prazo/risco (educativo), `dia_do_aporte`, `revisao_trimestral (data)`; aviso: não é recomendação de investimento.

**Critério de conclusão**: ESC-01, 02, 03, 08 (light); + 04, 05, 06, 07, 09 (medium); + 10, 11 (full).

---

## Transversal — Rituais, Biblioteca e Gamificação

- **Rituais**: Revisão Semanal (todas as fases, desde Organizar), Reunião Pivotar/Perseverar (mensal, desde Sondar), 1:1 (semanal, Escalar). Cada ritual tem lembrete, streak e histórico.
- **Biblioteca**: 1 ficha por livro publicado (tese, frameworks, onde usar no PROSPERE, capítulos sugeridos) + "Inspire-se" (filmes/séries/documentários por fase, P2).
- **Progresso**: % por fase (missões concluídas ÷ missões da trilha), nível (1–8 = fase mais avançada concluída), selos por ritual (4 semanas seguidas).
- **Modo essencial** (< 5 h/semana): apenas missões `L`, 1 por semana, ferramentas com campos mínimos.
