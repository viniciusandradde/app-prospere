import { z } from 'zod';

/**
 * Rascunhos escritos por IA (ADR-010). A IA **não decide a trilha** — isso é do motor
 * determinístico (ADR-001). Ela escreve uma primeira versão dos campos, sempre marcada como
 * rascunho, sempre editável, e nunca inventa número: só reusa o que a pessoa já registrou.
 */

export const DRAFT_TARGETS = ['oferta.promessa', 'oferta.beneficios', 'oferta.objecoes', 'quadro.hipotese', 'missao.template'] as const;
export type DraftTarget = (typeof DRAFT_TARGETS)[number];

export const promessaSchema = z.object({
  cliente: z.string().min(3),
  resultado: z.string().min(3),
  obstaculo: z.string().min(3),
});

export const beneficiosSchema = z.object({
  emocionais: z.array(z.string().min(3)).length(3),
  praticos: z.array(z.string().min(3)).length(3),
});

export const objecoesSchema = z.object({
  objecoes: z
    .array(
      z.object({
        objecao: z.string().min(3),
        resposta: z.string().min(10),
        prova: z.string().default(''),
      }),
    )
    .min(3)
    .max(5),
});

export const hipoteseSchema = z.object({
  hipotese: z.string().min(20),
  metrica: z.string().min(3),
  criterio_sucesso: z.string().min(3),
});

export const templateSchema = z.object({
  secoes: z.array(z.object({ id: z.string().min(1), texto: z.string().min(1) })).min(1),
});

const SCHEMAS = {
  'oferta.promessa': promessaSchema,
  'oferta.beneficios': beneficiosSchema,
  'oferta.objecoes': objecoesSchema,
  'quadro.hipotese': hipoteseSchema,
  'missao.template': templateSchema,
} as const;

export type DraftResult<T extends DraftTarget> = z.infer<(typeof SCHEMAS)[T]>;

const FORMATOS: Record<DraftTarget, string> = {
  'oferta.promessa': '{"cliente": "...", "resultado": "...", "obstaculo": "..."}',
  'oferta.beneficios': '{"emocionais": ["...", "...", "..."], "praticos": ["...", "...", "..."]}',
  'oferta.objecoes':
    '{"objecoes": [{"objecao": "...", "resposta": "...", "prova": "..."}, ... 3 no mínimo]}',
  'quadro.hipotese': '{"hipotese": "...", "metrica": "...", "criterio_sucesso": "..."}',
  'missao.template': '{"secoes": [{"id": "<id da seção>", "texto": "..."}]}',
};

const INSTRUCOES: Record<DraftTarget, string> = {
  'oferta.promessa':
    'Escreva a promessa da oferta no formato "ajudo [cliente] a [resultado] sem [obstáculo]", devolvendo as três partes separadas. O cliente precisa ser específico o bastante para caber em uma busca; o resultado, observável; o obstáculo, aquilo que a pessoa já tentou e não deu certo.',
  'oferta.beneficios':
    'Escreva 3 benefícios emocionais (o que muda no dia a dia de quem compra) e 3 práticos (o que a pessoa literalmente recebe). Frases curtas, sem adjetivo vazio.',
  'oferta.objecoes':
    'Escreva as 3 objeções mais prováveis desse cliente e responda cada uma no formato "sim, e…" — reconheça a objeção antes de responder. Em prova, indique apenas o que já existe nos dados; se não houver, deixe vazio.',
  'quadro.hipotese':
    'Escreva a hipótese de maior risco como afirmação testável ("Acreditamos que [cliente] paga R$ [x] por [solução] porque [dor]"), a métrica que a derruba ou confirma e o critério de sucesso com número e prazo de no máximo 14 dias.',
  'missao.template':
    'Escreva um rascunho para cada seção da missão, usando o id exato de cada uma. Responda o que a seção pede, sem repetir o enunciado.',
};

