import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Flame } from 'lucide-react';
import { requiresPivotBlock, revisaoSemanalSchema, type RevisaoSemanal } from '@prospere/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth';
import { getActiveTrail, getWeeklyRitual } from '@/lib/queries';
import { dataBR, weekStart } from '@/lib/utils';
import { ReviewForm } from './review-form';

export const dynamic = 'force-dynamic';

export default async function RitualPage() {
  const user = await requireUser();
  const trail = await getActiveTrail(user.workspaceId);
  if (!trail) redirect('/onboarding/board');

  const ritual = await getWeeklyRitual(user.workspaceId);
  const periodStart = weekStart();
  const entries = ritual?.entries ?? [];
  const atual = entries.find((entry) => entry.periodStart === periodStart);

  const reviewNumber = atual ? entries.length : entries.length + 1;
  const parsed = atual ? revisaoSemanalSchema.safeParse(atual.data) : null;
  const initial: RevisaoSemanal | null = parsed?.success ? parsed.data : null;
  const meta = trail.plan.goal.salesPerWeek;
  const historico = entries.slice(0, 8).reverse();
  const maior = Math.max(meta, ...historico.map((entry) => Number(entry.metricValue ?? 0)), 1);

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Semana de {dataBR(periodStart)}</Badge>
          {atual ? <Badge variant="success">Já revisada</Badge> : null}
          {requiresPivotBlock(reviewNumber) ? (
            <Badge variant="warning">4ª do ciclo: pivotar ou perseverar</Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold">Revisão Semanal</h1>
        <p className="text-muted-foreground">
          Trinta minutos: o que você fez, o que os números dizem e as 3 prioridades da próxima
          semana.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Flame className="size-5 text-primary" aria-hidden />
          <span>
            Streak atual: <strong>{ritual?.ritual.streak ?? 0}</strong> · melhor:{' '}
            {ritual?.ritual.bestStreak ?? 0}
          </span>
        </div>
      </header>

      {historico.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>O número da semana</CardTitle>
            <p className="text-sm text-muted-foreground">Meta: {meta} por semana.</p>
          </CardHeader>
          <CardContent>
            <ul className="flex items-end gap-2" aria-label="Histórico do número da semana">
              {historico.map((entry) => {
                const valor = Number(entry.metricValue ?? 0);
                const altura = Math.max(4, (valor / maior) * 100);
                return (
                  <li key={entry.periodStart} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{valor}</span>
                    <div
                      className={`w-full rounded-t ${valor >= meta ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                      style={{ height: `${altura}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {dataBR(entry.periodStart).slice(0, 5)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <ReviewForm
        periodStart={periodStart}
        initial={initial}
        needsPivot={requiresPivotBlock(reviewNumber)}
        metaDaSemana={meta}
      />

      {entries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {entries.map((entry) => {
              const data = entry.data as RevisaoSemanal;
              return (
                <div key={entry.id} className="flex flex-col gap-1 py-3">
                  <span className="text-sm font-medium">Semana de {dataBR(entry.periodStart)}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.numeros?.vendas ?? 0} vendas · {data.numeros?.conversas ?? 0} conversas
                    {data.pivot ? ` · decisão: ${data.pivot.decisao}` : ''}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="outline" className="self-start">
        <Link href="/api/export?tipo=revisoes">Exportar revisões em Markdown</Link>
      </Button>
    </main>
  );
}
