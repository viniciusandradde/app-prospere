'use client';

import { useState, useTransition } from 'react';
import { Check, Plus, Trash2, Undo2 } from 'lucide-react';
import type { MissionCounter, MissionTemplateSection } from '@prospere/content';
import {
  addCounterEntryAction,
  completeMissionAction,
  removeCounterEntryAction,
  saveResponseAction,
  undoMissionAction,
} from '@/actions/mission';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { dataBR } from '@/lib/utils';

export function ResponseForm({
  trailMissionId,
  sections,
  initial,
}: {
  trailMissionId: string;
  sections: MissionTemplateSection[];
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setSaved(false);
    startTransition(async () => {
      await saveResponseAction(trailMissionId, values);
      setSaved(true);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <Field
          key={section.id}
          label={section.label}
          {...(section.hint ? { hint: section.hint } : {})}
          htmlFor={`section-${section.id}`}
        >
          <Textarea
            id={`section-${section.id}`}
            value={values[section.id] ?? ''}
            onChange={(event) => {
              setValues({ ...values, [section.id]: event.target.value });
              setSaved(false);
            }}
            onBlur={save}
            rows={4}
          />
        </Field>
      ))}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending} variant="outline">
          {pending ? 'Salvando…' : 'Salvar resposta'}
        </Button>
        {saved ? <span className="text-sm text-muted-foreground">Salvo.</span> : null}
      </div>
    </div>
  );
}

export function Counter({
  trailMissionId,
  counter,
  entries,
}: {
  trailMissionId: string;
  counter: MissionCounter;
  entries: Array<{ date: string; note: string }>;
}) {
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();

  const add = () => {
    if (note.trim() === '') return;
    startTransition(async () => {
      await addCounterEntryAction(trailMissionId, note);
      setNote('');
    });
  };

  const remove = (index: number) => {
    startTransition(async () => {
      await removeCounterEntryAction(trailMissionId, index);
    });
  };

  const percent = Math.min(100, (entries.length / counter.target) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          <strong>
            {entries.length} de {counter.target}
          </strong>{' '}
          {counter.unit}
        </p>
        <Progress value={percent} label={`Progresso do contador de ${counter.unit}`} />
      </div>

      <Field label={counter.noteLabel} htmlFor="counter-note">
        <div className="flex gap-2">
          <Input
            id="counter-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
            placeholder="Ex.: Ana, da academia — travou no preço"
          />
          <Button onClick={add} disabled={pending || note.trim() === ''} aria-label="Registrar">
            <Plus aria-hidden />
          </Button>
        </div>
      </Field>

      {entries.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {entries.map((entry, index) => (
            <li key={`${entry.date}-${index}`} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-muted-foreground">{dataBR(entry.date)}</span>
              <span className="flex-1 text-sm">{entry.note}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={pending}
                aria-label={`Remover registro de ${dataBR(entry.date)}`}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CompleteButton({
  trailMissionId,
  done,
  blockedBy,
}: {
  trailMissionId: string;
  done: boolean;
  blockedBy: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Não foi possível concluir.');
      }
    });
  };

  if (blockedBy.length > 0) {
    return (
      <p className="rounded-lg border border-border bg-muted p-4 text-sm">
        Esta missão destrava quando você concluir: <strong>{blockedBy.join(', ')}</strong>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {done ? (
        <Button
          variant="outline"
          onClick={() => run(() => undoMissionAction(trailMissionId))}
          disabled={pending}
        >
          <Undo2 aria-hidden /> Desfazer conclusão
        </Button>
      ) : (
        <Button onClick={() => run(() => completeMissionAction(trailMissionId))} disabled={pending}>
          <Check aria-hidden /> Concluir missão
        </Button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
