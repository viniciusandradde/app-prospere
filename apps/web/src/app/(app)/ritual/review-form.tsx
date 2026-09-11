'use client';

import { useState, useTransition } from 'react';
import {
  DECISIONS,
  DECISION_LABELS,
  emptyRevisao,
  type RevisaoSemanal,
  type WeekNumbers,
} from '@prospere/content';
import { saveReviewAction, type SaveReviewState } from '@/actions/ritual';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ReviewForm({
  periodStart,
  initial,
  needsPivot,
  metaDaSemana,
  registrados,
}: {
  periodStart: string;
  initial: RevisaoSemanal | null;
  needsPivot: boolean;
  metaDaSemana: number;
  /** Números já registrados nas missões desta semana. */
  registrados: WeekNumbers;
}) {
  const [values, setValues] = useState<RevisaoSemanal>(() => {
    if (initial) return initial;
    const vazia = emptyRevisao(periodStart);
    return {
      ...vazia,
      meta_da_semana: metaDaSemana,
      // A revisão começa com o que já foi registrado; tudo continua editável.
      numeros: { ...vazia.numeros, ...registrados },
    };
  });
  const [state, setState] = useState<SaveReviewState | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof RevisaoSemanal>(key: K, value: RevisaoSemanal[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setList = (key: 'vitorias' | 'prioridades_proxima', index: number, value: string) =>
    setValues((current) => {
      const list = [...current[key]];
      list[index] = value;
      return { ...current, [key]: list };
    });

  const setNumero = (key: keyof RevisaoSemanal['numeros'], value: number) =>
    setValues((current) => ({ ...current, numeros: { ...current.numeros, [key]: value } }));

  const temRegistros = Object.values(registrados).some((valor) => valor > 0);

  const issueFor = (path: string) =>
    state?.issues?.find((issue) => issue.path === path || issue.path.startsWith(`${path}.`))?.message;

  const submit = () => {
    startTransition(async () => {
      setState(await saveReviewAction({ ...values, meta_da_semana: metaDaSemana }));
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Autoconhecimento</CardTitle>
          <p className="text-sm text-muted-foreground">O que você fez de fato nesta semana?</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field
            label="3 vitórias"
            {...(issueFor('vitorias') ? { error: issueFor('vitorias') } : {})}
          >
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((index) => (
                <Input
                  key={index}
                  aria-label={`Vitória ${index + 1}`}
                  value={values.vitorias[index] ?? ''}
                  onChange={(event) => setList('vitorias', index, event.target.value)}
                  placeholder={`Vitória ${index + 1}`}
                />
              ))}
            </div>
          </Field>
          <Field label="Onde eu fugi da responsabilidade" hint="Uma só. Sem suavizar.">
            <Textarea
              value={values.fuga_de_responsabilidade}
              onChange={(event) => set('fuga_de_responsabilidade', event.target.value)}
              rows={2}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise</CardTitle>
          <p className="text-sm text-muted-foreground">
            Os números da semana. A meta desta trilha é {metaDaSemana} por semana.
          </p>
          {temRegistros ? (
            <p className="text-xs text-muted-foreground">
              Contatos, conversas e vendas vieram dos registros que você fez nas missões desta
              semana. Corrija se faltar alguma coisa.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(
              [
                ['contatos', 'Contatos'],
                ['conversas', 'Conversas'],
                ['propostas', 'Propostas'],
                ['vendas', 'Vendas'],
                ['receita', 'Receita (R$)'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type="number"
                  min={0}
                  value={values.numeros[key]}
                  onChange={(event) => setNumero(key, Number(event.target.value) || 0)}
                />
              </Field>
            ))}
            <Field label="Número da semana" hint="O que você acompanha de perto.">
              <Input
                type="number"
                min={0}
                value={values.numero_da_semana}
                onChange={(event) => set('numero_da_semana', Number(event.target.value) || 0)}
              />
            </Field>
          </div>
          <Field label="O que eu aprendi">
            <Textarea
              value={values.aprendizado}
              onChange={(event) => set('aprendizado', event.target.value)}
              rows={2}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Três prioridades para a próxima semana — uma por bloco de 90 minutos protegido.
          </p>
        </CardHeader>
        <CardContent>
          <Field
            label="3 prioridades"
            {...(issueFor('prioridades_proxima')
              ? { error: issueFor('prioridades_proxima') }
              : {})}
          >
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((index) => (
                <Input
                  key={index}
                  aria-label={`Prioridade ${index + 1}`}
                  value={values.prioridades_proxima[index] ?? ''}
                  onChange={(event) => setList('prioridades_proxima', index, event.target.value)}
                  placeholder={`Prioridade ${index + 1}`}
                />
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      {needsPivot ? (
        <Card>
          <CardHeader>
            <CardTitle>Pivotar ou perseverar</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quarta semana do ciclo: decida com os números, não com a sensação.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="Decisão"
              {...(issueFor('pivot') ? { error: issueFor('pivot') } : {})}
            >
              <div className="flex flex-wrap gap-2">
                {DECISIONS.map((decisao) => (
                  <Button
                    key={decisao}
                    type="button"
                    variant={values.pivot?.decisao === decisao ? 'default' : 'outline'}
                    onClick={() =>
                      set('pivot', {
                        decisao,
                        motivo: values.pivot?.motivo ?? '',
                        proximo_experimento: values.pivot?.proximo_experimento ?? '',
                      })
                    }
                  >
                    {DECISION_LABELS[decisao]}
                  </Button>
                ))}
              </div>
            </Field>
            {values.pivot ? (
              <>
                <Field label="Motivo, nos números">
                  <Textarea
                    value={values.pivot.motivo}
                    onChange={(event) =>
                      set('pivot', { ...values.pivot!, motivo: event.target.value })
                    }
                    rows={3}
                  />
                </Field>
                <Field label="Próximo experimento">
                  <Input
                    value={values.pivot.proximo_experimento}
                    onChange={(event) =>
                      set('pivot', { ...values.pivot!, proximo_experimento: event.target.value })
                    }
                  />
                </Field>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={pending}>
          {pending ? 'Salvando…' : 'Fechar a revisão'}
        </Button>
        {state?.status === 'ok' ? (
          <span className="text-sm text-muted-foreground">
            Revisão salva · {state.streak} semana(s) seguidas.
          </span>
        ) : null}
        {state?.status === 'error' ? (
          <span role="alert" className="text-sm text-destructive">
            {state.message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
