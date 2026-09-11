import { describe, expect, it } from 'vitest';
import { missionById } from '@prospere/content';
import {
  board,
  decomposeGoal,
  generateTrail,
  resolveArchetype,
  type BoardAnswers,
  type TrailResult,
} from '../src/index';

/** Camila (A3): nutricionista, protótipo, nunca vendeu, 900 seguidores, 10–20 h/semana. */
const camila: BoardAnswers = {
  q01: 'A3',
  q02: 'primeiras_vendas',
  q03: { valor: 10000, ticket: 500, prazo_meses: 6 },
  q04: 'prototipo',
  q05: 'nunca_vendi',
  q06: 500,
  q07: 15,
};

/** Marcos (A4): oficina em operação, clientes pagantes, vende com regularidade. */
const marcos: BoardAnswers = {
  q01: 'A4',
  q02: 'crescer_faturamento',
  q03: { valor: 60000, ticket: 1200, prazo_meses: 12 },
  q04: 'validado_pagantes',
  q05: 'vendo_regular',
  q06: 5000,
  q07: 15,
};

const trail = (answers: BoardAnswers): TrailResult => {
  const result = generateTrail(answers);
  if (result.kind !== 'trail') throw new Error('esperava uma trilha, veio um gate');
  return result;
};

const ids = (answers: BoardAnswers): string[] => trail(answers).missions.map((m) => m.id);

describe('determinismo', () => {
  it('mesma entrada produz exatamente a mesma saída', () => {
    expect(generateTrail(camila)).toEqual(generateTrail(camila));
    expect(generateTrail(marcos)).toEqual(generateTrail(marcos));
  });

  it('rejeita respostas incompletas em vez de adivinhar', () => {
    expect(() => generateTrail({ q01: 'A3' })).toThrow();
  });
});

describe('gates de fora de escopo', () => {
  it('empresa acima de R$ 1 mi/ano vai para a lista de espera Escalar', () => {
    const result = generateTrail({ ...camila, q01: 'OUT_ESCALAR' });
    expect(result.kind).toBe('gate');
    if (result.kind !== 'gate') return;
    expect(result.gate.edition).toBe('escalar');
    expect(result.gate.message).toContain('Escalar');
  });

  it('quem quer renda extra sem negócio vai para a lista de espera Pessoal', () => {
    const result = generateTrail({ ...camila, q01: 'OUT_PESSOAL' });
    expect(result.kind).toBe('gate');
    if (result.kind !== 'gate') return;
    expect(result.gate.edition).toBe('pessoal');
  });
});

describe('arquétipo', () => {
  it('A3 declarado continua A3', () => {
    expect(trail(camila).archetype).toBe('A3');
  });

  it('ARC-VALIDATED: quem se diz A3 mas já tem clientes pagantes é tratado como A4', () => {
    const answers: BoardAnswers = { ...camila, q04: 'validado_pagantes' };
    expect(resolveArchetype(answers)).toBe('A4');
    expect(trail(answers).archetype).toBe('A4');
  });
});

describe('trilha base por arquétipo', () => {
  it('A3 recebe as 18 missões base (entrevistas, MVP e seed launch inclusos)', () => {
    const base = trail({ ...camila, q04: 'ideia', q05: 'vendi_pouco' });
    expect(base.missions.filter((m) => !m.optional)).toHaveLength(18);
    expect(ids({ ...camila, q04: 'ideia', q05: 'vendi_pouco' })).toEqual(
      expect.arrayContaining(['SON-01', 'SON-02', 'SON-04']),
    );
  });

  it('A4 recebe 15 missões base e não repete a validação inicial', () => {
    const base = trail(marcos);
    expect(base.missions.filter((m) => !m.optional)).toHaveLength(15);
    expect(base.missions.map((m) => m.id)).not.toContain('SON-04');
  });

  it('toda missão da trilha existe no catálogo e tem resultado verificável', () => {
    for (const mission of trail(camila).missions) {
      expect(missionById.has(mission.id)).toBe(true);
      expect(mission.result.length).toBeGreaterThan(10);
    }
  });
});

