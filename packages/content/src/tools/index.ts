import type { Tool, ToolId } from '../types';
import { quadroCmaTool } from './quadro-cma';
import { construtorOfertaTool } from './construtor-oferta';
import { revisaoSemanalTool } from './revisao-semanal';

export * from './quadro-cma';
export * from './construtor-oferta';
export * from './revisao-semanal';

/** As 3 ferramentas do MVP. As outras 51 esperam demanda comprovada (PRD Negócio, seção 4). */
export const tools: Tool[] = [quadroCmaTool, construtorOfertaTool, revisaoSemanalTool];

export const toolById = new Map<ToolId, Tool>(tools.map((t) => [t.id, t]));
export const toolBySlug = new Map<string, Tool>(tools.map((t) => [t.slug, t]));
