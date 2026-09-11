# ADR-010 — IA escreve rascunhos; o motor continua decidindo

- **Status**: aceito
- **Data**: 2026-09-11
- **Decisores**: Vinícius de Souza Andrade
- **Relacionado**: ADR-001 (motor determinístico), ADR-006 (LGPD)

## Contexto

Medindo o produto: a trilha de um Fundador tem 24 missões, 88 h estimadas e **39 campos de
texto livre**, mais 37 campos do Construtor de Oferta e 14 por semana na Revisão. São mais de
200 páginas em branco em 8 semanas. Esse é o atrito que faz alguém parar na segunda semana.

Ao mesmo tempo, as 2.560 combinações possíveis de respostas do board produzem apenas **15
conjuntos de missões distintos** — 15 missões aparecem em todas as trilhas, e a variação
máxima é de 7. A promessa de "trilha personalizada" entrega menos personalização do que
sugere, e aprofundá-la por regras significaria multiplicar o conteúdo.

A pesquisa de mercado (`docs/09`) mostra que "coach de IA", como etiqueta, não vende: os apps
dessa onda têm tração pequena.

## Decisão

A IA entra **escrevendo a primeira versão dos campos**, não conversando e não decidindo.

- O motor continua determinístico (ADR-001): arquétipo, ajustes, ordem das missões e
  estimativa saem de `seed/board.negocio.json` + `packages/engine`, com testes por persona.
  A IA **não** altera a trilha.
- A personalização que a IA acrescenta é de **conteúdo**: o texto dentro da missão,
  escrito a partir do que a pessoa já respondeu. É onde a percepção de "isto é sobre mim"
  realmente mora.
- Todo retorno é **rascunho**: aparece marcado como tal, é editável e pode ser descartado.
- Alvos na v1: promessa, benefícios e objeções da oferta; hipótese do quadro; seções de
  qualquer missão de resposta guiada.
- O contexto enviado é explícito e limitado (`buildContext`): arquétipo, meta calculada pelo
  motor, duas respostas do board e os textos que a própria pessoa escreveu. Nada mais.
- **Consentimento por conta** (`users.ai_consent_at`), pedido no primeiro uso e revogável em
  Conta. Sem consentimento, nenhum dado sai do app. Sem `ANTHROPIC_API_KEY`, os botões nem
  aparecem.
- O modelo padrão é `claude-opus-5` (`AI_MODEL` sobrescreve), com `effort: low` — rascunho
  curto não precisa de mais.

## Guardrails no prompt

Não inventar número, nome de cliente, depoimento, resultado ou prova; o que faltar vira
`[colchete]` para a pessoa completar; sem promessa de resultado garantido; português do
Brasil, primeira pessoa, frases curtas. O retorno é validado por Zod antes de tocar o
formulário — resposta fora do formato é descartada com mensagem, não aplicada pela metade.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|:--|:--|:--|:--|
| Chat por fase (previsto no R-13) | Efeito "uau" na demo | Não resolve o atrito medido; a pesquisa mostra tração baixa | Depois de provar valor nos rascunhos |
| IA personalizando a trilha | Personalização mais profunda | Quebra ADR-001: perde previsibilidade, teste e auditabilidade | Inegociável |
| Mais regras no board | Determinístico | Multiplica conteúdo a escrever e manter | Custo alto, ganho incerto |

## Consequências

**Positivas**: ataca o atrito medido; aprofunda personalização sem tocar no motor; custo
baixo — cerca de US$ 0,01 por rascunho, algo como R$ 2–3 por usuário/mês em uso intenso,
contra assinatura de R$ 39–79.

**Negativas / custos aceitos**: dependência de um serviço externo para um recurso que a
pessoa pode passar a esperar; rascunho ruim gasta a confiança dela; e medimos *pedido*,
*aplicado* e *descartado* — não conseguimos distinguir "aceitou como veio" de "editou
bastante" sem comparar textos no salvamento, o que ficou de fora desta versão.

**O que passa a ser proibido**: a IA decidir qualquer coisa da trilha; enviar dado de usuário
sem consentimento registrado; aplicar rascunho sem validação de schema; número gerado por
modelo virar número do usuário.

## Como saber se funcionou

Eventos `ai_draft_requested` e `ai_draft_resolved` (`accepted` / `discarded`) por alvo. No
gate da semana 8, a pergunta é: quem usou rascunho concluiu mais missões e manteve mais
revisões semanais do que quem não usou?
