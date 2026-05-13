import * as core from '@actions/core';
import { loadDependencyCheckerConfig, buildDependencyCheckerSummary } from '../dependencyCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadDependencyCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads default values when no inputs provided', () => {
    setupInputs({});
    const config = loadDependencyCheckerConfig();
    expect(config.requireLockfileUpdate).toBe(true);
    expect(config.lockfilePatterns.length).toBeGreaterThan(0);
    expect(config.manifestPatterns.length).toBeGreaterThan(0);
  });

  it('disables check when input is false', () => {
    setupInputs({ dependency_require_lockfile_update: 'false' });
    const config = loadDependencyCheckerConfig();
    expect(config.requireLockfileUpdate).toBe(false);
  });

  it('parses custom lockfile patterns', () => {
    setupInputs({ dependency_lockfile_patterns: 'my-lock\.json,other\.lock' });
    const config = loadDependencyCheckerConfig();
    expect(config.lockfilePatterns).toEqual(['my-lock\.json', 'other\.lock']);
  });

  it('parses custom manifest patterns', () => {
    setupInputs({ dependency_manifest_patterns: 'deps\.txt' });
    const config = loadDependencyCheckerConfig();
    expect(config.manifestPatterns).toEqual(['deps\.txt']);
  });
});

describe('buildDependencyCheckerSummary', () => {
  it('includes all config fields in summary', () => {
    const config = {
      requireLockfileUpdate: true,
      lockfilePatterns: ['yarn\.lock'],
      manifestPatterns: ['package\.json'],
    };
    const summary = buildDependencyCheckerSummary(config);
    expect(summary).toContain('true');
    expect(summary).toContain('yarn\.lock');
    expect(summary).toContain('package\.json');
  });
});
