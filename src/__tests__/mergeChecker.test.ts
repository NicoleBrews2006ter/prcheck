import { checkBaseBranch, checkMergeMethod, checkMerge, MergeCheckConfig } from '../mergeChecker';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

const defaultConfig: MergeCheckConfig = {
  allowedBaseBranches: ['main', 'develop'],
  allowedMergeMethods: ['squash', 'merge'],
  requireUpToDate: true,
  blockDraftMerge: true,
};

describe('checkBaseBranch', () => {
  it('returns true when branch is in allowed list', () => {
    expect(checkBaseBranch('main', ['main', 'develop'])).toBe(true);
  });

  it('returns false when branch is not allowed', () => {
    expect(checkBaseBranch('feature/x', ['main', 'develop'])).toBe(false);
  });

  it('supports wildcard patterns', () => {
    expect(checkBaseBranch('release/1.0', ['release/*'])).toBe(true);
  });

  it('returns true when allowed list is empty', () => {
    expect(checkBaseBranch('anything', [])).toBe(true);
  });
});

describe('checkMergeMethod', () => {
  it('returns true for allowed method', () => {
    expect(checkMergeMethod('squash', ['squash', 'merge'])).toBe(true);
  });

  it('returns false for disallowed method', () => {
    expect(checkMergeMethod('rebase', ['squash', 'merge'])).toBe(false);
  });

  it('returns true when list is empty', () => {
    expect(checkMergeMethod('rebase', [])).toBe(true);
  });
});

describe('checkMerge', () => {
  it('passes when all conditions are met', () => {
    const result = checkMerge('main', false, false, defaultConfig);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when base branch is not allowed', () => {
    const result = checkMerge('hotfix/x', false, false, defaultConfig);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('hotfix/x');
  });

  it('fails when PR is a draft and blockDraftMerge is true', () => {
    const result = checkMerge('main', true, false, defaultConfig);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('Draft');
  });

  it('adds warning when branch is behind and requireUpToDate is true', () => {
    const result = checkMerge('main', false, true, defaultConfig);
    expect(result.passed).toBe(true);
    expect(result.warnings[0]).toContain('behind');
  });

  it('does not warn about behind when requireUpToDate is false', () => {
    const cfg = { ...defaultConfig, requireUpToDate: false };
    const result = checkMerge('main', false, true, cfg);
    expect(result.warnings).toHaveLength(0);
  });
});
