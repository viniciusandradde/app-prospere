# ADR-008 — Catálogo só em código, sem tabelas e sem seed

- **Status**: aceito
- **Data**: 2026-09-11
- **Decisores**: Vinícius de Souza Andrade
- **Relacionado**: ADR-003 (conteúdo como código), PRD Negócio seção 4

## Contexto

O ADR-003 manteve o catálogo em código e previa um seed que sincronizasse `phases`,
`missions`, `tools` e `books` com o banco. O PRD do MVP Negócio cortou essas tabelas. Manter
o seed significaria duas fontes da verdade para o mesmo conteúdo.

## Decisão

O catálogo vive apenas em `packages/content`. As tabelas de instância guardam o **id** do
catálogo (`trail_missions.mission_id`, `artifacts.tool_id`) como texto, sem chave
estrangeira; a validação de que o id existe é feita na aplicação e coberta por teste de
integridade (`packages/content/test/catalogo.test.ts` compara catálogo e board).

Além disso, cada trilha guarda em `trails.plan` o snapshot do plano gerado pelo motor. É ele
que a UI lê: mudar o conteúdo depois não reescreve a trilha de quem já começou.

## Consequências

**Positivas**: uma fonte da verdade; nenhum seed para rodar; conteúdo versionado junto do
código, com testes.

**Negativas / custos aceitos**: sem integridade referencial no banco para ids de catálogo;
remover uma missão do catálogo deixa linhas órfãs em trilhas antigas — por isso o snapshot.

**O que passa a ser proibido**: criar tabela de catálogo; ler conteúdo de missão ou
ferramenta do banco.
