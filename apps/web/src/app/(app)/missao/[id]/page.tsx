import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { toolById } from '@prospere/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth';
import { getActiveTrail, toMissionViews } from '@/lib/queries';
import { CompleteButton, Counter, ResponseForm } from './mission-client';

export const dynamic = 'force-dynamic';

export default async function MissaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const trail = await getActiveTrail(user.workspaceId);
  if (!trail) redirect('/onboarding/board');

  const mission = toMissionViews(trail).find((view) => view.id === id);
  if (!mission) notFound();

  const tool = mission.toolId ? toolById.get(mission.toolId) : undefined;
  const done = mission.row.status === 'done';

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/trilha" className="text-sm text-muted-foreground hover:underline">
          ← Voltar para a trilha
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{mission.id}</Badge>
          {done ? <Badge variant="success">Concluída</Badge> : null}
          {mission.recurring ? <Badge variant="outline">recorrente</Badge> : null}
        </div>
        <h1 className="text-2xl font-semibold">{mission.title}</h1>
        <p className="text-muted-foreground">{mission.objective}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como fazer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            {mission.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="rounded-lg border border-border bg-muted p-4 text-sm">
            <p className="font-medium">Resultado verificável</p>
            <p className="text-muted-foreground">{mission.result}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Esforço estimado: {mission.effortHours} h
            {mission.credit ? ` · Base: ${mission.credit}` : ''}
          </p>
        </CardContent>
      </Card>

      {mission.template ? (
        <Card>
          <CardHeader>
            <CardTitle>Sua resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseForm
              trailMissionId={mission.row.id}
              sections={mission.template}
              initial={mission.row.responseText}
            />
          </CardContent>
        </Card>
      ) : null}

      {mission.counter ? (
        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <Counter
              trailMissionId={mission.row.id}
              counter={mission.counter}
              entries={mission.row.counter}
            />
          </CardContent>
        </Card>
      ) : null}

      {tool ? (
        <Card>
          <CardHeader>
            <CardTitle>Ferramenta: {tool.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{tool.description}</p>
            <Button asChild className="self-start">
              <Link href={`/ferramenta/${tool.slug}`}>Abrir {tool.name}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {mission.external ? (
        <Card>
          <CardHeader>
            <CardTitle>Ferramenta externa</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Esta missão usa uma ferramenta de fora do app: {mission.external}. Traga o resultado de
            volta para cá marcando a missão como concluída.
          </CardContent>
        </Card>
      ) : null}

      <CompleteButton trailMissionId={mission.row.id} done={done} blockedBy={mission.blockedBy} />
    </main>
  );
}
