import * as core from '@actions/core';
import {
  loadDiffCheckerConfig,
  buildDiffCheckerSummary,
} from '../diffCheckerConfig';
import { DiffCheckerConfig } from '../diffChecker';

function setupInputs(inputs: Record<string, string>): void {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

describe('loadDiffCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns nulls and empty arrays when no inputs provided', () => {
    setupInputs({});
    const config = loadDiffCheckerConfig();
    expect(config.maxAdditions).toBeNull();
    expect(config.maxDeletions).toBeNull();
    expect(config.maxChangedFiles).toBeNull();
    expect(config.ignorePaths).toEqual([]);
  });

  it('parses numeric limits correctly', () => {
    setupInputs({
      diff_max_additions: '200',
      diff_max_deletions: '100',
      diff_max_changed_files: '15',
    });
    const config = loadDiffCheckerConfig();
    expect(config.maxAdditions).toBe(200);
    expect(config.maxDeletions).toBe(100);
    expect(config.maxChangedFiles).toBe(15);
  });

  it('parses ignore paths as comma-separated list', () => {
    setupInputs({ diff_ignore_paths: 'docs/, tests/, .github/' });
    const config = loadDiffCheckerConfig();
    expect(config.ignorePaths).toEqual(['docs/', 'tests/', '.github/']);
  });

  it('returns null for non-numeric limit inputs', () => {
    setupInputs({ diff_max_additions: 'abc' });
    const config = loadDiffCheckerConfig();
    expect(config.maxAdditions).toBeNull();
  });
});

describe('buildDiffCheckerSummary', () => {
  it('includes configured limits in summary', () => {
    const config: DiffCheckerConfig = {
      maxAdditions: 300,
      maxDeletions: 150,
      maxChangedFiles: 20,
      ignorePaths: ['docs/'],
    };
    const summary = buildDiffCheckerSummary(config);
    expect(summary).toContain('Max additions: 300');
    expect(summary).toContain('Max deletions: 150');
    expect(summary).toContain('Max changed files: 20');
    expect(summary).toContain('Ignored paths: docs/');
  });

  it('omits null limits from summary', () => {
    const config: DiffCheckerConfig = {
      maxAdditions: null,
      maxDeletions: null,
      maxChangedFiles: null,
      ignorePaths: [],
    };
    const summary = buildDiffCheckerSummary(config);
    expect(summary).not.toContain('Max additions');
    expect(summary).not.toContain('Max deletions');
    expect(summary).not.toContain('Ignored paths');
  });
});
