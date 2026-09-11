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

  if (delivered) {
    return {
      status: 'sent',
      message: 'Link enviado. Confira sua caixa de entrada — ele vale por 15 minutos.',
    };
  }

  // Fora de produção, sem provedor configurado, o link vai para a tela para não travar o dev.
  if (process.env.NODE_ENV !== 'production') {
    return {
      status: 'sent',
      message: 'O e-mail não saiu neste ambiente. Use o link abaixo.',
      devUrl: url,
    };
  }

  return {
    status: 'error',
    message: 'Não conseguimos enviar o e-mail agora. Tente de novo em alguns instantes.',
  };
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect('/');
}