describe('ajustes automáticos', () => {
  it('ADJ-NOIDEA: sem ideia entram Mapa de Forças e modelo de renda antes do cliente ideal', () => {
    const lista = ids({ ...camila, q04: 'sem_ideia' });
    expect(lista).toContain('RUM-02');
    expect(lista).toContain('RUM-03');
    expect(lista.indexOf('RUM-02')).toBeLessThan(lista.indexOf('RUM-04'));
    expect(lista.indexOf('RUM-03')).toBeLessThan(lista.indexOf('RUM-04'));
  });

  it('ADJ-A4-NEW-OFFER: operador com oferta nova valida antes do experimento', () => {
    const answers: BoardAnswers = { ...marcos, q04: 'ideia' };
    const lista = ids(answers);
    expect(lista).toContain('SON-01');
    expect(lista).toContain('SON-02');
    expect(lista.indexOf('SON-01')).toBeLessThan(lista.indexOf('SON-03'));
    expect(trail(answers).adjustments.map((a) => a.id)).toContain('ADJ-A4-NEW-OFFER');
  });

  it('ADJ-NOSALES: quem nunca vendeu treina script e objeções antes das 5 conversas', () => {
    const lista = ids(camila);
    expect(lista.indexOf('PER-05')).toBeLessThan(lista.indexOf('PER-07'));
    expect(lista.indexOf('PER-06')).toBeLessThan(lista.indexOf('PER-07'));
  });

  it('ADJ-SALESTEAM: com time de vendas entra o playbook depois da rotina diária', () => {
    const lista = ids({ ...marcos, q05: 'time_de_vendas' });
    expect(lista.indexOf('REN-09')).toBeGreaterThan(lista.indexOf('REN-02'));
  });

  it('ADJ-AUDIENCE: audiência de 1.000+ torna o lançamento interno', () => {
    expect(trail({ ...marcos, q06: 5000 }).launchKind).toBe('internal');
    expect(trail({ ...marcos, q06: 5000 }).explanation.launchKind).toContain('interno');
  });

  it('ADJ-NO-AUDIENCE: audiência pequena mantém o lançamento semente', () => {
    expect(trail({ ...camila, q06: 50 }).launchKind).toBe('seed');
    expect(trail({ ...camila, q06: 50 }).explanation.launchKind).toContain('semente');
  });

  it('ADJ-LOWTIME: menos de 5 h/semana liga o modo essencial e estende o calendário', () => {
    const curto = trail({ ...camila, q07: 3 });
    const normal = trail(camila);
    expect(curto.essentialMode).toBe(true);
    expect(curto.estimate.weeks).toBeGreaterThan(normal.estimate.weeks);
  });

  it('nenhum ajuste dispara sem a condição correspondente', () => {
    const semAjustes = trail({ ...marcos, q04: 'validado_pagantes', q05: 'vendo_regular', q06: 5000 });
    expect(semAjustes.adjustments.map((a) => a.id)).toEqual(['ADJ-AUDIENCE']);
  });
});

describe('combinações citadas no PRD (N-03)', () => {
  it('A3 sem ideia e que nunca vendeu acumula os dois ajustes', () => {
    const answers: BoardAnswers = { ...camila, q04: 'sem_ideia', q05: 'nunca_vendi' };
    const aplicados = trail(answers).adjustments.map((a) => a.id);
    expect(aplicados).toContain('ADJ-NOIDEA');
    expect(aplicados).toContain('ADJ-NOSALES');
    expect(trail(answers).missions.filter((m) => m.optional)).toHaveLength(4);
  });

  it('A4 com ideia e pouco tempo combina validação e modo essencial', () => {
    const answers: BoardAnswers = { ...marcos, q04: 'ideia', q07: 3 };
    const resultado = trail(answers);
    expect(resultado.archetype).toBe('A4');
    expect(resultado.essentialMode).toBe(true);
    expect(resultado.missions.map((m) => m.id)).toContain('SON-01');
  });
});

describe('meta decomposta (N-04)', () => {
  it('calcula vendas e contatos por semana com a conversão de referência', () => {
    const goal = decomposeGoal(camila);
    // 10.000 / 500 = 20 vendas/mês ÷ 4,33 semanas = 4,6 → 5 vendas/semana
    expect(goal.salesPerWeek).toBe(5);
    expect(goal.contactsPerWeek).toBe(100);
    expect(goal.assumedConversion).toBe(0.05);
    expect(goal.metricName).toBe('vendas no mês');
  });

  it('leva os números para a explicação', () => {
    expect(trail(camila).explanation.goal).toContain('5 vendas por semana');
    expect(trail(camila).explanation.goal).toContain('100 contatos');
  });
});

describe('fases e estimativa', () => {
  it('mantém a ordem das fases do board e inclui os pré-requisitos', () => {
    const resultado = trail(camila);
    expect(resultado.phases.map((p) => p.id)).toEqual(['PRQ', 'RUM', 'SON', 'PER', 'ENG', 'REN']);
    expect(resultado.phases[0]?.missionIds).toEqual(['PRE-01', 'ORG-06', 'ORG-09', 'ORG-08']);
  });

  it('estima o esforço na faixa prevista no PRD (A4 ≈ 70 h, A3 ≈ 87 h)', () => {
    expect(trail(marcos).estimate.totalHours).toBeGreaterThanOrEqual(65);
    expect(trail(marcos).estimate.totalHours).toBeLessThanOrEqual(75);
    const a3 = trail({ ...camila, q04: 'ideia', q05: 'vendi_pouco' });
    expect(a3.estimate.totalHours).toBeGreaterThanOrEqual(82);
    expect(a3.estimate.totalHours).toBeLessThanOrEqual(92);
  });

  it('mais horas por semana encurtam o calendário', () => {
    expect(trail({ ...marcos, q07: 30 }).estimate.weeks).toBeLessThan(
      trail({ ...marcos, q07: 7 }).estimate.weeks,
    );
  });

  it('REN-* dependem de ORG-09 (conta separada e caixa)', () => {
    for (const mission of trail(marcos).missions.filter((m) => m.phaseId === 'REN')) {
      if (mission.id === 'REN-06') expect(mission.blockedBy).toContain('REN-04');
      else expect(mission.blockedBy).toContain('ORG-09');
    }
  });
});

describe('explicação (regras disparadas viram texto)', () => {
  it('traz intro do arquétipo, meta e o porquê de cada ajuste', () => {
    const { explanation } = trail(camila);
    expect(explanation.intro).toContain('Fundador');
    expect(explanation.adjustments.length).toBeGreaterThan(0);
    for (const adjustment of explanation.adjustments) {
      expect(adjustment.why.length).toBeGreaterThan(10);
    }
  });

  it('usa a versão do board declarada no seed', () => {
    expect(trail(camila).boardVersion).toBe(board.board_version);
  });
});
