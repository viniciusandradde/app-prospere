import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await currentUser().catch(() => null);
  if (user) redirect('/hoje');

  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-primary">
          PROSPERE
        </Link>
        <h1 className="text-3xl font-semibold">Entrar</h1>
        <p className="text-muted-foreground">
          Informe seu e-mail e enviamos um link de acesso. Sem senha para lembrar.
        </p>
      </div>
      {erro === 'link' ? (
        <p role="alert" className="rounded-lg border border-destructive p-4 text-sm">
          Esse link expirou ou já foi usado. Cada link vale por 15 minutos e funciona uma vez só —
          peça um novo.
        </p>
      ) : null}

      <LoginForm />
      <p className="text-xs text-muted-foreground">
        Ao entrar, você concorda com o tratamento dos seus dados para operar a sua trilha. Você pode
        exportar ou apagar tudo a qualquer momento em Conta.
      </p>
    </main>
  );
}
