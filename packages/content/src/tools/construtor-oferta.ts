import { z } from 'zod';
import type { Tool } from '../types';

/**
 * T-PER-01 · Construtor de Oferta + Checklist Ético.
 * Regra do PRD (N-07): a oferta não pode ser marcada como "final" com qualquer princípio
 * classificado como artificial. Escassez falsa e prova inventada destroem confiança
 * (As Armas da Persuasão 2.0, Cialdini) — o app bloqueia, não avisa.
 */
export const PRINCIPIOS = [
  'reciprocidade',
  'afeicao',
  'aprovacao_social',
  'autoridade',
  'escassez',
  'compromisso_coerencia',
  'unidade',
] as const;
export type Principio = (typeof PRINCIPIOS)[number];

export const PRINCIPIO_LABELS: Record<Principio, string> = {
  reciprocidade: 'Reciprocidade',
  afeicao: 'Afeição',
  aprovacao_social: 'Aprovação social',
  autoridade: 'Autoridade',
  escassez: 'Escassez',
  compromisso_coerencia: 'Compromisso e coerência',
  unidade: 'Unidade',
};

export const PRINCIPIO_HINTS: Record<Principio, string> = {
  reciprocidade: 'O que você entrega de valor antes de pedir a compra?',
  afeicao: 'Onde a pessoa reconhece algo de si em você?',
  aprovacao_social: 'Que prova de outras pessoas é real e verificável?',
  autoridade: 'Que competência sua é demonstrável — não alegada?',
  escassez: 'A limitação é verdadeira? Vagas, prazo ou bônus que existem de fato.',
  compromisso_coerencia: 'Que pequeno passo a pessoa dá antes do passo grande?',
  unidade: 'Que "nós" você e o cliente realmente compartilham?',
};

export const PRINCIPIO_STATUS = ['aplicado', 'nao_se_aplica', 'artificial'] as const;
export const PRINCIPIO_STATUS_LABELS: Record<(typeof PRINCIPIO_STATUS)[number], string> = {
  aplicado: 'Aplicado e verdadeiro',
  nao_se_aplica: 'Não se aplica',
  artificial: 'Está na oferta, mas é artificial',
};

export const objecaoSchema = z.object({
  objecao: z.string().min(3),
  resposta: z.string().min(3),
  prova: z.string().default(''),
});

export const checklistItemSchema = z.object({
  principio: z.enum(PRINCIPIOS),
  status: z.enum(PRINCIPIO_STATUS).default('nao_se_aplica'),
  como: z.string().default(''),
});

export const ofertaSchema = z
  .object({
    cliente: z.string().default(''),
    resultado: z.string().default(''),
    obstaculo: z.string().default(''),
    beneficios_emocionais: z.array(z.string()).max(3).default(['', '', '']),
    beneficios_praticos: z.array(z.string()).max(3).default(['', '', '']),
    prova: z.string().default(''),
    garantia: z.string().default(''),
    escassez_real: z.string().default('nenhuma'),
    bonus: z.array(z.string()).default([]),
    preco: z.number().nonnegative().nullable().default(null),
    comparacao_de_valor: z.string().default(''),
    objecoes: z.array(objecaoSchema).default([]),
    checklist: z.array(checklistItemSchema).default([]),
    status: z.enum(['draft', 'final']).default('draft'),
  })
  .superRefine((oferta, ctx) => {
    if (oferta.status !== 'final') return;

    const artificiais = oferta.checklist.filter((item) => item.status === 'artificial');
    if (artificiais.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['checklist'],
        message: `Remova o que é artificial antes de finalizar: ${artificiais
          .map((item) => PRINCIPIO_LABELS[item.principio])
          .join(', ')}.`,
      });
    }
    if (oferta.cliente.trim() === '' || oferta.resultado.trim() === '' || oferta.obstaculo.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['cliente'],
        message: 'A promessa precisa estar completa: ajudo [cliente] a [resultado] sem [obstáculo].',
      });
    }
    if (oferta.objecoes.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['objecoes'],
        message: 'Responda pelo menos 3 objeções antes de finalizar a oferta.',
      });
    }
    if (oferta.preco === null) {
      ctx.addIssue({ code: 'custom', path: ['preco'], message: 'Defina o preço.' });
    }
  });

