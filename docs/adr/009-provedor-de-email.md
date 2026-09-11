# ADR-009 — Resend como provedor de e-mail transacional

- **Status**: aceito
- **Data**: 2026-09-11
- **Decisores**: Vinícius de Souza Andrade
- **Resolve**: questão aberta "provedor de e-mail transacional", que bloqueava R-07/N-08

## Contexto

O MVP depende de e-mail em dois pontos: o link mágico de acesso (N-01) e o lembrete da
Revisão Semanal (N-08). Sem provedor, o link só aparece na tela em desenvolvimento e o
lembrete não sai — ou seja, o ritual, que é o gancho de retenção da tese, não funciona.

## Decisão

Usar a **Resend** (`POST https://api.resend.com/emails`), chamada direta por `fetch` em
`apps/web/src/lib/email.ts`, sem SDK. Configuração por variáveis de ambiente:
`EMAIL_API_KEY` e `EMAIL_FROM`.

Enquanto não houver domínio verificado, o remetente é `onboarding@resend.dev`, que a Resend
entrega **apenas para o e-mail dono da conta** — suficiente para desenvolvimento e para o
teste de fumaça, não para o beta.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|:--|:--|:--|:--|
| SDK `resend` | Tipos prontos | Mais uma dependência para dois e-mails de texto | `fetch` resolve em 30 linhas |
| SMTP via Nodemailer | Portável entre provedores | Conexão persistente e credenciais SMTP no runtime serverless | HTTP é mais simples aqui |
| Amazon SES | Mais barato em escala | Sandbox e verificação mais burocráticas | Custo irrelevante no volume do beta |

## Consequências

**Positivas**: sem SDK; trocar de provedor significa reescrever uma função; falha de envio
não derruba o fluxo (a ação devolve erro tratado, com tempo limite de 10 s).

**Negativas / custos aceitos**: dependência de um serviço externo para entrar no app —
se a Resend cair, ninguém faz login novo (sessões existentes seguem valendo, 30 dias).

**O que passa a ser proibido**: chave de API versionada no repositório — ela vive em `.env`
(ignorado pelo Git) e nas variáveis de ambiente do Dokploy; mostrar o link mágico na tela em
produção, mesmo que o envio falhe.

## Pendências antes do beta

1. Verificar um domínio próprio na Resend e trocar `EMAIL_FROM`.
2. Configurar SPF, DKIM e DMARC do domínio (a Resend gera os registros).
3. Conferir o envio com `pnpm email:testar voce@seudominio.com.br`.
