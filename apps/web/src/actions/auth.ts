'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createMagicLink, signOut } from '@/lib/auth';
import { magicLinkEmail, sendEmail } from '@/lib/email';

const emailSchema = z.string().trim().toLowerCase().email('Informe um e-mail válido.');

export interface LoginState {
  status: 'idle' | 'sent' | 'error';
  message?: string;
  /** Só fora de produção e sem provedor de e-mail: o link aparece na tela. */
  devUrl?: string;
}

export async function requestLoginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'E-mail inválido.' };
  }

  const { url } = await createMagicLink(parsed.data);
  const { delivered } = await sendEmail(magicLinkEmail(parsed.data, url));

  return {
    status: 'sent',
    message: delivered
      ? 'Link enviado. Confira sua caixa de entrada — ele vale por 15 minutos.'
      : 'Sem provedor de e-mail configurado neste ambiente. Use o link abaixo.',
    ...(delivered || process.env.NODE_ENV === 'production' ? {} : { devUrl: url }),
  };
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect('/');
}
