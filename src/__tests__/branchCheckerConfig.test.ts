import * as core from '@actions/core';
import { loadBranchCheckerConfig, buildBranchCheckerSummary } from '../branchCheckerConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('loadBranchCheckerConfig', () => {
  it('loads defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadBranchCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.allowedPatterns).toEqual([]);
    expect(config.forbiddenPatterns).toEqual([]);
    expect(config.maxLength).toBe(0);
  });

  it('disables when branch_check_enabled is false', () => {
    setupInputs({ branch_check_enabled: 'false' });
    const config = loadBranchCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it('parses allowed patterns', () => {
    setupInputs({ branch_allowed_patterns: 'feature/.*, bugfix/.*' });
    const config = loadBranchCheckerConfig();
    expect(config.allowedPatterns).toEqual(['feature/.*', 'bugfix/.*']);
  });

  it('parses forbidden patterns', () => {
    setupInputs({ branch_forbidden_patterns: 'master, main' });
    const config = loadBranchCheckerConfig();
    expect(config.forbiddenPatterns).toEqual(['master', 'main']);
  });

  it('parses max length', () => {
    setupInputs({ branch_max_length: '60' });
    const config = loadBranchCheckerConfig();
    expect(config.maxLength).toBe(60);
  });

  it('defaults maxLength to 0 for invalid input', () => {
    setupInputs({ branch_max_length: 'abc' });
    const config = loadBranchCheckerConfig();
    expect(config.maxLength).toBe(0);
  });
});

describe('buildBranchCheckerSummary', () => {
  it('includes enabled status', () => {
    const summary = buildBranchCheckerSummary({
      enabled: true,
      allowedPatterns: [],
      forbiddenPatterns: [],
      maxLength: 0,
    });
    expect(summary).toContain('Enabled: true');
  });

  it('includes allowed and forbidden patterns when set', () => {
    const summary = buildBranchCheckerSummary({
      enabled: true,
      allowedPatterns: ['feature/.*'],
      forbiddenPatterns: ['master'],
      maxLength: 80,
    });
    expect(summary).toContain('feature/.*');
    expect(summary).toContain('master');
    expect(summary).toContain('Max length: 80');
  });

  it('omits optional fields when not set', () => {
    const summary = buildBranchCheckerSummary({
      enabled: false,
      allowedPatterns: [],
      forbiddenPatterns: [],
      maxLength: 0,
    });
    expect(summary).not.toContain('Allowed patterns');
    expect(summary).not.toContain('Forbidden patterns');
    expect(summary).not.toContain('Max length');
  });
});