export const SYSTEM_PROMPT = [
  'Você escreve rascunhos para o PROSPERE, um app brasileiro que acompanha quem está tirando um negócio do papel ou fazendo o negócio vender mais.',
  '',
  'Regras que não se quebram:',
  '- Use apenas os dados fornecidos sobre a pessoa. Não invente número, nome de cliente, depoimento, resultado ou prova.',
  '- Faltou informação? Escreva o que dá e deixe [entre colchetes] o que a pessoa precisa completar.',
  '- Escreva em primeira pessoa, português do Brasil, frases curtas e concretas. Nada de jargão de marketing.',
  '- Não prometa resultado garantido, ganho rápido nem exclusividade que não exista.',
  '- Isto é um rascunho: a pessoa vai editar. Prefira o específico ao genérico, mesmo correndo o risco de errar — ela corrige.',
  '',
  'Responda apenas com o JSON pedido, sem cercas de código e sem texto em volta.',
].join('\n');

export interface DraftContext {
  archetype: string;
  /** Meta decomposta já calculada pelo motor — números reais da pessoa. */
  goal: { monthlyTarget: number; ticket: number; salesPerWeek: number };
  /** Respostas do board que descrevem o momento (produto, vendas, audiência). */
  situacao: Record<string, string>;
  /** Textos que a pessoa já escreveu em missões anteriores, por id de missão. */
  respostas: Array<{ missionId: string; titulo: string; texto: string }>;
  /** Oferta em andamento, quando existir. */
  oferta?: Record<string, unknown>;
  /** Seções a preencher, quando o alvo é uma missão de resposta guiada. */
  secoes?: Array<{ id: string; label: string; hint?: string }>;
}

const linha = (rotulo: string, valor: string): string => `${rotulo}: ${valor}`;

/** Monta o prompt do usuário. Função pura — o que entra aqui é tudo que a IA vê. */
export function buildUserPrompt(target: DraftTarget, context: DraftContext): string {
  const partes: string[] = ['## Quem é a pessoa', ''];
  partes.push(linha('Ponto de partida', context.archetype === 'A3' ? 'Fundador(a): tem ideia ou protótipo, ainda não fatura' : 'Operador(a): negócio em operação, quer vender mais'));
  partes.push(
    linha(
      'Meta',
      `R$ ${context.goal.monthlyTarget} por mês, ticket de R$ ${context.goal.ticket}, ${context.goal.salesPerWeek} vendas por semana`,
    ),
  );
  for (const [chave, valor] of Object.entries(context.situacao)) partes.push(linha(chave, valor));

  if (context.respostas.length > 0) {
    partes.push('', '## O que ela já escreveu', '');
    for (const resposta of context.respostas) {
      partes.push(`### ${resposta.titulo} (${resposta.missionId})`, resposta.texto, '');
    }
  }

  if (context.oferta && Object.keys(context.oferta).length > 0) {
    partes.push('', '## Oferta em andamento', '', JSON.stringify(context.oferta), '');
  }

  if (context.secoes && context.secoes.length > 0) {
    partes.push('', '## Seções a preencher', '');
    for (const secao of context.secoes) {
      partes.push(`- id "${secao.id}" — ${secao.label}${secao.hint ? ` (${secao.hint})` : ''}`);
    }
  }

  partes.push('', '## Tarefa', '', INSTRUCOES[target], '', `Formato da resposta: ${FORMATOS[target]}`);
  return partes.join('\n');
}

/** Extrai o JSON da resposta e valida contra o schema do alvo. */
export function parseDraft<T extends DraftTarget>(
  target: T,
  raw: string,
): { ok: true; data: DraftResult<T> } | { ok: false; error: string } {
  const semCercas = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const inicio = semCercas.indexOf('{');
  const fim = semCercas.lastIndexOf('}');
  if (inicio === -1 || fim === -1) return { ok: false, error: 'A IA não devolveu JSON.' };

  let bruto: unknown;
  try {
    bruto = JSON.parse(semCercas.slice(inicio, fim + 1));
  } catch {
    return { ok: false, error: 'A IA devolveu um JSON inválido.' };
  }

  const parsed = SCHEMAS[target].safeParse(bruto);
  if (!parsed.success) {
    return { ok: false, error: 'O rascunho veio fora do formato esperado.' };
  }
  return { ok: true, data: parsed.data as DraftResult<T> };
}
