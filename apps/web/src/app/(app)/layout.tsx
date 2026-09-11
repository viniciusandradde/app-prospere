import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarCheck, Home, Map, Settings } from 'lucide-react';
import { currentUser } from '@/lib/auth';

const nav = [
  { href: '/hoje', label: 'Hoje', Icon: Home },
  { href: '/trilha', label: 'Trilha', Icon: Map },
  { href: '/ritual', label: 'Ritual', Icon: CalendarCheck },
  { href: '/conta', label: 'Conta', Icon: Settings },
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/entrar');

  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/hoje" className="text-sm font-semibold uppercase tracking-widest text-primary">
            PROSPERE
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {nav.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8">{children}</div>

      {/* Navegação fixa no celular: o fluxo inteiro precisa ser usável a 360 px (PRD N-11). */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card sm:hidden">
        <div className="mx-auto flex max-w-3xl">
          {nav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-xs"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
