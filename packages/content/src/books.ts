import type { Book } from './types';

/**
 * Apenas livros publicados são citados no produto. Os e-books do bundle viraram conteúdo
 * próprio, sem menção (CLAUDE.md, regras de conteúdo).
 */
export const books: Book[] = [
  {
    id: 'walker-formula-lancamento',
    title: 'A Fórmula do Lançamento',
    authors: 'Jeff Walker',
    thesis:
      'Vender por uma sequência de conteúdo que conversa com o público antes de pedir a compra, em vez de uma página de vendas isolada.',
    usedIn: ['SON', 'PER', 'ENG', 'REN'],
  },
  {
    id: 'ries-startup-enxuta',
    title: 'A Startup Enxuta',
    authors: 'Eric Ries',
    thesis:
      'Progresso é aprendizagem validada: construir, medir e aprender no menor ciclo possível antes de escalar.',
    usedIn: ['RUM', 'SON'],
  },
  {
    id: 'sharot-mente-influente',
    title: 'A Mente Influente',
    authors: 'Tali Sharot',
    thesis:
      'Dados raramente mudam crenças: emoção, incentivo, senso de controle e curiosidade movem mais que argumento.',
    usedIn: ['PER'],
  },
  {
    id: 'cialdini-armas-persuasao',
    title: 'As Armas da Persuasão 2.0',
    authors: 'Robert Cialdini',
    thesis:
      'Sete princípios explicam o sim — e só funcionam a longo prazo quando são verdadeiros.',
    usedIn: ['PER', 'ENG', 'REN'],
  },
  {
    id: 'ferrazzi-nunca-almoce-sozinho',
    title: 'Nunca Almoce Sozinho',
    authors: 'Keith Ferrazzi',
    thesis:
      'Generosidade sem placar: construir a rede antes de precisar dela e ajudar primeiro.',
    usedIn: ['ENG'],
  },
  {
    id: 'willink-babin-responsabilidade-extrema',
    title: 'Responsabilidade Extrema',
    authors: 'Jocko Willink e Leif Babin',
    thesis:
      'Responsabilidade total pelo resultado; priorizar e agir em um problema por vez; disciplina é liberdade.',
    usedIn: ['PRQ'],
  },
];
