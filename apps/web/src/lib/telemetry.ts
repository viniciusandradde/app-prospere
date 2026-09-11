import 'server-only';
import { getDb, schema } from '@/db';

/** Eventos mínimos do PRD (N-10). */
export type EventName =
  | 'board_started'
  | 'board_completed'
  | 'gate_hit'
  | 'trail_generated'
  | 'mission_completed'
  | 'artifact_saved'
  | 'review_completed'
  | 'export_done';

interface TrackOptions {
  workspaceId?: string | null;
  userId?: string | null;
  props?: Record<string, unknown>;
}

/** Telemetria nunca derruba o fluxo do usuário — e nunca guarda PII nos props. */
export async function track(name: EventName, options: TrackOptions = {}): Promise<void> {
  try {
    await getDb().insert(schema.events).values({
      name,
      workspaceId: options.workspaceId ?? null,
      userId: options.userId ?? null,
      props: options.props ?? {},
    });
  } catch (error) {
    console.error(`[telemetria] falha ao registrar ${name}`, error);
  }
}
