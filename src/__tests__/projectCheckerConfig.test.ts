import { loadProjectCheckerConfig, buildProjectCheckerSummary } from '../projectCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  const originalGetInput = jest.requireActual('@actions/core').getInput;
  jest.spyOn(require('@actions/core'), 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

jest.mock('@actions/core');

describe('loadProjectCheckerConfig', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadProjectCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.requireProject).toBe(false);
    expect(config.allowedProjects).toEqual([]);
  });

  it('disables checker when project_check_enabled is false', () => {
    setupInputs({ project_check_enabled: 'false' });
    const config = loadProjectCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it('enables requireProject when project_require is true', () => {
    setupInputs({ project_require: 'true' });
    const config = loadProjectCheckerConfig();
    expect(config.requireProject).toBe(true);
  });

  it('parses allowed projects from comma-separated input', () => {
    setupInputs({ project_allowed: 'Alpha, Beta, Gamma' });
    const config = loadProjectCheckerConfig();
    expect(config.allowedProjects).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('filters empty entries from allowed projects', () => {
    setupInputs({ project_allowed: 'Alpha,,Beta,' });
    const config = loadProjectCheckerConfig();
    expect(config.allowedProjects).toEqual(['Alpha', 'Beta']);
  });
});

describe('buildProjectCheckerSummary', () => {
  it('includes enabled and requireProject flags', () => {
    const summary = buildProjectCheckerSummary({
      enabled: true,
      requireProject: true,
      allowedProjects: [],
    });
    expect(summary).toContain('Enabled: true');
    expect(summary).toContain('Require Project: true');
    expect(summary).toContain('(any)');
  });

  it('lists allowed projects when provided', () => {
    const summary = buildProjectCheckerSummary({
      enabled: true,
      requireProject: false,
      allowedProjects: ['Alpha', 'Beta'],
    });
    expect(summary).toContain('Alpha, Beta');
    expect(summary).not.toContain('(any)');
  });

  it('shows (any) when allowedProjects is empty', () => {
    const summary = buildProjectCheckerSummary({
      enabled: false,
      requireProject: false,
      allowedProjects: [],
    });
    expect(summary).toContain('(any)');
  });
});
