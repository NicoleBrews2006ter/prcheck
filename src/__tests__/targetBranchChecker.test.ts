import {
  buildTargetBranchRegex,
  checkTargetBranch,
  TargetBranchCheckerConfig,
  TargetBranchContext,
} from '../targetBranchChecker';

function makeContext(branch: string): TargetBranchContext {
  return { pull_request: { base: { ref: branch } } };
}

const baseConfig: TargetBranchCheckerConfig = {
  enabled: true,
  allowedBranches: [],
  blockedBranches: [],
};

describe('buildTargetBranchRegex', () => {
  it('matches exact branch names', () => {
    expect(buildTargetBranchRegex('main').test('main')).toBe(true);
    expect(buildTargetBranchRegex('main').test('main2')).toBe(false);
  });

  it('supports wildcard patterns', () => {
    expect(buildTargetBranchRegex('release/*').test('release/1.0')).toBe(true);
    expect(buildTargetBranchRegex('release/*').test('hotfix/1.0')).toBe(false);
  });
});

describe('checkTargetBranch', () => {
  it('passes when check is disabled', () => {
    const result = checkTargetBranch(makeContext('anything'), {
      ...baseConfig,
      enabled: false,
    });
    expect(result.passed).toBe(true);
  });

  it('passes when no restrictions are set', () => {
    const result = checkTargetBranch(makeContext('main'), baseConfig);
    expect(result.passed).toBe(true);
  });

  it('fails when targeting a blocked branch', () => {
    const result = checkTargetBranch(makeContext('main'), {
      ...baseConfig,
      blockedBranches: ['main'],
    });
    expect(result.passed).toBe(false);
    expect(result.message).toContain('blocked branch');
  });

  it('passes when branch is not blocked', () => {
    const result = checkTargetBranch(makeContext('develop'), {
      ...baseConfig,
      blockedBranches: ['main'],
    });
    expect(result.passed).toBe(true);
  });

  it('passes when branch matches allowed list', () => {
    const result = checkTargetBranch(makeContext('develop'), {
      ...baseConfig,
      allowedBranches: ['main', 'develop'],
    });
    expect(result.passed).toBe(true);
  });

  it('fails when branch is not in allowed list', () => {
    const result = checkTargetBranch(makeContext('feature/foo'), {
      ...baseConfig,
      allowedBranches: ['main', 'develop'],
    });
    expect(result.passed).toBe(false);
    expect(result.message).toContain('not in the allowed list');
  });

  it('blocked check takes precedence over allowed list', () => {
    const result = checkTargetBranch(makeContext('main'), {
      ...baseConfig,
      allowedBranches: ['main'],
      blockedBranches: ['main'],
    });
    expect(result.passed).toBe(false);
    expect(result.message).toContain('blocked branch');
  });

  it('supports wildcard patterns in allowed branches', () => {
    const result = checkTargetBranch(makeContext('release/2.0'), {
      ...baseConfig,
      allowedBranches: ['main', 'release/*'],
    });
    expect(result.passed).toBe(true);
  });
});
