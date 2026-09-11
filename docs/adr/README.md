# Architecture Decision Records

Toda decisão estrutural (banco, motor de trilha, stack, modelo de dados, política de
privacidade) vira um ADR aqui, numerado sequencialmente. Use `000-template.md`.

As seis decisões fundadoras estão registradas em
[`../05-ARQUITETURA-E-ADRS.md`](../05-ARQUITETURA-E-ADRS.md) e devem ser migradas para
arquivos individuais conforme forem revisitadas:

| ADR | Decisão |
|:--|:--|
| 001 | Motor de trilha determinístico; a IA apenas explica |
| 002 | Artefatos em JSONB validados por Zod, com versionamento |
| 003 | Conteúdo como código (TypeScript tipado), não CMS |
| 004 | Server Actions e RSC por padrão; API pública só quando necessário |
| 005 | Multi-tenant desde o schema, single-tenant na UI do P0 |
| 006 | LGPD e tratamento de dados financeiros |

ADRs escritos neste repositório:

| ADR | Decisão |
|:--|:--|
| [000](000-versoes.md) | Versões da stack no kickoff |
| [007](007-autenticacao-por-link-magico.md) | Autenticação própria por link mágico, sem Auth.js |
| [008](008-sem-tabelas-de-catalogo.md) | Catálogo só em código, sem tabelas e sem seed |
| [009](009-provedor-de-email.md) | Resend como provedor de e-mail transacional |
| [010](010-rascunhos-por-ia.md) | IA escreve rascunhos; o motor continua decidindo |

Decisões pendentes (ver questões abertas no PRD): cifra de campos financeiros e âncoras do
teste de preço. O provedor de e-mail foi decidido no ADR-009.
