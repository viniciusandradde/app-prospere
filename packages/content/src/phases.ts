import type { Phase } from './types';

/** As 5 fases do MVP + o bloco de pré-requisitos (`docs/04-PRD-MVP-NEGOCIO.md`, seção 7). */
export const phases: Phase[] = [
  {
    id: 'PRQ',
    position: 0,
    name: 'Pré-requisitos',
    question: 'A base mínima está de pé?',
    objective:
      'Assumir responsabilidade, proteger 3 prioridades por dia e separar o dinheiro do negócio. Não bloqueia a trilha — bloqueia apenas Rentabilizar.',
    credit: 'Responsabilidade Extrema (Willink & Babin)',
  },
  {
    id: 'RUM',
    position: 1,
    name: 'Rumar',
    question: 'Para onde vou e por qual caminho?',
    objective:
      'Transformar desejo em meta numérica com prazo, saber para quem se vende e escrever as duas apostas que precisam de prova.',
    credit: 'A Startup Enxuta (Ries)',
  },
  {
    id: 'SON',
    position: 2,
    name: 'Sondar',
    question: 'Alguém paga por isso?',
    objective:
      'Provar ou derrubar a hipótese de valor com o menor experimento possível, antes de construir o produto completo.',
    credit: 'A Startup Enxuta (Ries) · A Fórmula do Lançamento (Walker)',
  },
  {
    id: 'PER',
    position: 3,
    name: 'Persuadir',
    question: 'Minha oferta e minha mensagem convencem?',
    objective:
      'Construir uma oferta com valor percebido acima do preço e medir a conversão de conversas reais — sempre com gatilhos verdadeiros.',
    credit: 'As Armas da Persuasão 2.0 (Cialdini) · A Mente Influente (Sharot)',
  },
  {
    id: 'ENG',
    position: 4,
    name: 'Engajar',
    question: 'Quem me conhece, confia e me indica?',
    objective:
      'Construir a rede de forma generosa e sistemática e transformar atenção em lista própria.',
    credit: 'Nunca Almoce Sozinho (Ferrazzi)',
  },
  {
    id: 'REN',
    position: 5,
    name: 'Rentabilizar',
    question: 'Estou vendendo todos os dias — e lançando?',
    objective:
      'Instalar a rotina diária de vendas com números e executar um lançamento do começo ao fim.',
    credit: 'A Fórmula do Lançamento (Walker)',
  },
];

export const phaseById = new Map(phases.map((p) => [p.id, p]));
