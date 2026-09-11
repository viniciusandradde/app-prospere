'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowLeft } from 'lucide-react';
import { joinWaitlistAction, submitBoardAction } from '@/actions/board';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Option {
  value: string | number;
  label: string;
  gate?: string;
}

interface Question {
  id: string;
  title: string;
  type: 'single' | 'goal';
  hint?: string;
  options?: Option[];
  fields?: Array<{ id: string; type: string; label: string; options?: number[] }>;
}

type Answers = Record<string, unknown>;

const STORAGE_KEY = 'prospere.board.v2';

/** Rascunho no navegador: a pessoa pode fechar a aba e voltar de onde parou (PRD N-02). */
function loadDraft(): { answers: Answers; step: number } {
  if (typeof window === 'undefined') return { answers: {}, step: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {}, step: 0 };
    const parsed = JSON.parse(raw) as { answers?: Answers; step?: number };
    return { answers: parsed.answers ?? {}, step: parsed.step ?? 0 };
  } catch {
    return { answers: {}, step: 0 };
  }
}

export function BoardWizard({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [gate, setGate] = useState<{ edition: string; message: string } | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const draft = loadDraft();
    setAnswers(draft.answers);
    setStep(Math.min(draft.step, questions.length - 1));
  }, [questions.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step]);

  const question = questions[step]!;
  const isLast = step === questions.length - 1;

  const answerSingle = (option: Option) => {
    const next = { ...answers, [question.id]: option.value };
    setAnswers(next);

    if (option.gate) {
      setGate({
        edition: option.gate === 'waitlist_escalar' ? 'escalar' : 'pessoal',
        message:
          option.gate === 'waitlist_escalar'
            ? 'Para empresas com time, o PROSPERE oferece a fase Escalar como programa acompanhado. Deixe seu contato e avisamos você.'
            : 'A edição Pessoal (sair das dívidas e criar renda extra) ainda não está aberta. Deixe seu contato e avisamos você.',
      });
      return;
    }

    setGate(null);
    if (!isLast) setStep(step + 1);
    else submit(next);
  };

  const submit = (finalAnswers: Answers) => {
    setError(null);
    startTransition(async () => {
      const result = await submitBoardAction(finalAnswers);
      if (result?.status === 'gate') {
        setGate({ edition: result.edition!, message: result.message! });
      } else if (result?.status === 'error') {
        setError(result.message ?? 'Não foi possível gerar a trilha.');
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    });
  };

  const joinWaitlist = () => {
    startTransition(async () => {
      const result = await joinWaitlistAction({
        email: waitlistEmail,
        edition: gate!.edition,
        answers,
      });
      if (result.status === 'ok') setFeedback(result.message);
      else setError(result.message);
    });
  };

  if (gate) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-semibold">Essa edição ainda não está aberta</h2>
          <p className="text-muted-foreground">{gate.message}</p>
          {feedback ? (
            <p className="rounded-lg border border-border bg-muted p-4 text-sm">{feedback}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <Field label="Seu e-mail" htmlFor="waitlist-email">
                <Input
                  id="waitlist-email"
                  type="email"
                  value={waitlistEmail}
                  onChange={(event) => setWaitlistEmail(event.target.value)}
                  placeholder="voce@exemplo.com.br"
                />
              </Field>
              <Button onClick={joinWaitlist} disabled={pending || waitlistEmail.length < 5}>
                Entrar na lista de espera
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setGate(null);
              setFeedback(null);
            }}
          >
            Voltar e escolher outra resposta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Progress value={((step + 1) / questions.length) * 100} label="Progresso do diagnóstico" />
        <p className="text-sm text-muted-foreground">
          Pergunta {step + 1} de {questions.length}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-semibold">{question.title}</h2>
          {question.hint ? <p className="text-sm text-muted-foreground">{question.hint}</p> : null}

          {question.type === 'single' ? (
            <div className="flex flex-col gap-2">
              {question.options?.map((option) => {
                const selected = answers[question.id] === option.value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => answerSingle(option)}
                    disabled={pending}
                    className={cn(
                      'rounded-lg border p-4 text-left text-base transition-colors hover:border-primary hover:bg-primary/5',
                      selected ? 'border-primary bg-primary/5' : 'border-border',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <GoalFields
              question={question}
              value={(answers[question.id] as Record<string, number>) ?? {}}
              onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
            />
          )}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft aria-hidden /> Voltar
        </Button>
        {question.type === 'goal' ? (
          <Button
            onClick={() => (isLast ? submit(answers) : setStep(step + 1))}
            disabled={pending || !goalComplete(answers[question.id])}
          >
            {isLast ? 'Gerar minha trilha' : 'Continuar'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function goalComplete(value: unknown): boolean {
  const goal = value as { valor?: number; ticket?: number; prazo_meses?: number } | undefined;
  return Boolean(goal?.valor && goal.ticket && goal.prazo_meses);
}

function GoalFields({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {question.fields?.map((field) => {
        if (field.type === 'single') {
          return (
            <Field key={field.id} label={field.label}>
              <div className="flex flex-wrap gap-2">
                {field.options?.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={value[field.id] === option ? 'default' : 'outline'}
                    onClick={() => onChange({ ...value, [field.id]: option })}
                  >
                    {option} meses
                  </Button>
                ))}
              </div>
            </Field>
          );
        }
        return (
          <Field key={field.id} label={field.label} htmlFor={`goal-${field.id}`}>
            <Input
              id={`goal-${field.id}`}
              type="number"
              inputMode="decimal"
              min={0}
              value={value[field.id] ?? ''}
              onChange={(event) =>
                onChange({ ...value, [field.id]: Number(event.target.value) || 0 })
              }
              placeholder="0"
            />
          </Field>
        );
      })}
    </div>
  );
}
