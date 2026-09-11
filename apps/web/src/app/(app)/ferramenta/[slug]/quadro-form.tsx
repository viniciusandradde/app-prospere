'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  CMA_COLUMNS,
  CMA_COLUMN_LABELS,
  DECISIONS,
  DECISION_LABELS,
  emptyCard,
  type CmaCard,
  type CmaColumn,
  type QuadroCma,
} from '@prospere/content';
import { saveArtifactAction, type SaveArtifactState } from '@/actions/tools';
import { DraftButton } from '@/components/draft-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const nextId = () => `c${Date.now().toString(36)}`;

export function QuadroForm({ initial, aiEnabled }: { initial: QuadroCma; aiEnabled: boolean }) {
  const [cards, setCards] = useState<CmaCard[]>(initial.cards);
  const [state, setState] = useState<SaveArtifactState | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<CmaCard>) =>
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)));

  const save = (next: CmaCard[] = cards) => {
    startTransition(async () => {
      setState(await saveArtifactAction('T-SON-03', { cards: next }));
    });
  };

  const issueFor = (index: number, field: string) =>
    state?.issues?.find((issue) => issue.path === `cards.${index}.${field}`)?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            const next = [...cards, emptyCard(nextId())];
            setCards(next);
          }}
          variant="outline"
        >
          <Plus aria-hidden /> Novo cartão
        </Button>
        <Button onClick={() => save()} disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar quadro'}
        </Button>
        {state?.status === 'ok' ? <span className="text-sm text-muted-foreground">Salvo.</span> : null}
        {state?.status === 'error' ? (
          <span role="alert" className="text-sm text-destructive">
            {state.message}
          </span>
        ) : null}
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhum cartão ainda. Comece pelas duas hipóteses do Quadro de Hipóteses (RUM-05): a de
            valor (alguém paga?) e a de crescimento (por onde chegam os próximos clientes?).
          </CardContent>
        </Card>
      ) : null}

      {cards.map((card, index) => (
        <Card key={card.id}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {CMA_COLUMNS.map((coluna) => (
                  <Button
                    key={coluna}
                    size="sm"
                    variant={card.coluna === coluna ? 'default' : 'outline'}
                    onClick={() => update(card.id, { coluna: coluna as CmaColumn })}
                  >
                    {CMA_COLUMN_LABELS[coluna]}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover cartão"
                onClick={() => {
                  const next = cards.filter((c) => c.id !== card.id);
                  setCards(next);
                  save(next);
                }}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>

            {aiEnabled ? (
              <DraftButton<{ hipotese: string; metrica: string; criterio_sucesso: string }>
                target="quadro.hipotese"
                label="Escrever a hipótese para mim"
                onApply={(data) =>
                  update(card.id, {
                    hipotese: data.hipotese,
                    metrica: data.metrica,
                    criterio_sucesso: data.criterio_sucesso,
                  })
                }
              />
            ) : null}

            <Field
              label="Hipótese"
              hint="Uma afirmação que pode ser derrubada: quem paga, quanto e por quê."
              {...(issueFor(index, 'hipotese') ? { error: issueFor(index, 'hipotese') } : {})}
            >
              <Textarea
                value={card.hipotese}
                onChange={(event) => update(card.id, { hipotese: event.target.value })}
                rows={2}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Experimento">
                <Input
                  value={card.experimento}
                  onChange={(event) => update(card.id, { experimento: event.target.value })}
                />
              </Field>
              <Field
                label="Métrica"
                {...(issueFor(index, 'metrica') ? { error: issueFor(index, 'metrica') } : {})}
              >
                <Input
                  value={card.metrica}
                  onChange={(event) => update(card.id, { metrica: event.target.value })}
                />
              </Field>
              <Field
                label="Critério de sucesso"
                hint="Definido antes de rodar — sem ele o cartão não sai de A testar."
                {...(issueFor(index, 'criterio_sucesso')
                  ? { error: issueFor(index, 'criterio_sucesso') }
                  : {})}
              >
                <Input
                  value={card.criterio_sucesso}
                  onChange={(event) => update(card.id, { criterio_sucesso: event.target.value })}
                />
              </Field>
              <Field label="Prazo" hint="No máximo 14 dias.">
                <Input
                  type="date"
                  value={card.prazo}
                  onChange={(event) => update(card.id, { prazo: event.target.value })}
                />
              </Field>
            </div>

            {card.coluna === 'medido' || card.coluna === 'aprendido' ? (
              <div className="flex flex-col gap-4">
                <Field label="Resultado">
                  <Textarea
                    value={card.resultado}
                    onChange={(event) => update(card.id, { resultado: event.target.value })}
                    rows={2}
                  />
                </Field>
                <Field label="Aprendizado">
                  <Textarea
                    value={card.aprendizado}
                    onChange={(event) => update(card.id, { aprendizado: event.target.value })}
                    rows={2}
                  />
                </Field>
                <Field
                  label="Decisão"
                  {...(issueFor(index, 'decisao') ? { error: issueFor(index, 'decisao') } : {})}
                >
                  <div className="flex flex-wrap gap-2">
                    {DECISIONS.map((decisao) => (
                      <Button
                        key={decisao}
                        size="sm"
                        variant={card.decisao === decisao ? 'default' : 'outline'}
                        onClick={() => update(card.id, { decisao })}
                      >
                        {DECISION_LABELS[decisao]}
                      </Button>
                    ))}
                  </div>
                </Field>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
