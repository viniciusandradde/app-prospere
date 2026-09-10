> **Status: visão completa (referência, ano 2).** O escopo ativo do MVP é `docs/04-PRD-MVP-NEGOCIO.md`.

# 04 — PRD do MVP · PROSPERE

## 1. Problema

Pessoas e empresas consomem livros e cursos sobre dinheiro, vendas e liderança e não saem do lugar
porque (a) não sabem **por onde começar** no seu contexto específico, (b) o conhecimento não vira
**rotina com artefatos**, e (c) não há **medição e revisão** que mostre se o caminho está funcionando.
O custo é tempo perdido em teoria, dinheiro gasto sem validação e desistência precoce.

## 2. Metas (como saberemos que funcionou)

| Meta | Indicador | Alvo MVP (90 dias após lançamento) |
|---|---|---|
| Diagnóstico gera direção clara | % de usuários que concluem o board e abrem a 1ª missão | ≥ 70% |
| Conhecimento vira artefato | Artefatos salvos por usuário ativo nas 4 primeiras semanas | ≥ 4 |
| Ritmo instalado | % de usuários com ≥ 3 Revisões Semanais consecutivas | ≥ 35% |
| Resultado no mundo real | % com "número da semana" acima da linha de base após 8 semanas | ≥ 40% |
| Base para negócio | Retenção em 30 dias (login + 1 ação) | ≥ 45% |

## 3. Não-metas (v1)

- **Não** é um curso em vídeo nem uma comunidade (P2 pode integrar comunidade).
- **Não** substitui contabilidade, banco ou corretora; não recomenda ativos.
- **Não** faz disparo de e-mail/WhatsApp em massa (integrações são P2) — o app planeja e registra.
- **Não** tem multi-usuário por empresa no P0 (workspace individual; times entram no P1).
- **Não** tem app nativo; web responsiva mobile-first resolve.

## 4. Personas (dos arquétipos)

- **Renata, 34, Recomeço (A1)**: R$ 18 mil em dívidas de cartão, salário de R$ 3,2 mil. Quer parar de pagar juros e ganhar R$ 1 mil extra.
- **Diego, 29, Renda Extra (A2)**: dev CLT, 8 h/semana livres, quer R$ 5 mil/mês com serviço freelance.
- **Camila, 41, Fundadora (A3)**: nutricionista, quer lançar um programa online; tem 900 seguidores e nenhuma venda.
- **Marcos, 47, Operador (A4)**: oficina com 6 funcionários, R$ 60 mil/mês, vendas dependem dele.
- **Ana, 38, Escaladora (A5)**: agência com 25 pessoas, R$ 4 mi/ano, virou gargalo de decisões.
- **Paulo, 52, Corporação (A6)**: diretor de unidade de negócio, precisa lançar uma nova linha e formar líderes.

## 5. Histórias de usuário (prioridade decrescente)

1. Como novo usuário, quero responder um diagnóstico curto para receber uma trilha que faça sentido para minha situação, e não um curso genérico.
2. Como usuário na trilha, quero ver a próxima missão, o que ela produz e quanto tempo leva, para agir hoje.
3. Como usuário, quero preencher uma ferramenta (ex.: Raio-X Financeiro) e ter o artefato salvo e reutilizado nas fases seguintes.
4. Como usuário, quero um ritual semanal com lembrete que me obrigue a olhar o número que importa.
5. Como usuário, quero marcar missões como concluídas e ver o progresso por fase e o nível geral.
6. Como usuário, quero entender por que a trilha me colocou nessa ordem ("você começa por Organizar porque…").
7. Como usuário, quero conversar com um especialista da fase (agente de IA) que conheça meus artefatos (P1).
8. Como líder de empresa, quero convidar pessoas do time para rituais e missões compartilhadas (P1/P2).
9. Como usuário, quero refazer o board quando minha situação mudar e ver a trilha reajustada sem perder o histórico.
10. Como usuário, quero exportar meus artefatos (PDF/Markdown) para usar fora do app.

## 6. Requisitos

### P0 — sem isso não existe produto
| ID | Requisito | Critérios de aceite |
|---|---|---|
| R-01 | Cadastro/login (e-mail + senha ou link mágico) | Conta criada; sessão persistente; recuperação de senha; LGPD: consentimento e exclusão de conta |
| R-02 | Board de Diagnóstico (12 perguntas, `seed/board.json`) | Progresso salvo por pergunta; pode voltar; conclui em < 6 min; respostas versionadas |
| R-03 | Motor de trilha (regras determinísticas) | Dado um conjunto de respostas, gera arquétipo + pesos + missões + estimativa de semanas; mesma entrada → mesma saída (testes unitários com as 6 personas); resumo textual das regras disparadas |
| R-04 | Tela da Trilha | 8 fases com peso, status e %; próxima missão em destaque; ordem gerada respeitada; fases skip aparecem colapsadas com "por quê" |
| R-05 | Missões | Detalhe com objetivo, passos, resultado verificável, ferramenta vinculada, esforço; concluir/desfazer; pré-requisitos bloqueiam |
| R-06 | Ferramentas essenciais (8) | Canvas do Rumo; Raio-X Financeiro + Bola de Neve; Orçamento 50-30-20; Quadro Construir-Medir-Aprender; Construtor de Oferta + Checklist Ético; Plano de Relacionamentos (CRM simples); Pipeline + Rotina Diária; Revisão Semanal. Cada uma: schema Zod, autosave, versão do artefato, validação, estado vazio explicativo |
| R-07 | Rituais | Revisão Semanal com lembrete (e-mail) no dia/hora escolhidos; streak; histórico; gráfico do "número da semana" |
| R-08 | Progresso | % por fase, nível, selos de ritual; painel inicial mostra "hoje": próxima missão, prioridades da semana, ritual pendente |
| R-09 | Biblioteca | Fichas dos 7 livros com créditos; ficha do método (12 regras); referências marcadas como "referência inicial" |
| R-10 | Refazer board | Nova versão de respostas → nova trilha; missões já concluídas permanecem concluídas; histórico preservado |
| R-11 | Exportar | Artefato em Markdown/PDF; trilha em Markdown |
| R-12 | Mobile-first + acessibilidade básica | Funciona a 360 px; contraste AA; foco visível; formulários navegáveis por teclado |

