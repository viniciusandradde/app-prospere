# ADR-000 — Versões da stack no kickoff

- **Status**: aceito
- **Data**: 2026-09-11
- **Decisores**: Vinícius de Souza Andrade

## Contexto

O plano de execução (`docs/08`) exige registrar as versões estáveis usadas antes de instalar
qualquer dependência, para que o Sprint 0 seja reproduzível.

## Decisão

Versões resolvidas na instalação inicial do monorepo:

| Pacote | Versão |
|:--|:--|
| Node.js | 22 LTS |
| pnpm | 10 |
| Next.js | 16.3 (App Router, Turbopack) |
| React | 19.3 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.3 |
| Drizzle ORM / drizzle-kit | 0.44 / 0.31 |
| Zod | 4.6 |
| react-hook-form | 7.87 |
| Vitest | 3.2 |
| Playwright | 1.63 |
| PostgreSQL | 16 |

## Consequências

**Positivas**: ambiente reproduzível; CI e desenvolvimento na mesma base.

**Negativas / custos aceitos**: Tailwind 4 usa configuração em CSS (`@theme`), sem
`tailwind.config.ts`; quem conhece a v3 precisa se adaptar.

**O que passa a ser proibido**: subir versão maior de qualquer item da tabela sem atualizar
este ADR e rodar `pnpm test` e `pnpm test:e2e`.
