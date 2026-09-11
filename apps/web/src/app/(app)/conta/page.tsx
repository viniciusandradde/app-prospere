import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth';
import { isAiEnabled } from '@/lib/ai';
import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getWeeklyRitual } from '@/lib/queries';
import { AiConsent, DangerZone, ReminderSettings } from './account-client';

export const dynamic = 'force-dynamic';

export default async function ContaPage() {
  const user = await requireUser();
  const ritual = await getWeeklyRitual(user.workspaceId);
  const [conta] = await getDb()
    .select({ aiConsentAt: schema.users.aiConsentAt })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Conta</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lembrete da Revisão Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderSettings
            weekday={ritual?.ritual.weekday ?? 5}
            timeLocal={ritual?.ritual.timeLocal ?? '18:00:00'}
            reminder={ritual?.ritual.reminder ?? true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escrita assistida por IA</CardTitle>
        </CardHeader>
        <CardContent>
          <AiConsent granted={Boolean(conta?.aiConsentAt)} available={isAiEnabled()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seus dados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Exportação e exclusão são direitos seus (LGPD). A exportação sai em Markdown, legível
            fora do app.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/api/export?tipo=tudo">Exportar tudo</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/onboarding/board">Refazer o diagnóstico</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encerrar</CardTitle>
        </CardHeader>
        <CardContent>
          <DangerZone />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        O PROSPERE é uma ferramenta de organização e execução. Não é consultoria financeira,
        contábil, jurídica ou de investimentos. Os números exibidos são referência inicial — calibre
        com seus dados.
      </p>
    </main>
  );
}
