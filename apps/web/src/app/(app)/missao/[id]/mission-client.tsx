'use client';

import { useState, useTransition } from 'react';
import { Check, Plus, Trash2, Undo2 } from 'lucide-react';
import type { MissionCounter, MissionList, MissionTemplateSection } from '@prospere/content';
import {
  addCounterEntryAction,
  completeMissionAction,
  removeCounterEntryAction,
  saveResponseAction,
  saveRowsAction,
  undoMissionAction,
} from '@/actions/mission';
import { DraftButton } from '@/components/draft-button';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { dataBR } from '@/lib/utils';

export function ResponseForm({
  trailMissionId,
  missionId,
  sections,
  initial,
  aiEnabled,
}: {
  trailMissionId: string;
  missionId: string;
  sections: MissionTemplateSection[];
  initial: Record<string, string>;
  aiEnabled: boolean;
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
      {aiEnabled ? (
        <DraftButton<{ secoes: Array<{ id: string; texto: string }> }>
          target="missao.template"
          missionId={missionId}
          onApply={(data) => {
            const proximos = { ...values };
            for (const secao of data.secoes) {
              if (sections.some((s) => s.id === secao.id)) proximos[secao.id] = secao.texto;
            }
            setValues(proximos);
            setSaved(false);
          }}
        />
      ) : null}
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

/**
 * Lista estruturada da missão (os 30 nomes do plano de relacionamentos, por exemplo).
 * Fica no app de propósito: a pessoa não deve sair para uma planilha no meio do trabalho.
 */
export function RowList({
  trailMissionId,
  list,
  initial,
}: {
  trailMissionId: string;
  list: MissionList;
  initial: Array<Record<string, string>>;
}) {
  const [rows, setRows] = useState<Array<Record<string, string>>>(
    initial.length > 0 ? initial : [{}],
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const preenchidas = rows.filter((linha) =>
    Object.values(linha).some((valor) => (valor ?? '').trim() !== ''),
  ).length;

  const save = (proximas = rows) => {
    setSaved(false);
    startTransition(async () => {
      await saveRowsAction(trailMissionId, proximas);
      setSaved(true);
    });
  };

  const update = (index: number, coluna: string, valor: string) => {
    setRows((atuais) => atuais.map((linha, i) => (i === index ? { ...linha, [coluna]: valor } : linha)));
    setSaved(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          <strong>
            {preenchidas} de {list.target}
          </strong>{' '}
          {list.unit}
        </p>
        <Progress
          value={Math.min(100, (preenchidas / list.target) * 100)}
          label={`Progresso da lista de ${list.unit}`}
        />
      </div>

      <ul className="flex flex-col gap-4">
        {rows.map((linha, index) => (
          <li
            key={index}
            role="group"
            aria-label={`Linha ${index + 1}`}
            className="flex flex-col gap-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover linha ${index + 1}`}
                onClick={() => {
                  const proximas = rows.filter((_, i) => i !== index);
                  setRows(proximas.length > 0 ? proximas : [{}]);
                  save(proximas);
                }}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.columns.map((coluna) => (
                <Field key={coluna.id} label={coluna.label} className="min-w-0">
                  {coluna.options ? (
                    <select
                      value={linha[coluna.id] ?? ''}
                      onChange={(event) => update(index, coluna.id, event.target.value)}
                      onBlur={() => save()}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
                    >
                      <option value="">—</option>
                      {coluna.options.map((opcao) => (
                        <option key={opcao} value={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={linha[coluna.id] ?? ''}
                      onChange={(event) => update(index, coluna.id, event.target.value)}
                      onBlur={() => save()}
                      {...(coluna.placeholder ? { placeholder: coluna.placeholder } : {})}
                    />
                  )}
                </Field>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setRows([...rows, {}])}>
          <Plus aria-hidden /> {list.addLabel}
        </Button>
        <Button onClick={() => save()} disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar lista'}
        </Button>
        {saved ? <span className="text-sm text-muted-foreground">Salvo.</span> : null}
      </div>
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
