import { describe, expect, it } from 'vitest';
import {
  computeStreak,
  emptyCard,
  emptyOferta,
  emptyRevisao,
  ofertaSchema,
  promessa,
  quadroCmaSchema,
  renderOferta,
  renderQuadroCma,
  renderRevisao,
  requiresPivotBlock,
  revisaoSemanalSchema,
} from '../src/index';

describe('T-SON-03 · Quadro Construir-Medir-Aprender', () => {
  const cartaoCompleto = {
    ...emptyCard('c1', 'Nutricionistas pagam R$ 500 por um programa de 8 semanas'),
    experimento: 'Oferecer para 20 pessoas da lista',
    metrica: 'pré-vendas fechadas',
    criterio_sucesso: '3 pré-vendas em 14 dias',
    prazo: '2026-10-01',
  };

  it('aceita um cartão novo na coluna A testar sem critério ainda', () => {
    const parsed = quadroCmaSchema.safeParse({ cards: [emptyCard('c1', 'Alguém paga por isso?')] });
    expect(parsed.success).toBe(true);
  });

  it('não deixa o cartão rodar sem critério de sucesso', () => {
    const parsed = quadroCmaSchema.safeParse({
      cards: [{ ...emptyCard('c1', 'Alguém paga por isso?'), coluna: 'rodando', metrica: 'vendas' }],
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(JSON.stringify(parsed.error.issues)).toContain('critério de sucesso');
  });

  it('não deixa o cartão rodar sem métrica', () => {
    const parsed = quadroCmaSchema.safeParse({
      cards: [{ ...emptyCard('c1', 'Alguém paga por isso?'), coluna: 'rodando', criterio_sucesso: '3 vendas' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('deixa rodar quando métrica e critério estão definidos', () => {
    const parsed = quadroCmaSchema.safeParse({ cards: [{ ...cartaoCompleto, coluna: 'rodando' }] });
    expect(parsed.success).toBe(true);
  });

  it('exige decisão para fechar o cartão em Aprendido', () => {
    const semDecisao = quadroCmaSchema.safeParse({
      cards: [{ ...cartaoCompleto, coluna: 'aprendido', resultado: '1 pré-venda' }],
    });
    expect(semDecisao.success).toBe(false);

    const comDecisao = quadroCmaSchema.safeParse({
      cards: [{ ...cartaoCompleto, coluna: 'aprendido', resultado: '1 pré-venda', decisao: 'ajustar' }],
    });
    expect(comDecisao.success).toBe(true);
  });

  it('renderiza o quadro em Markdown por coluna', () => {
    const markdown = renderQuadroCma({ cards: [{ ...cartaoCompleto, coluna: 'rodando' }] });
    expect(markdown).toContain('# Quadro Construir-Medir-Aprender');
    expect(markdown).toContain('## Rodando (1)');
    expect(markdown).toContain('3 pré-vendas em 14 dias');
  });
});

describe('T-PER-01 · Construtor de Oferta', () => {
  const base = {
    ...emptyOferta(),
    cliente: 'nutricionistas autônomas',
    resultado: 'fechar 10 clientes por mês',
    obstaculo: 'depender de indicação',
    preco: 1500,
    objecoes: [
      { objecao: 'Está caro', resposta: 'Compare com um mês sem clientes', prova: '' },
      { objecao: 'Não sei se funciona', resposta: 'Veja o caso da Ana', prova: 'print do resultado' },
      { objecao: 'Não é o momento', resposta: 'O próximo mês custa o mesmo', prova: '' },
    ],
  };

  it('monta a promessa no formato do método', () => {
    expect(promessa(base)).toBe(
      'Ajudo nutricionistas autônomas a fechar 10 clientes por mês sem depender de indicação.',
    );
  });

  it('aceita rascunho incompleto', () => {
    expect(ofertaSchema.safeParse(emptyOferta()).success).toBe(true);
  });

  it('bloqueia a oferta final com gatilho artificial', () => {
    const comArtificial = {
      ...base,
      status: 'final',
      checklist: base.checklist.map((item) =>
        item.principio === 'escassez' ? { ...item, status: 'artificial', como: 'só 3 vagas (não é verdade)' } : item,
      ),
    };
    const parsed = ofertaSchema.safeParse(comArtificial);
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(JSON.stringify(parsed.error.issues)).toContain('artificial');
  });

  it('exige promessa completa, preço e 3 objeções para finalizar', () => {
    expect(ofertaSchema.safeParse({ ...base, status: 'final', objecoes: base.objecoes.slice(0, 2) }).success).toBe(false);
    expect(ofertaSchema.safeParse({ ...base, status: 'final', preco: null }).success).toBe(false);
    expect(ofertaSchema.safeParse({ ...base, status: 'final', cliente: '' }).success).toBe(false);
    expect(ofertaSchema.safeParse({ ...base, status: 'final' }).success).toBe(true);
  });

  it('renderiza a oferta com a auditoria dos 7 princípios', () => {
    const markdown = renderOferta(ofertaSchema.parse({ ...base, status: 'final' }));
    expect(markdown).toContain('Ajudo nutricionistas autônomas');
    expect(markdown).toContain('## Auditoria ética dos 7 princípios');
    expect(markdown).toContain('Reciprocidade');
    expect(markdown).toContain('R$');
  });
});

describe('T-ORG-07 · Revisão Semanal', () => {
  const revisao = {
    ...emptyRevisao('2026-09-07'),
    vitorias: ['Fechei a primeira venda', '', ''],
    prioridades_proxima: ['10 abordagens novas', '', ''],
    numeros: { contatos: 40, conversas: 12, propostas: 5, vendas: 1, receita: 1500 },
    numero_da_semana: 1,
    meta_da_semana: 5,
  };

  it('exige pelo menos 1 vitória e 1 prioridade', () => {
    expect(revisaoSemanalSchema.safeParse(revisao).success).toBe(true);
    expect(revisaoSemanalSchema.safeParse({ ...revisao, vitorias: ['', '', ''] }).success).toBe(false);
    expect(
      revisaoSemanalSchema.safeParse({ ...revisao, prioridades_proxima: ['', '', ''] }).success,
    ).toBe(false);
  });

  it('rejeita data fora do formato ISO', () => {
    expect(revisaoSemanalSchema.safeParse({ ...revisao, period_start: '07/09/2026' }).success).toBe(false);
  });

  it('pede o bloco Pivotar/Perseverar a cada 4ª revisão', () => {
    expect(requiresPivotBlock(1)).toBe(false);
    expect(requiresPivotBlock(4)).toBe(true);
    expect(requiresPivotBlock(8)).toBe(true);
    expect(requiresPivotBlock(9)).toBe(false);
  });

  it('a decisão do bloco pivotar precisa de motivo', () => {
    const semMotivo = revisaoSemanalSchema.safeParse({
      ...revisao,
      pivot: { decisao: 'pivotar', motivo: 'sei lá', proximo_experimento: '' },
    });
    expect(semMotivo.success).toBe(false);
  });

  it('conta o streak apenas de semanas consecutivas', () => {
    expect(computeStreak([])).toBe(0);
    expect(computeStreak(['2026-09-07'])).toBe(1);
    expect(computeStreak(['2026-08-24', '2026-08-31', '2026-09-07'])).toBe(3);
    expect(computeStreak(['2026-08-17', '2026-08-31', '2026-09-07'])).toBe(2);
  });

  it('renderiza a revisão em Markdown com os três blocos do ciclo AAA', () => {
    const markdown = renderRevisao(revisaoSemanalSchema.parse(revisao));
    expect(markdown).toContain('# Revisão da semana de 07/09/2026');
    expect(markdown).toContain('## Autoconhecimento');
    expect(markdown).toContain('## Análise');
    expect(markdown).toContain('## Ação');
  });
});
