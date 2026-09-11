# ADR-007 — Autenticação própria por link mágico, sem Auth.js

- **Status**: aceito
- **Data**: 2026-09-11
- **Decisores**: Vinícius de Souza Andrade
- **Revisita**: `docs/05-ARQUITETURA-E-ADRS.md` previa Auth.js (NextAuth)

## Contexto

O MVP tem um único método de entrada: e-mail com link de uso único (PRD N-01). Auth.js
resolveria isso, mas traz um adaptador com schema próprio (`accounts`, `verification_tokens`,
`sessions`) que não controlamos, enquanto o PRD define um schema enxuto de 11 tabelas e a
regra de tenancy por `workspace_id` em toda leitura e escrita.

## Decisão

Implementar a autenticação no próprio app: `login_tokens` (hash SHA-256, validade de 15
minutos, uso único) e `sessions` (hash do cookie, validade de 30 dias), com cookie
`httpOnly`, `sameSite=lax` e `secure` em produção. A troca do token pelo cookie acontece em
route handler (`/entrar/verificar`) — componentes de página não podem gravar cookies durante
a renderização.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|:--|:--|:--|:--|
| Auth.js + adaptador Drizzle | Pronto, OAuth fácil depois | Schema extra fora do nosso controle; configuração maior que o problema | Um método de login só não paga o custo |
| Senha + hash | Familiar | Mais telas (recuperação, troca), mais superfície de ataque | Fora do escopo do MVP |

## Consequências

**Positivas**: schema enxuto e sob controle; nenhum token em claro no banco; o fluxo inteiro
cabe em dois arquivos testáveis.

**Negativas / custos aceitos**: OAuth (Google) exigirá trabalho próprio ou a adoção de
Auth.js mais tarde; sem rotação automática de sessão.

**O que passa a ser proibido**: gravar token em claro; autenticar por qualquer caminho que
não passe por `login_tokens`; gravar cookie de sessão fora de route handler ou Server Action.
