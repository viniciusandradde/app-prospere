import 'server-only';

/**
 * Envio transacional pela Resend (ADR-009). Sem `EMAIL_API_KEY` o envio é registrado no log
 * do servidor e o link do primeiro acesso aparece na própria tela — o suficiente para
 * desenvolver sem provedor.
 */
export interface Email {
  to: string;
  subject: string;
  text: string;
}

export interface SendResult {
  delivered: boolean;
  /** Id da mensagem na Resend, quando entregue. */
  id?: string;
  error?: string;
}

/**
 * Remetente do produto. Exige o domínio verificado na Resend; enquanto ele não estiver,
 * `EMAIL_FROM=PROSPERE <onboarding@resend.dev>` entrega só para o dono da conta Resend.
 */
const DEFAULT_FROM = 'PROSPERE <nao-responda@prospere.vsatecnologia.com.br>';
const TIMEOUT_MS = 10_000;

/**
 * `console` escreve a mensagem no log do servidor em vez de enviar. Serve para
 * desenvolvimento e para os testes e2e, que não têm rede para a Resend. Nunca em produção:
 * é preciso pedir explicitamente por `EMAIL_TRANSPORT`.
 */
type Transport = 'resend' | 'console';

function resolveTransport(): Transport {
  const declared = process.env.EMAIL_TRANSPORT;
  if (declared === 'console' || declared === 'resend') return declared;
  return process.env.EMAIL_API_KEY ? 'resend' : 'console';
}

export async function sendEmail(email: Email): Promise<SendResult> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? DEFAULT_FROM;

  if (resolveTransport() === 'console') {
    console.info(
      [`[e-mail via log] para ${email.to}`, `assunto: ${email.subject}`, email.text].join('\n'),
    );
    // Sem provedor configurado, quem chama precisa saber que nada saiu de fato.
    return apiKey ? { delivered: true } : { delivered: false, error: 'EMAIL_API_KEY não configurada' };
  }

  if (!apiKey) {
    console.error('[e-mail] EMAIL_TRANSPORT=resend exige EMAIL_API_KEY.');
    return { delivered: false, error: 'EMAIL_API_KEY não configurada' };
  }

  // Uma API de e-mail fora do ar não pode segurar a ação do usuário.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text }),
      signal: controller.signal,
    });

    const corpo = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!response.ok) {
      // A mensagem da Resend diz o motivo real (domínio não verificado, chave inválida…).
      const error = corpo.message ?? `HTTP ${response.status}`;
      console.error(`[e-mail] falha ao enviar para ${email.to}: ${error}`);
      return { delivered: false, error };
    }

    return { delivered: true, ...(corpo.id ? { id: corpo.id } : {}) };
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : 'erro desconhecido';
    console.error(`[e-mail] falha ao enviar para ${email.to}: ${error}`);
    return { delivered: false, error };
  } finally {
    clearTimeout(timeout);
  }
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
    '',
    'Para mudar o dia, o horário ou desligar este lembrete, acesse Conta no app.',
  ].join('\n'),
});
