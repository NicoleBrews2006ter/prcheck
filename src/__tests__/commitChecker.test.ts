import {
  checkCommits,
  buildConventionalCommitRegex,
  CommitInfo,
  CommitCheckerConfig,
} from '../commitChecker';

const baseConfig: CommitCheckerConfig = {
  conventionalCommits: false,
  maxCommits: null,
  requireSignedCommits: false,
};

const makeCommit = (message: string, verified = true): CommitInfo => ({
  message,
  verified,
});

describe('buildConventionalCommitRegex', () => {
  const regex = buildConventionalCommitRegex();

  it('matches valid conventional commit messages', () => {
    expect(regex.test('feat: add new feature')).toBe(true);
    expect(regex.test('fix(auth): resolve login bug')).toBe(true);
    expect(regex.test('chore!: drop support for Node 12')).toBe(false);
    expect(regex.test('docs(readme): update usage section')).toBe(true);
  });

  it('rejects invalid messages', () => {
    expect(regex.test('updated stuff')).toBe(false);
    expect(regex.test('WIP')).toBe(false);
    expect(regex.test('')).toBe(false);
  });
});

describe('checkCommits', () => {
  it('passes when all checks are disabled', () => {
    const result = checkCommits(
      [makeCommit('random commit message', false)],
      baseConfig
    );
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('fails when commit count exceeds max', () => {
    const commits = Array.from({ length: 6 }, (_, i) =>
      makeCommit(`feat: commit ${i}`)
    );
    const result = checkCommits(commits, { ...baseConfig, maxCommits: 5 });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/6 commits/);
  });

  it('fails when conventional commits are required but not followed', () => {
    const result = checkCommits(
      [makeCommit('updated stuff'), makeCommit('feat: valid commit')],
      { ...baseConfig, conventionalCommits: true }
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatch(/Commit 1/);
  });

  it('fails when signed commits are required but commit is unverified', () => {
    const result = checkCommits(
      [makeCommit('feat: something', false)],
      { ...baseConfig, requireSignedCommits: true }
    );
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/not signed/);
  });

  it('returns correct commit count', () => {
    const commits = [makeCommit('fix: a'), makeCommit('fix: b')];
    const result = checkCommits(commits, baseConfig);
    expect(result.commitCount).toBe(2);
  });
});
