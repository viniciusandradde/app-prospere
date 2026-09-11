import Link from 'next/link';
import { redirect } from 'next/navigation';
import { board } from '@prospere/engine';
import { currentUser } from '@/lib/auth';
import { track } from '@/lib/telemetry';
import { BoardWizard } from './board-wizard';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const user = await currentUser();
  if (!user) redirect('/entrar');

  await track('board_started', { userId: user.id, workspaceId: user.workspaceId });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-primary">
          PROSPERE
        </Link>
        <h1 className="text-2xl font-semibold">Diagnóstico</h1>
        <p className="text-muted-foreground">
          Sete perguntas, menos de quatro minutos. Elas definem por onde você começa e o que fica
          de fora — sua trilha não é a de todo mundo.
        </p>
      </header>

      <BoardWizard questions={board.questions as never} />
    </main>
  );
}
