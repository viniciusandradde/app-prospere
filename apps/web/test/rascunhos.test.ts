import { describe, expect, it } from 'vitest';
import {
  buildUserPrompt,
  parseDraft,
  SYSTEM_PROMPT,
  type DraftContext,
} from '../src/lib/ai/drafts';

const contexto: DraftContext = {
  archetype: 'A3',
  goal: { monthlyTarget: 10000, ticket: 500, salesPerWeek: 5 },
  situacao: { Produto: 'protótipo pronto', Vendas: 'nunca vendeu por conta própria' },
  respostas: [
    {
      missionId: 'RUM-04',
      titulo: 'Cliente ideal e dor',
      texto: 'Gestantes de primeira viagem, 28 a 38 anos, com medo de ganhar peso demais.',
    },
  ],
};

describe('prompt do rascunho', () => {
  it('leva os dados reais da pessoa para a IA', () => {
    const prompt = buildUserPrompt('oferta.promessa', contexto);
    expect(prompt).toContain('Gestantes de primeira viagem');
    expect(prompt).toContain('R$ 10000 por mês');
    expect(prompt).toContain('nunca vendeu por conta própria');
  });

  it('proíbe inventar número e resultado no system prompt', () => {
    expect(SYSTEM_PROMPT).toContain('Não invente número');
    expect(SYSTEM_PROMPT).toContain('Não prometa resultado garantido');
    expect(SYSTEM_PROMPT).toContain('rascunho');
  });

  it('descreve o formato de saída de cada alvo', () => {
    expect(buildUserPrompt('oferta.beneficios', contexto)).toContain('"emocionais"');
    expect(buildUserPrompt('oferta.objecoes', contexto)).toContain('"objecoes"');
    expect(buildUserPrompt('quadro.hipotese', contexto)).toContain('"criterio_sucesso"');
  });

  it('lista as seções quando o alvo é uma missão de resposta guiada', () => {
    const prompt = buildUserPrompt('missao.template', {
      ...contexto,
      secoes: [{ id: 'gancho', label: 'Gancho', hint: 'Pergunta, número ou história' }],
    });
    expect(prompt).toContain('id "gancho"');
    expect(prompt).toContain('Pergunta, número ou história');
  });

  it('não vaza dados que não foram passados', () => {
    const prompt = buildUserPrompt('oferta.promessa', { ...contexto, respostas: [] });
    expect(prompt).not.toContain('Gestantes');
  });
});

describe('leitura da resposta da IA', () => {
  it('aceita JSON puro', () => {
    const r = parseDraft('oferta.promessa', '{"cliente":"gestantes","resultado":"comer bem","obstaculo":"passar fome"}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.cliente).toBe('gestantes');
  });

  it('aceita JSON dentro de cercas de código', () => {
    const r = parseDraft(
      'quadro.hipotese',
      '```json\n{"hipotese":"Gestantes pagam R$ 500 por acompanhamento de 8 semanas","metrica":"pré-vendas","criterio_sucesso":"3 em 14 dias"}\n```',
    );
    expect(r.ok).toBe(true);
  });

  it('aceita JSON com texto em volta', () => {
    const r = parseDraft('oferta.promessa', 'Claro! {"cliente":"gestantes","resultado":"comer bem","obstaculo":"dieta"} Espero ter ajudado.');
    expect(r.ok).toBe(true);
  });

  it('rejeita resposta sem JSON', () => {
    const r = parseDraft('oferta.promessa', 'Desculpe, não posso ajudar com isso.');
    expect(r.ok).toBe(false);
  });

  it('rejeita JSON quebrado', () => {
    const r = parseDraft('oferta.promessa', '{"cliente": "gestantes",,}');
    expect(r.ok).toBe(false);
  });

  it('rejeita rascunho fora do formato — menos de 3 objeções não passa', () => {
    const r = parseDraft(
      'oferta.objecoes',
      '{"objecoes":[{"objecao":"Está caro","resposta":"Sim, e é por isso que parcelo em 8x"}]}',
    );
    expect(r.ok).toBe(false);
  });

  it('aceita 3 objeções completas e preenche prova vazia', () => {
    const r = parseDraft(
      'oferta.objecoes',
      JSON.stringify({
        objecoes: [
          { objecao: 'Está caro', resposta: 'Sim, e é por isso que divido em 8 semanas.' },
          { objecao: 'Não sei se funciona', resposta: 'Sim, e a garantia cobre as 2 primeiras semanas.' },
          { objecao: 'Não é o momento', resposta: 'Sim, e o próximo mês custa o mesmo.' },
        ],
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.objecoes[0]?.prova).toBe('');
  });

  it('exige exatamente 3 benefícios de cada tipo', () => {
    expect(parseDraft('oferta.beneficios', '{"emocionais":["a","bb","ccc"],"praticos":["ddd","eee"]}').ok).toBe(false);
  });
});
