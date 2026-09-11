import { NextResponse } from 'next/server';
import { consumeMagicLink } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Troca o token do link mágico pelo cookie de sessão. Precisa ser route handler:
 * componentes de página não podem gravar cookies durante a renderização.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!token) return NextResponse.redirect(new URL('/entrar?erro=link', base));

  const user = await consumeMagicLink(token);
  if (!user) return NextResponse.redirect(new URL('/entrar?erro=link', base));

  return NextResponse.redirect(new URL('/hoje', base));
}
