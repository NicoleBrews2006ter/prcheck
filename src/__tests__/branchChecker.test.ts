import { checkBranchName, buildBranchRegex, BranchCheckerConfig } from '../branchChecker';

const baseConfig: BranchCheckerConfig = {
  enabled: true,
  allowedPatterns: [],
  forbiddenPatterns: [],
  maxLength: 0,
};

describe('buildBranchRegex', () => {
  it('builds a regex from a pattern', () => {
    const regex = buildBranchRegex('feature/.*');
    expect(regex.test('feature/my-feature')).toBe(true);
    expect(regex.test('bugfix/my-bug')).toBe(false);
  });
});

describe('checkBranchName', () => {
  it('passes when disabled', () => {
    const result = checkBranchName('anything', { ...baseConfig, enabled: false });
    expect(result.passed).toBe(true);
  });

  it('passes a valid branch with no constraints', () => {
    const result = checkBranchName('feature/my-feature', baseConfig);
    expect(result.passed).toBe(true);
  });

  it('fails when branch exceeds max length', () => {
    const result = checkBranchName('feature/this-is-a-very-long-branch-name', {
      ...baseConfig,
      maxLength: 20,
    });
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('exceeds max length');
  });

  it('passes when branch is within max length', () => {
    const result = checkBranchName('feat/short', { ...baseConfig, maxLength: 50 });
    expect(result.passed).toBe(true);
  });

  it('fails when branch matches a forbidden pattern', () => {
    const result = checkBranchName('master', {
      ...baseConfig,
      forbiddenPatterns: ['master', 'main'],
    });
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('forbidden pattern');
  });

  it('fails when branch does not match any allowed pattern', () => {
    const result = checkBranchName('random-branch', {
      ...baseConfig,
      allowedPatterns: ['feature/.*', 'bugfix/.*', 'hotfix/.*'],
    });
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('does not match any allowed pattern');
  });

  it('passes when branch matches an allowed pattern', () => {
    const result = checkBranchName('feature/my-feature', {
      ...baseConfig,
      allowedPatterns: ['feature/.*', 'bugfix/.*'],
    });
    expect(result.passed).toBe(true);
  });

  it('accumulates multiple errors', () => {
    const result = checkBranchName('x', {
      enabled: true,
      allowedPatterns: ['feature/.*'],
      forbiddenPatterns: ['x'],
      maxLength: 0,
    });
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('forbidden pattern');
    expect(result.summary).toContain('does not match any allowed pattern');
  });
});
