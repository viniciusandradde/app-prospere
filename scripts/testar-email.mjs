#!/usr/bin/env node
/**
 * Envia um e-mail de teste pela Resend, com as mesmas variáveis que o app usa.
 * Serve para conferir chave, remetente e domínio antes do deploy.
 *
 * Uso: node --env-file=.env scripts/testar-email.mjs destino@exemplo.com
 */
const destino = process.argv[2];
const apiKey = process.env.EMAIL_API_KEY;
const from = process.env.EMAIL_FROM ?? 'PROSPERE <onboarding@resend.dev>';

if (!destino) {
  console.error('Uso: node --env-file=.env scripts/testar-email.mjs destino@exemplo.com');
  process.exit(1);
}
if (!apiKey) {
  console.error('EMAIL_API_KEY não configurada. Copie .env.example para .env e preencha.');
  process.exit(1);
}

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from,
    to: [destino],
    subject: 'PROSPERE — teste de envio',
    text: 'Se você recebeu isto, a Resend está configurada corretamente.',
  }),
});

const corpo = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(`Falha (HTTP ${response.status}): ${corpo.message ?? JSON.stringify(corpo)}`);
  if (String(corpo.message ?? '').includes('domain')) {
    console.error(
      'Dica: sem domínio verificado, a Resend só entrega de onboarding@resend.dev para o e-mail dono da conta.',
    );
  }
  process.exit(1);
}

console.info(`Enviado de ${from} para ${destino}. Id da mensagem: ${corpo.id}`);