### P1 — logo após o lançamento
| ID | Requisito | Critérios de aceite |
|---|---|---|
| R-13 | Agentes de IA por fase (10 personas) | Chat por fase com system prompt da persona + artefatos do usuário no contexto; sugere próxima ação; nunca inventa números; registra sugestões como rascunho, usuário aprova |
| R-14 | Resumo da trilha por IA | Explicação personalizada das regras (a partir do resumo determinístico) |
| R-15 | Ferramentas restantes (46) | Todas as de `docs/03-CONTEUDO-TRILHA.md` |
| R-16 | Workspace de empresa | Convidar membros; papéis (dono, líder, membro); missões e rituais compartilhados (1:1, priorizar e agir) |
| R-17 | Notificações | E-mail + push web para rituais, pings da rede e datas do lançamento |
| R-18 | Modo essencial | Trilha reduzida para < 5 h/semana |

### P2 — futuro (não construir agora, mas não bloquear)
- Integrações (WhatsApp, e-mail marketing, planilhas, calendário) para executar o que o app planeja.
- Comunidade/turmas, mentoria, marketplace de mentores.
- Biblioteca "Inspire-se" (filmes, séries, documentários) por fase.
- Multi-idioma; white-label para consultorias; planos e cobrança recorrente.

## 7. Fluxos e telas do MVP

1. **Onboarding**: boas-vindas (1 tela, o que é o método) → Board (1 pergunta por tela) → "Sua trilha" (resumo + por quês) → CTA "começar pela missão X".
2. **Hoje** (home): próxima missão; 3 prioridades da semana; ritual pendente; número da semana.
3. **Trilha**: linha das 8 fases; toque abre a fase com missões e ferramentas.
4. **Missão**: objetivo, passos, ferramenta (abre inline), "concluir".
5. **Ferramenta**: formulário em seções, autosave, "gerar artefato", histórico de versões.
6. **Rituais**: Revisão Semanal (wizard de 5 perguntas), Pivotar/Perseverar (mensal).
7. **Biblioteca**: livros, método, glossário.
8. **Perfil/Config**: refazer board, lembretes, exportar, excluir conta.

Componentes shadcn/ui previstos: `card`, `progress`, `tabs`, `sheet`, `dialog`, `form` (react-hook-form + zod), `select`, `slider`, `checkbox`, `radio-group`, `calendar`, `table`, `badge`, `toast`, `command`, `accordion`, `chart` (recharts).

## 8. Métricas de produto (instrumentar desde o P0)

- Eventos: `board_started`, `board_completed`, `trail_generated`, `mission_completed`, `artifact_saved`, `ritual_completed`, `board_redone`, `export_done`.
- Indicadores: conclusão do board, tempo até 1ª missão concluída (alvo < 48 h), artefatos/usuário/semana, streak médio, retenção D7/D30.

## 9. Questões abertas

| Questão | Quem decide | Bloqueia? |
|---|---|---|
| Nome final e domínio (PROSPERE × NORTE × ASCENDA × VETOR) | Vinícius | Não (usar PROSPERE como codinome) |
| Modelo de cobrança (freemium × assinatura × licença para consultorias) | Vinícius | Não para o P0 |
| Provedor de e-mail transacional para lembretes | Eng. | Sim, antes do R-07 |
| Política de retenção/LGPD dos artefatos financeiros (dados sensíveis do usuário) | Vinícius + DPO | Sim, antes do lançamento público |
| Agentes de IA: modelo, custo por conversa e limites por plano | Eng. + Vinícius | Não (P1) |

## 10. Faseamento sugerido

- **Sprint 0** — repo, schema, seed, testes do motor de trilha (sem UI).
- **Sprint 1** — auth + board + geração da trilha + tela da trilha.
- **Sprint 2** — missões + 4 ferramentas (Rumo, Raio-X/Bola de Neve, Orçamento, Revisão Semanal).
- **Sprint 3** — 4 ferramentas restantes do P0 + rituais + progresso + biblioteca + exportar.
- **Sprint 4** — polimento mobile, métricas, LGPD, deploy Dokploy, beta com 6 usuários (1 por arquétipo).
- **Sprint 5+** — P1 (agentes de IA, workspace de empresa, demais ferramentas).
