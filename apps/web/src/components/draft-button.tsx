'use client';

import { useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import {
  draftAction,
  recordDraftOutcomeAction,
  setAiConsentAction,
  type DraftState,
} from '@/actions/ai';
import type { DraftTarget } from '@/lib/ai/drafts';
import { Button } from '@/components/ui/button';

/**
 * Pede um rascunho à IA e entrega ao formulário. O texto entra como rascunho: quem decide
 * o que fica é a pessoa. Sem consentimento, nada é enviado (ADR-010).
 */
export function DraftButton<T>({
  target,
  missionId,
  onApply,
  label = 'Escrever rascunho',
}: {
  target: DraftTarget;
  missionId?: string;
  onApply: (data: T) => void;
  label?: string;
}) {
  const [state, setState] = useState<DraftState | null>(null);
  const [aplicado, setAplicado] = useState(false);
  const [pending, startTransition] = useTransition();

  const pedir = () =>
    startTransition(async () => {
      const resultado = await draftAction(target, missionId);
      setState(resultado);
      if (resultado.status === 'ok') {
        onApply(resultado.data as T);
        setAplicado(true);
        await recordDraftOutcomeAction(target, 'accepted');
      }
    });

  const autorizar = () =>
    startTransition(async () => {
      await setAiConsentAction(true);
      setState(null);
      const resultado = await draftAction(target, missionId);
      setState(resultado);
      if (resultado.status === 'ok') {
        onApply(resultado.data as T);
        setAplicado(true);
        await recordDraftOutcomeAction(target, 'accepted');
      }
    });

  if (state?.status === 'needs_consent') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4 text-sm">
        <p>
          Para escrever o rascunho, a IA lê o que você já respondeu nesta trilha: suas respostas
          de missão, sua meta e sua oferta em andamento. Nada é usado para treinar modelo, e você
          pode revogar essa autorização em Conta.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={autorizar} disabled={pending}>
            Autorizar e escrever
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setState(null)}>
            Agora não
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" size="sm" onClick={pedir} disabled={pending}>
        <Sparkles aria-hidden /> {pending ? 'Escrevendo…' : label}
      </Button>
      {aplicado ? (
        <span className="text-sm text-muted-foreground">
          Rascunho aplicado — edite, corte, reescreva. É seu.
        </span>
      ) : null}
      {state?.status === 'error' || state?.status === 'unavailable' ? (
        <span role="alert" className="text-sm text-destructive">
          {state.message}
        </span>
      ) : null}
    </div>
  );
}

export function DiscardDraftNote({ target }: { target: DraftTarget }) {
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="text-xs text-muted-foreground underline"
      onClick={() => startTransition(() => recordDraftOutcomeAction(target, 'discarded'))}
    >
      Descartei o rascunho
    </button>
  );
}
