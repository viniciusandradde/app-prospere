import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { requireUser } from '@/lib/auth';
import { getActiveTrail, phaseProgress, toMissionViews } from '@/lib/queries';
import { brl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TrilhaPage() {
  const user = await requireUser();
  const trail = await getActiveTrail(user.workspaceId);
  if (!trail) redirect('/onboarding/board');

  const views = toMissionViews(trail);
  const phases = phaseProgress(trail, views);
  const { plan } = trail;
  const done = views.filter((v) => v.row.status === 'done').length;

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{plan.archetypeLabel}</Badge>
          {plan.essentialMode ? <Badge variant="warning">Modo essencial</Badge> : null}
          <Badge variant="secondary">
            {plan.launchKind === 'seed' ? 'Lançamento semente' : 'Lançamento interno'}
          </Badge>
        </div>
        <h1 className="text-2xl font-semibold">Sua trilha</h1>
        <p className="text-muted-foreground">{plan.explanation.intro}</p>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="text-sm">{plan.explanation.goal}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="Meta mensal" value={brl(plan.goal.monthlyTarget)} />
              <Metric label="Vendas/semana" value={String(plan.goal.salesPerWeek)} />
              <Metric label="Contatos/semana" value={String(plan.goal.contactsPerWeek)} />
              <Metric label="Estimativa" value={`${plan.estimate.weeks} sem.`} />
            </div>
            <p className="text-xs text-muted-foreground">
              Conversão de {Math.round(plan.goal.assumedConversion * 100)}% é referência inicial —
              calibre com seus dados nas primeiras semanas.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Progress value={(done / views.length) * 100} label="Progresso da trilha" />
          <p className="text-sm text-muted-foreground">
            {done} de {views.length} missões concluídas · {plan.estimate.totalHours} h estimadas a{' '}
            {plan.estimate.hoursPerWeek} h por semana
          </p>
        </div>
      </header>

      {plan.explanation.adjustments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Por que a sua trilha é assim</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm">{plan.explanation.launchKind}</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {plan.explanation.adjustments.map((adjustment) => (
                <li key={adjustment.id}>• {adjustment.why}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col gap-5">
        {phases.map((phase) => (
          <Card key={phase.id}>
            <CardHeader>
              <div className="flex items-baseline justify-between gap-3">
                <CardTitle>{phase.name}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {phase.done}/{phase.total} · ~{phase.estWeeks} sem.
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{phase.question}</p>
              <Progress value={phase.percent} className="mt-2" label={`Progresso de ${phase.name}`} />
            </CardHeader>
            <CardContent className="flex flex-col">
              {phase.missions.map((mission) => {
                const blocked = mission.blockedBy.length > 0;
                const concluida = mission.row.status === 'done';
                return (
                  <Link
                    key={mission.id}
                    href={`/missao/${mission.id}`}
                    className="flex items-start gap-3 rounded-lg border-b border-border px-2 py-3 last:border-0 hover:bg-muted"
                  >
                    {concluida ? (
                      <CheckCircle2 className="mt-0.5 size-5 text-primary" aria-hidden />
                    ) : blocked ? (
                      <Lock className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
                    )}
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={concluida ? 'text-muted-foreground line-through' : ''}>
                          {mission.title}
                        </span>
                        {mission.optional ? <Badge variant="secondary">por ajuste</Badge> : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {blocked
                          ? `Depende de ${mission.blockedBy.join(', ')}`
                          : `${mission.effortHours} h · ${kindLabel(mission.kind)}`}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/api/export?tipo=trilha">Exportar trilha em Markdown</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/onboarding/board">Refazer diagnóstico</Link>
        </Button>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function kindLabel(kind: string): string {
  const labels: Record<string, string> = {
    template: 'resposta guiada',
    counter: 'contador',
    tool: 'ferramenta',
    external: 'template externo',
    checklist: 'checklist',
  };
  return labels[kind] ?? kind;
}
