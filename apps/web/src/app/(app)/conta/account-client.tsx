'use client';

import { useState, useTransition } from 'react';
import { setAiConsentAction } from '@/actions/ai';
import { deleteAccountAction } from '@/actions/account';
import { signOutAction } from '@/actions/auth';
import { updateReminderAction } from '@/actions/ritual';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function ReminderSettings({
  weekday,
  timeLocal,
  reminder,
}: {
  weekday: number;
  timeLocal: string;
  reminder: boolean;
}) {
  const [dia, setDia] = useState(weekday);
  const [hora, setHora] = useState(timeLocal);
  const [ligado, setLigado] = useState(reminder);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      await updateReminderAction(dia, hora.length === 5 ? `${hora}:00` : hora, ligado);
      setSaved(true);
    });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Dia da revisão">
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((label, index) => (
            <Button
              key={label}
              size="sm"
              variant={dia === index ? 'default' : 'outline'}
              onClick={() => {
                setDia(index);
                setSaved(false);
              }}
            >
              {label.slice(0, 3)}
            </Button>
          ))}
        </div>
      </Field>
      <Field label="Horário" htmlFor="hora">
        <Input
          id="hora"
          type="time"
          value={hora.slice(0, 5)}
          onChange={(event) => {
            setHora(event.target.value);
            setSaved(false);
          }}
          className="max-w-40"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ligado}
          onChange={(event) => {
            setLigado(event.target.checked);
            setSaved(false);
          }}
          className="size-4"
        />
        Receber o lembrete por e-mail
      </label>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending} variant="outline">
          Salvar lembrete
        </Button>
        {saved ? <span className="text-sm text-muted-foreground">Salvo.</span> : null}
      </div>
    </div>
  );
}

export function AiConsent({ granted, available }: { granted: boolean; available: boolean }) {
  const [ativo, setAtivo] = useState(granted);
  const [pending, startTransition] = useTransition();

  if (!available) {
    return (
      <p className="text-sm text-muted-foreground">
        A escrita assistida não está ativa neste ambiente.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Com a autorização ligada, a IA pode ler o que você escreveu nesta trilha — respostas de
        missão, meta e oferta — para escrever rascunhos que você edita. Ela nunca decide a sua
        trilha e nunca inventa número. Desligar apaga a autorização; os textos continuam seus.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ativo}
          disabled={pending}
          onChange={(event) => {
            const proximo = event.target.checked;
            setAtivo(proximo);
            startTransition(async () => {
              await setAiConsentAction(proximo);
            });
          }}
          className="size-4"
        />
        Autorizo a IA a ler minha trilha para escrever rascunhos
      </label>
    </div>
  );
}

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <Button variant="outline" onClick={() => startTransition(() => signOutAction())}>
        Sair da conta
      </Button>

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive p-4">
          <p className="text-sm">
            Isso apaga a sua trilha, artefatos, revisões e métricas. Não há como desfazer. Exporte
            antes o que você quiser guardar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => startTransition(() => deleteAccountAction())}
            >
              Apagar tudo definitivamente
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          Excluir minha conta e meus dados
        </Button>
      )}
    </div>
  );
}
