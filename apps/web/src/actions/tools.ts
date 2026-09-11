'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import {
  ofertaSchema,
  quadroCmaSchema,
  toolById,
  type ToolId,
} from '@prospere/content';
import { getDb, schema } from '@/db';
import { requireUser } from '@/lib/auth';
import { track } from '@/lib/telemetry';

const schemas = {
  'T-SON-03': quadroCmaSchema,
  'T-PER-01': ofertaSchema,
} as const;

export interface SaveArtifactState {
  status: 'ok' | 'error';
  message?: string;
  /** Erros por campo, no formato caminho → mensagem. */
  issues?: Array<{ path: string; message: string }>;
}

/**
 * Salva o artefato da ferramenta. O schema Zod da ferramenta é a fonte da verdade
 * (ADR-002): o que não passa nele não é gravado.
 */
export async function saveArtifactAction(
  toolId: ToolId,
  data: unknown,
): Promise<SaveArtifactState> {
  const user = await requireUser();
  const tool = toolById.get(toolId);
  const validator = schemas[toolId as keyof typeof schemas];
  if (!tool || !validator) return { status: 'error', message: 'Ferramenta desconhecida.' };

  const parsed = validator.safeParse(data);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revise os campos destacados.',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(schema.artifacts)
    .where(and(eq(schema.artifacts.workspaceId, user.workspaceId), eq(schema.artifacts.toolId, toolId)))
    .orderBy(desc(schema.artifacts.updatedAt))
    .limit(1);

  const status =
    toolId === 'T-PER-01' && (parsed.data as { status?: string }).status === 'final'
      ? 'final'
      : 'draft';

  if (existing) {
    await db
      .update(schema.artifacts)
      .set({
        data: parsed.data as Record<string, unknown>,
        version: existing.version + 1,
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.artifacts.id, existing.id));
  } else {
    await db.insert(schema.artifacts).values({
      workspaceId: user.workspaceId,
      toolId,
      title: tool.name,
      schemaVersion: tool.schemaVersion,
      data: parsed.data as Record<string, unknown>,
      status,
      createdBy: user.id,
    });
  }

  await track('artifact_saved', {
    userId: user.id,
    workspaceId: user.workspaceId,
    props: { tool_id: toolId, status },
  });

  revalidatePath(`/ferramenta/${tool.slug}`);
  revalidatePath('/hoje');
  return { status: 'ok' };
}
