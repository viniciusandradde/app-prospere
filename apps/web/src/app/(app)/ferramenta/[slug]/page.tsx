import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  emptyOferta,
  ofertaSchema,
  quadroCmaSchema,
  toolBySlug,
  type Oferta,
  type QuadroCma,
} from '@prospere/content';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth';
import { getArtifact } from '@/lib/queries';
import { OfertaForm } from './oferta-form';
import { QuadroForm } from './quadro-form';

export const dynamic = 'force-dynamic';

export default async function FerramentaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // A Revisão Semanal é um ritual: vive na própria tela, com streak e histórico.
  if (slug === 'revisao') redirect('/ritual');

  const tool = toolBySlug.get(slug);
  if (!tool) notFound();

  const user = await requireUser();
  const artifact = await getArtifact(user.workspaceId, tool.id);

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/trilha" className="text-sm text-muted-foreground hover:underline">
          ← Voltar para a trilha
        </Link>
        <h1 className="text-2xl font-semibold">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
      </header>

      {tool.id === 'T-SON-03' ? (
        <QuadroForm initial={parseQuadro(artifact?.data)} />
      ) : (
        <OfertaForm initial={parseOferta(artifact?.data)} />
      )}

      <Button asChild variant="outline" className="self-start">
        <Link href={`/api/export?tipo=${slug}`}>Exportar em Markdown</Link>
      </Button>
    </main>
  );
}

function parseQuadro(data: unknown): QuadroCma {
  const parsed = quadroCmaSchema.safeParse(data ?? { cards: [] });
  return parsed.success ? parsed.data : { cards: [] };
}

function parseOferta(data: unknown): Oferta {
  const parsed = ofertaSchema.safeParse(data ?? emptyOferta());
  return parsed.success ? parsed.data : emptyOferta();
}
