import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth';
import { getActiveTrail, getWeeklyRitual, nextMission, toMissionViews } from '@/lib/queries';
import { dataBR, plural, weekStart } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HojePage() {
  const user = await requireUser();
  const trail = await getActiveTrail(user.workspaceId);
  if (!trail) redirect('/onboarding/board');

  const views = toMissionViews(trail);
  const proxima = nextMission(views, trail.plan.quickStart.missionIds);
  const ritual = await getWeeklyRitual(user.workspaceId);
  const semanaAtual = weekStart();
  const revisaoFeita = ritual?.entries.some((entry) => entry.periodStart === semanaAtual) ?? false;
  const ultima = ritual?.entries[0];
  const prioridades =
    (ultima?.data as { prioridades_proxima?: string[] } | undefined)?.prioridades_proxima?.filter(
      (p) => p.trim() !== '',
    ) ?? [];

  const numeroDaSemana = ultima ? Number(ultima.metricValue ?? 0) : 0;
  const meta = trail.plan.goal.salesPerWeek;

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Hoje</h1>
        <p className="text-muted-foreground">
          Uma missão por vez. O resto da trilha espera.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Próxima missão</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {proxima ? (
            <>
              {trail.plan.quickStart.missionIds.includes(proxima.id) ? (
                <Badge variant="secondary">Primeira semana</Badge>
              ) : null}
              <p className="text-lg font-medium">{proxima.title}</p>
              <p className="text-sm text-muted-foreground">{proxima.result}</p>
              <Button asChild className="self-start">
                <Link href={`/missao/${proxima.id}`}>
                  Abrir missão <ArrowRight aria-hidden />
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">
              Todas as missões desta trilha estão concluídas. Refaça o diagnóstico para gerar o
              próximo ciclo.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Número da semana</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-semibold">
              {numeroDaSemana}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                / {meta} {trail.plan.goal.metricName}
              </span>
            </p>
            {ultima ? (
              <p className="text-xs text-muted-foreground">
                Registrado na revisão de {dataBR(ultima.periodStart)}.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                O número aparece depois da sua primeira Revisão Semanal.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ritual semanal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-primary" aria-hidden />
              <span className="text-sm">
                {plural(ritual?.ritual.streak ?? 0, 'semana seguida', 'semanas seguidas')}
              </span>
            </div>
            {revisaoFeita ? (
              <Badge variant="success">Revisão desta semana feita</Badge>
            ) : (
              <Button asChild variant="outline">
                <Link href="/ritual">Fazer a revisão (30 min)</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>3 prioridades da semana</CardTitle>
        </CardHeader>
        <CardContent>
          {prioridades.length > 0 ? (
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              {prioridades.map((prioridade) => (
                <li key={prioridade}>{prioridade}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Suas prioridades saem da Revisão Semanal — é lá que você escolhe as 3 da próxima
              semana.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
