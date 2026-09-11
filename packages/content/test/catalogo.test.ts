import { describe, expect, it } from 'vitest';
import boardJson from '../../../seed/board.negocio.json';
import {
  books,
  missions,
  missionById,
  phases,
  PHASE_IDS,
  PREREQUISITE_MISSION_IDS,
  RITUAL_MISSION_ID,
  tools,
  toolById,
} from '../src/index';

const board = boardJson as unknown as {
  missions_by_archetype: Record<string, string[]>;
  adjustments: Array<{ effects: Array<{ add_missions?: { ids: string[] } }> }>;
  mission_bindings: {
    tools: Record<string, string>;
    counters_only: string[];
    response_templates: string[];
    lists: string[];
    external_hints: Record<string, string>;
  };
};

describe('integridade do catálogo', () => {
  it('IDs de missão são únicos', () => {
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length);
  });

  it('toda missão pertence a uma fase existente', () => {
    for (const mission of missions) {
      expect(PHASE_IDS).toContain(mission.phaseId);
      expect(phases.some((p) => p.id === mission.phaseId)).toBe(true);
    }
  });

  it('toda missão tem objetivo, passos e resultado verificável', () => {
    for (const mission of missions) {
      expect(mission.objective.length).toBeGreaterThan(10);
      expect(mission.steps.length).toBeGreaterThanOrEqual(2);
      expect(mission.result.length).toBeGreaterThan(10);
      expect(mission.effortHours).toBeGreaterThan(0);
    }
  });

  it('pré-requisitos apontam para missões existentes', () => {
    for (const mission of missions) {
      for (const prerequisite of mission.prerequisites ?? []) {
        expect(missionById.has(prerequisite)).toBe(true);
      }
    }
  });

  it('cada tipo de missão traz o que a UI precisa renderizar', () => {
    for (const mission of missions) {
      if (mission.kind === 'template') expect(mission.template?.length).toBeGreaterThan(0);
      if (mission.kind === 'counter') expect(mission.counter?.target).toBeGreaterThan(0);
      if (mission.kind === 'tool') expect(toolById.has(mission.toolId!)).toBe(true);
      if (mission.kind === 'list') {
        expect(mission.list?.columns.length).toBeGreaterThan(1);
        expect(mission.list?.target).toBeGreaterThan(0);
      }
    }
  });

  it('IDs de ferramenta são únicos e as 3 do MVP estão presentes', () => {
    expect(tools.map((t) => t.id).sort()).toEqual(['T-ORG-07', 'T-PER-01', 'T-SON-03']);
    expect(new Set(tools.map((t) => t.slug)).size).toBe(tools.length);
  });

  it('livros citados são apenas os 7 publicados', () => {
    expect(books).toHaveLength(6);
    for (const book of books) {
      expect(book.authors.length).toBeGreaterThan(3);
      for (const phaseId of book.usedIn) expect(PHASE_IDS).toContain(phaseId);
    }
  });

  it('nenhum crédito cita e-book — só livros publicados', () => {
    const publicados = books.map((b) => b.title);
    for (const mission of missions) {
      if (!mission.credit) continue;
      expect(publicados.some((titulo) => mission.credit!.includes(titulo))).toBe(true);
    }
  });
});

describe('catálogo × board ativo', () => {
  const referenciadas = new Set<string>([
    ...Object.values(board.missions_by_archetype).flat(),
    ...board.adjustments.flatMap((a) => a.effects.flatMap((e) => e.add_missions?.ids ?? [])),
    ...PREREQUISITE_MISSION_IDS,
    RITUAL_MISSION_ID,
  ]);

  it('toda missão referenciada no board existe no catálogo', () => {
    for (const id of referenciadas) {
      expect(missionById.has(id), `missão ${id} ausente do catálogo`).toBe(true);
    }
  });

  it('o catálogo não carrega missão que o board não usa', () => {
    for (const mission of missions) {
      expect(referenciadas.has(mission.id), `missão ${mission.id} não referenciada`).toBe(true);
    }
  });

  it('os vínculos de ferramenta do board batem com o catálogo', () => {
    for (const [missionId, toolId] of Object.entries(board.mission_bindings.tools)) {
      expect(missionById.get(missionId)?.toolId).toBe(toolId);
    }
  });

  it('as missões marcadas como contador no board têm contador', () => {
    for (const missionId of board.mission_bindings.counters_only) {
      expect(missionById.get(missionId)?.counter).toBeDefined();
    }
  });

  it('toda missão guarda o próprio artefato no app', () => {
    for (const mission of missions) {
      const guardaArtefato =
        mission.kind === 'template' || mission.kind === 'list' || mission.kind === 'tool' || mission.kind === 'counter';
      expect(guardaArtefato, `${mission.id} não guarda artefato`).toBe(true);
    }
  });

  it('as dicas de ferramenta externa do board batem com o catálogo', () => {
    for (const missionId of Object.keys(board.mission_bindings.external_hints)) {
      expect(missionById.get(missionId)?.external).toBeTruthy();
    }
  });

  it('as missões marcadas como lista no board têm colunas', () => {
    for (const missionId of board.mission_bindings.lists) {
      expect(missionById.get(missionId)?.list?.columns.length).toBeGreaterThan(0);
    }
  });

  it('as missões de resposta guiada do board têm template', () => {
    for (const missionId of board.mission_bindings.response_templates) {
      expect(missionById.get(missionId)?.template?.length, missionId).toBeGreaterThan(0);
    }
  });
});
