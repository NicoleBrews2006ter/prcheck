import { checkProject, extractProjectCards, ProjectCard, ProjectCheckerConfig } from '../projectChecker';

const makeCard = (projectName: string, columnName: string): ProjectCard => ({
  project: { name: projectName },
  column: { name: columnName },
});

const baseConfig: ProjectCheckerConfig = {
  requireProject: true,
  allowedProjects: [],
  allowedColumns: [],
};

describe('extractProjectCards', () => {
  it('returns empty array when no project_cards present', () => {
    expect(extractProjectCards({})).toEqual([]);
  });

  it('returns empty array when project_cards is not an array', () => {
    const ctx = { payload: { pull_request: { project_cards: null } } };
    expect(extractProjectCards(ctx)).toEqual([]);
  });

  it('returns cards from context', () => {
    const cards = [makeCard('My Project', 'In Progress')];
    const ctx = { payload: { pull_request: { project_cards: cards } } };
    expect(extractProjectCards(ctx)).toEqual(cards);
  });
});

describe('checkProject', () => {
  it('passes when requireProject is false', () => {
    const result = checkProject([], { ...baseConfig, requireProject: false });
    expect(result.passed).toBe(true);
  });

  it('fails when requireProject is true and no cards', () => {
    const result = checkProject([], baseConfig);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not assigned to any project/);
  });

  it('passes when card is present with no restrictions', () => {
    const result = checkProject([makeCard('Any Project', 'Todo')], baseConfig);
    expect(result.passed).toBe(true);
  });

  it('fails when project name not in allowedProjects', () => {
    const config = { ...baseConfig, allowedProjects: ['Alpha', 'Beta'] };
    const result = checkProject([makeCard('Gamma', 'Todo')], config);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Alpha, Beta/);
  });

  it('passes when project name is in allowedProjects', () => {
    const config = { ...baseConfig, allowedProjects: ['Alpha', 'Beta'] };
    const result = checkProject([makeCard('Beta', 'Todo')], config);
    expect(result.passed).toBe(true);
  });

  it('fails when column not in allowedColumns', () => {
    const config = { ...baseConfig, allowedColumns: ['In Progress', 'Review'] };
    const result = checkProject([makeCard('My Project', 'Done')], config);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/In Progress, Review/);
  });

  it('passes when column is in allowedColumns', () => {
    const config = { ...baseConfig, allowedColumns: ['In Progress', 'Review'] };
    const result = checkProject([makeCard('My Project', 'Review')], config);
    expect(result.passed).toBe(true);
  });

  it('passes when both project and column match restrictions', () => {
    const config = {
      ...baseConfig,
      allowedProjects: ['Sprint 1'],
      allowedColumns: ['In Progress'],
    };
    const result = checkProject([makeCard('Sprint 1', 'In Progress')], config);
    expect(result.passed).toBe(true);
  });
});
