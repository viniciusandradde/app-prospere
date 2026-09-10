# Contribuindo com o PROSPERE

Obrigado pelo interesse. Este documento resume como o trabalho é feito aqui.

## Antes de escrever código

1. Leia `CLAUDE.md`, `.ai/context.md` e `.ai/handoff.md` — nessa ordem.
2. Confirme o escopo em `docs/04-PRD-MVP-NEGOCIO.md`. O que não está no P0 não entra no P0.
3. Se a mudança é estrutural (banco, motor de trilha, stack, modelo de dados), abra um ADR
   em `docs/adr/` antes de codar. Use `docs/adr/000-template.md`.

## Regras não negociáveis

- **Schema-first.** Alterar `packages/db/schema.ts` → migration → testes → UI.
  Nunca assuma nomes de campos: confira no schema.
- **TDD.** Motor de trilha, schemas de ferramentas e cálculos nascem com teste.
- **Tenancy.** Toda leitura e escrita de dados de usuário filtra por `workspace_id`.
- **Motor determinístico.** Regras de trilha vivem em `seed/*.json` + `packages/engine`.
  A IA explica, nunca decide. Mesma entrada, mesma saída — provado por teste.
- **Idioma.** Textos de UI e conteúdo em pt-BR; código, tabelas e commits em inglês.

## Regras de conteúdo

- Citar apenas os sete livros publicados listados no README. E-books e materiais de bundle
  viram conteúdo próprio, sem menção.
- Nunca reproduzir trechos longos de qualquer fonte. Frameworks em palavras próprias.
- Números de referência sempre com o selo "referência inicial — calibre com seus dados".
- Persuasão só com gatilhos verdadeiros: escassez real, prova real, autoridade real.
- Finanças e investimentos: processo educativo, jamais recomendação de ativo.
- Toda missão nova precisa de um resultado verificável. Toda ferramenta, de um schema Zod.

## Fluxo de trabalho

```
dev  ──(testes locais)──>  PR  ──(review + CI verde)──>  main  ──> Dokploy
```

- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Um PR resolve uma coisa. PR grande demais é sinal de que faltou fatiar.
- Ao fim de cada sessão, atualize `.ai/progress.md` e `.ai/handoff.md`.

## Checklist do PR

- [ ] Testes escritos antes do código e passando
- [ ] Nenhum nome de campo assumido — conferido no schema
- [ ] Textos em pt-BR; sem citar e-books; livros citados corretamente
- [ ] Números de referência com selo
- [ ] Filtro por `workspace_id` em toda query
- [ ] `.ai/progress.md` e `.ai/handoff.md` atualizados
- [ ] ADR criado se houve decisão estrutural

## Reportando problemas

Use os templates em `.github/ISSUE_TEMPLATE/`. Para conteúdo do método (missões, ferramentas,
critérios), abra uma issue do tipo *Conteúdo da trilha* e cite a fonte que embasa a mudança.
