import 'server-only';

/**
 * Envio transacional. O provedor ainda é questão aberta no PRD: com `EMAIL_API_KEY`
 * configurada usa a API da Resend; sem ela, registra no log do servidor e o link do
 * primeiro acesso aparece na própria tela (só fora de produção).
 */
export interface Email {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(email: Email): Promise<{ delivered: boolean }> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'PROSPERE <nao-responda@exemplo.com.br>';

  if (!apiKey) {
    console.info(`[e-mail não enviado: sem EMAIL_API_KEY] para ${email.to}: ${email.subject}`);
    return { delivered: false };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text }),
  });

  if (!response.ok) {
    console.error(`[e-mail] falha ao enviar: ${response.status}`);
    return { delivered: false };
  }
  return { delivered: true };
}

export const magicLinkEmail = (to: string, url: string): Email => ({
  to,
  subject: 'Seu acesso ao PROSPERE',
  text: [
    'Use o link abaixo para entrar. Ele vale por 15 minutos e só funciona uma vez.',
    '',
    url,
    '',
    'Se não foi você que pediu, ignore este e-mail.',
  ].join('\n'),
});

export const weeklyReviewEmail = (to: string, appUrl: string): Email => ({
  to,
  subject: 'Hora da sua Revisão Semanal (30 min)',
  text: [
    '3 vitórias, 1 fuga de responsabilidade, os números da semana e as 3 prioridades.',
    '',
    `${appUrl}/ritual`,
  ].join('\n'),
});
