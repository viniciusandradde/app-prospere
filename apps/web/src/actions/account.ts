'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { requireUser, signOut } from '@/lib/auth';

/**
 * LGPD (PRD N-01): a exclusão apaga o workspace inteiro em cascata e anonimiza o usuário.
 * Não há retenção de artefatos após o pedido.
 */
export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.delete(schema.workspaces).where(eq(schema.workspaces.ownerId, user.id));
    await tx.delete(schema.sessions).where(eq(schema.sessions.userId, user.id));
    await tx
      .update(schema.users)
      .set({
        deletedAt: new Date(),
        email: `apagado+${user.id}@prospere.invalid`,
        name: null,
      })
      .where(eq(schema.users.id, user.id));
  });

  await signOut();
  redirect('/');
}
