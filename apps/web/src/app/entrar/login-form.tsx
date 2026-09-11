'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestLoginAction, type LoginState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const initialState: LoginState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando…' : 'Receber link de acesso'}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(requestLoginAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Seu e-mail"
        htmlFor="email"
        {...(state.status === 'error' ? { error: state.message } : {})}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com.br"
        />
      </Field>
      <SubmitButton />
      {state.status === 'sent' ? (
        <div className="rounded-lg border border-border bg-muted p-4 text-sm">
          <p>{state.message}</p>
          {state.devUrl ? (
            <a className="mt-2 block break-all text-primary underline" href={state.devUrl}>
              {state.devUrl}
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
