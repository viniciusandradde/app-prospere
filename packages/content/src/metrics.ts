import { missionById } from './missions';
import { WEEK_METRICS, type WeekMetric } from './types';

export interface CounterEntry {
  date: string;
  note: string;
}

export interface MissionCounterState {
  missionId: string;
  entries: CounterEntry[];
}

export type WeekNumbers = Record<WeekMetric, number>;

const emptyNumbers = (): WeekNumbers => ({ contatos: 0, conversas: 0, propostas: 0, vendas: 0 });

const addDays = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Números da semana derivados do que o usuário já registrou nas missões — ele não digita
 * duas vezes a mesma conversa. Só conta o que tem métrica declarada no catálogo; nada aqui
 * inventa número, e a Revisão Semanal continua editável por cima do que vier.
 */
export function numbersFromCounters(
  counters: MissionCounterState[],
  weekStart: string,
): WeekNumbers {
  const fim = addDays(weekStart, 7);
  const numeros = emptyNumbers();

  for (const { missionId, entries } of counters) {
    const metric = missionById.get(missionId)?.counter?.metric;
    if (!metric) continue;
    for (const entry of entries) {
      if (entry.date >= weekStart && entry.date < fim) numeros[metric] += 1;
    }
  }

  return numeros;
}

export { WEEK_METRICS };
export type { WeekMetric };
