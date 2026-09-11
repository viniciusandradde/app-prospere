import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const SESSION_COOKIE = 'prospere_session';
const TOKEN_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 30;

const hash = (value: string): string => createHash('sha256').update(value).digest('hex');

const minutesFromNow = (minutes: number): Date => new Date(Date.now() + minutes * 60_000);
const daysFromNow = (days: number): Date => new Date(Date.now() + days * 86_400_000);

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  workspaceId: string;
  consentAt: Date | null;
}

/**
 * Cria um token de uso único e devolve o link. O envio por e-mail acontece em
 * `sendMagicLink`; em desenvolvimento, sem provedor configurado, o link volta para a tela.
 */
export async function createMagicLink(rawEmail: string): Promise<{ url: string; token: string }> {
  const email = rawEmail.trim().toLowerCase();
  const token = randomBytes(32).toString('base64url');
  const db = getDb();

  await db.insert(schema.loginTokens).values({
    email,
    tokenHash: hash(token),
    expiresAt: minutesFromNow(TOKEN_TTL_MINUTES),
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return { url: `${base}/entrar/verificar?token=${token}`, token };
}

/** Troca o token pelo cookie de sessão. Cria conta e workspace pessoal no primeiro acesso. */
export async function consumeMagicLink(token: string): Promise<SessionUser | null> {
  const db = getDb();
  const tokenHash = hash(token);

  const [found] = await db
    .select()
    .from(schema.loginTokens)
    .where(
      and(
        eq(schema.loginTokens.tokenHash, tokenHash),
        isNull(schema.loginTokens.usedAt),
        gt(schema.loginTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!found) return null;

  await db
    .update(schema.loginTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.loginTokens.id, found.id));

  const [existing] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, found.email), isNull(schema.users.deletedAt)))
    .limit(1);

  let user = existing;
  if (!user) {
    // Consentimento LGPD é registrado no momento do cadastro (PRD N-01).
    const [created] = await db
      .insert(schema.users)
      .values({ email: found.email, consentAt: new Date() })
      .returning();
    user = created!;
    await db.insert(schema.workspaces).values({
      name: 'Meu negócio',
      kind: 'personal',
      ownerId: user.id,
    });
  }

  const [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.ownerId, user.id))
    .limit(1);

  const sessionToken = randomBytes(32).toString('base64url');
  await db.insert(schema.sessions).values({
    userId: user.id,
    tokenHash: hash(sessionToken),
    expiresAt: daysFromNow(SESSION_TTL_DAYS),
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: daysFromNow(SESSION_TTL_DAYS),
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    workspaceId: workspace!.id,
    consentAt: user.consentAt,
  };
}

/** Usuário da requisição atual, ou null. Memoizado por requisição. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const rows = await db
    .select({
      userId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      consentAt: schema.users.consentAt,
      deletedAt: schema.users.deletedAt,
      workspaceId: schema.workspaces.id,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.workspaces, eq(schema.workspaces.ownerId, schema.users.id))
    .where(eq(schema.sessions.tokenHash, hash(token)))
    .limit(1);

  const row = rows[0];
  if (!row || row.deletedAt || row.expiresAt.getTime() < Date.now()) return null;

  return {
    id: row.userId,
    email: row.email,
    name: row.name,
    workspaceId: row.workspaceId,
    consentAt: row.consentAt,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().delete(schema.sessions).where(eq(schema.sessions.tokenHash, hash(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Comparação em tempo constante, usada onde tokens são conferidos fora do banco. */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