export type Oferta = z.infer<typeof ofertaSchema>;

export const construtorOfertaTool: Tool = {
  id: 'T-PER-01',
  phaseId: 'PER',
  name: 'Construtor de Oferta',
  description:
    'Promessa em uma frase, benefícios, prova, garantia, preço e objeções — auditados pelos 7 princípios. Gatilho artificial não passa.',
  schemaVersion: 1,
  outputKind: 'document',
  slug: 'oferta',
};

export function emptyOferta(): Oferta {
  return {
    cliente: '',
    resultado: '',
    obstaculo: '',
    beneficios_emocionais: ['', '', ''],
    beneficios_praticos: ['', '', ''],
    prova: '',
    garantia: '',
    escassez_real: 'nenhuma',
    bonus: [],
    preco: null,
    comparacao_de_valor: '',
    objecoes: [],
    checklist: PRINCIPIOS.map((principio) => ({ principio, status: 'nao_se_aplica' as const, como: '' })),
    status: 'draft',
  };
}

export function promessa(oferta: Pick<Oferta, 'cliente' | 'resultado' | 'obstaculo'>): string {
  return `Ajudo ${oferta.cliente || '[cliente]'} a ${oferta.resultado || '[resultado]'} sem ${
    oferta.obstaculo || '[obstáculo]'
  }.`;
}

const moeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function renderOferta(data: Oferta): string {
  const linhas: string[] = ['# Minha oferta', '', `**${promessa(data)}**`, ''];

  const emocionais = data.beneficios_emocionais.filter((b) => b.trim() !== '');
  const praticos = data.beneficios_praticos.filter((b) => b.trim() !== '');
  if (emocionais.length > 0) {
    linhas.push('## O que muda para você', '', ...emocionais.map((b) => `- ${b}`), '');
  }
  if (praticos.length > 0) {
    linhas.push('## O que você recebe', '', ...praticos.map((b) => `- ${b}`), '');
  }
  if (data.prova) linhas.push('## Prova', '', data.prova, '');
  if (data.garantia) linhas.push('## Garantia', '', data.garantia, '');
  if (data.bonus.length > 0) {
    linhas.push('## Bônus', '', ...data.bonus.filter(Boolean).map((b) => `- ${b}`), '');
  }
  if (data.preco !== null) {
    linhas.push('## Investimento', '', moeda(data.preco), '');
    if (data.comparacao_de_valor) linhas.push(data.comparacao_de_valor, '');
  }
  if (data.escassez_real && data.escassez_real !== 'nenhuma') {
    linhas.push('## Limite real', '', data.escassez_real, '');
  }
  if (data.objecoes.length > 0) {
    linhas.push('## Objeções', '');
    for (const o of data.objecoes) {
      linhas.push(`**"${o.objecao}"**`, '', o.resposta, '');
      if (o.prova) linhas.push(`_Prova: ${o.prova}_`, '');
    }
  }

  linhas.push('## Auditoria ética dos 7 princípios', '');
  linhas.push('| Princípio | Status | Como |', '|:--|:--|:--|');
  for (const item of data.checklist) {
    linhas.push(
      `| ${PRINCIPIO_LABELS[item.principio]} | ${PRINCIPIO_STATUS_LABELS[item.status]} | ${
        item.como || '—'
      } |`,
    );
  }
  linhas.push(
    '',
    '---',
    '',
    '_Gerado pelo PROSPERE. Método: As Armas da Persuasão 2.0 (Robert Cialdini) — só gatilhos verdadeiros._',
  );
  return linhas.join('\n');
}
