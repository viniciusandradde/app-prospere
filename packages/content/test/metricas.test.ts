import { describe, expect, it } from 'vitest';
import { missionById, numbersFromCounters, WEEK_METRICS } from '../src/index';

/**
 * Os números da Revisão Semanal saem do que o usuário já registrou nas missões —
 * ele não deve digitar duas vezes a mesma conversa.
 */
describe('números da semana a partir dos contadores', () => {
  const semana = '2026-09-07'; // segunda
  const registros = [
    { missionId: 'SON-01', entries: [{ date: '2026-09-07', note: 'Ana' }, { date: '2026-09-09', note: 'Júlia' }] },
    { missionId: 'ENG-02', entries: [{ date: '2026-09-10', note: 'Café com a Marina' }] },
    { missionId: 'PER-07', entries: [{ date: '2026-09-11', note: 'Proposta enviada' }] },
    { missionId: 'SON-04', entries: [{ date: '2026-09-12', note: 'Primeira pré-venda' }] },
  ];

  it('soma cada contador na métrica que ele representa', () => {
    const numeros = numbersFromCounters(registros, semana);
    expect(numeros.conversas).toBe(3); // 2 entrevistas + 1 conversa de venda
    expect(numeros.contatos).toBe(1);
    expect(numeros.vendas).toBe(1);
  });

  it('ignora registros fora da semana revisada', () => {
    const numeros = numbersFromCounters(
      [{ missionId: 'SON-01', entries: [{ date: '2026-09-06', note: 'domingo anterior' }, { date: '2026-09-14', note: 'semana seguinte' }] }],
      semana,
    );
    expect(numeros.conversas).toBe(0);
  });

  it('inclui os dois extremos da semana (segunda e domingo)', () => {
    const numeros = numbersFromCounters(
      [{ missionId: 'SON-01', entries: [{ date: '2026-09-07', note: 'segunda' }, { date: '2026-09-13', note: 'domingo' }] }],
      semana,
    );
    expect(numeros.conversas).toBe(2);
  });

  it('não inventa número: sem registro, tudo zero', () => {
    const numeros = numbersFromCounters([], semana);
    expect(numeros).toEqual({ contatos: 0, conversas: 0, propostas: 0, vendas: 0 });
  });

  it('ignora contador sem métrica declarada (rotina diária não é número da semana)', () => {
    const numeros = numbersFromCounters(
      [{ missionId: 'REN-02', entries: [{ date: '2026-09-08', note: '12 abordagens' }] }],
      semana,
    );
    expect(numeros).toEqual({ contatos: 0, conversas: 0, propostas: 0, vendas: 0 });
    expect(missionById.get('REN-02')?.counter?.metric).toBeUndefined();
  });

  it('toda métrica declarada no catálogo é uma métrica da revisão', () => {
    for (const mission of [...missionById.values()]) {
      if (!mission.counter?.metric) continue;
      expect(WEEK_METRICS).toContain(mission.counter.metric);
    }
  });
});
