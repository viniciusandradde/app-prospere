import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildUserPrompt,
  parseDraft,
  SYSTEM_PROMPT,
  type DraftContext,
  type DraftResult,
  type DraftTarget,
} from './drafts';

export * from './drafts';

/** Modelo padrão dos rascunhos. Configurável por `AI_MODEL`. */
const DEFAULT_MODEL = 'claude-opus-5';

/** A IA só aparece na interface quando há chave configurada. */
export const isAiEnabled = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

export type DraftOutcome<T extends DraftTarget> =
  | { ok: true; data: DraftResult<T> }
  | { ok: false; error: string };

/**
 * Pede um rascunho à IA. Erro nunca derruba o fluxo: a pessoa continua escrevendo à mão.
 */
export async function draft<T extends DraftTarget>(
  target: T,
  context: DraftContext,
): Promise<DraftOutcome<T>> {
  if (!isAiEnabled()) {
    return { ok: false, error: 'A escrita assistida não está configurada neste ambiente.' };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: process.env.AI_MODEL ?? DEFAULT_MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      // Rascunho curto: pouco esforço basta e mantém o custo por usuário baixo.
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: buildUserPrompt(target, context) }],
    });

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'A IA recusou escrever este rascunho. Escreva à mão desta vez.' };
    }

    const texto = response.content
      .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === 'text')
      .map((bloco) => bloco.text)
      .join('\n');

    if (!texto) return { ok: false, error: 'A IA não devolveu texto.' };
    return parseDraft(target, texto);
  } catch (cause) {
    if (cause instanceof Anthropic.RateLimitError) {
      return { ok: false, error: 'Muitos rascunhos ao mesmo tempo. Tente de novo em instantes.' };
    }
    if (cause instanceof Anthropic.AuthenticationError) {
      console.error('[ia] chave inválida');
      return { ok: false, error: 'A escrita assistida está indisponível agora.' };
    }
    if (cause instanceof Anthropic.APIError) {
      console.error(`[ia] erro ${cause.status}: ${cause.message}`);
      return { ok: false, error: 'A escrita assistida falhou. Tente de novo em instantes.' };
    }
    console.error('[ia] falha inesperada', cause);
    return { ok: false, error: 'A escrita assistida falhou. Tente de novo em instantes.' };
  }
}
