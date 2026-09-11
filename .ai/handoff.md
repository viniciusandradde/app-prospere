# Handoff — próximo passo

**Estado (2026-09-11)**: o MVP da edição Negócio está construído e testado. `pnpm test` (57
unitários) e `pnpm test:e2e` (8 fluxos, desktop e mobile) passam contra Postgres real.

## Como rodar

```bash
pnpm install
docker compose -f docker/compose.yaml up -d       # Postgres local
cp .env.example .env                              # ajuste DATABASE_URL e AUTH/EMAIL
pnpm --filter @prospere/web db:push               # cria as 13 tabelas
pnpm dev                                          # http://localhost:3000
```

Sem `EMAIL_API_KEY`, o link de acesso aparece na própria tela de login (fora de produção).

## O que falta para o beta (semana 4 do PRD)

1. **Deploy**: subir `docker/Dockerfile` no Dokploy a partir de `main`; configurar
   `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `EMAIL_API_KEY`, `EMAIL_FROM` e `CRON_SECRET`.
2. **E-mail transacional**: decidir o provedor (questão aberta do PRD). O código já fala com a
   API da Resend; trocar significa mexer só em `apps/web/src/lib/email.ts`.
3. **Agendador**: apontar um cron de hora em hora para `POST /api/cron/lembretes` com
   `Authorization: Bearer $CRON_SECRET`.
4. **Beta com 20 pessoas** (10 A3, 10 A4) e o gate da semana 8 — critérios na seção 2 do
   `docs/04-PRD-MVP-NEGOCIO.md`. A decisão do gate vira um ADR.

## Dívidas conhecidas

- O rascunho do board fica em `localStorage`; só vai para o banco quando o diagnóstico termina.
- Artefato guarda a versão atual e incrementa o contador; `artifact_versions` (histórico
  navegável) só na v1.1.
- Sem teste automatizado do envio de lembrete — depende de provedor real.
