import Link from 'next/link';
import { phases } from '@prospere/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { currentUser } from '@/lib/auth';

export default async function Home() {
  const user = await currentUser().catch(() => null);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-5 py-14">
      <header className="flex flex-col gap-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">PROSPERE</p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Sua trilha do zero ao próximo nível.
        </h1>
        <p className="text-lg text-muted-foreground">
          Sete perguntas viram uma trilha só sua: missões com resultado verificável, três ferramentas
          que geram artefatos e um ritual semanal com o número que importa. Não é curso — é execução
          acompanhada.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={user ? '/hoje' : '/entrar'}>
              {user ? 'Ir para Hoje' : 'Começar o diagnóstico'}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/entrar">Já tenho conta</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">O caminho</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {phases.map((phase) => (
            <Card key={phase.id}>
              <CardContent className="flex flex-col gap-1 p-5">
                <span className="text-sm font-semibold text-primary">{phase.name}</span>
                <span className="text-sm text-muted-foreground">{phase.question}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          A edição Negócio atende quem tem uma ideia ou um negócio em operação. Empresas com time e
          quem busca renda extra entram na lista de espera.
        </p>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          O PROSPERE é uma ferramenta de organização e execução. Não é consultoria financeira,
          contábil, jurídica ou de investimentos. Números exibidos são referência inicial — calibre
          com seus dados.
        </p>
      </footer>
    </main>
  );
}
