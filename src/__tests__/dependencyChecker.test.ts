import { checkDependency, extractChangedManifests, extractChangedLockfiles } from '../dependencyChecker';

const defaultConfig = {
  requireLockfileUpdate: true,
  lockfilePatterns: ['package-lock\\.json', 'yarn\\.lock'],
  manifestPatterns: ['package\\.json'],
};

describe('extractChangedManifests', () => {
  it('returns matching manifest files', () => {
    const files = ['src/index.ts', 'package.json', 'README.md'];
    expect(extractChangedManifests(files, ['package\\.json'])).toEqual(['package.json']);
  });

  it('returns empty array when no manifests changed', () => {
    const files = ['src/index.ts'];
    expect(extractChangedManifests(files, ['package\\.json'])).toEqual([]);
  });
});

describe('extractChangedLockfiles', () => {
  it('returns matching lockfiles', () => {
    const files = ['package-lock.json', 'src/index.ts'];
    expect(extractChangedLockfiles(files, ['package-lock\\.json'])).toEqual(['package-lock.json']);
  });

  it('returns empty when no lockfiles changed', () => {
    const files = ['src/index.ts'];
    expect(extractChangedLockfiles(files, ['package-lock\\.json'])).toEqual([]);
  });
});

describe('checkDependency', () => {
  it('passes when check is disabled', () => {
    const result = checkDependency(
      { pull_request: { body: null }, changedFiles: ['package.json'] },
      { ...defaultConfig, requireLockfileUpdate: false }
    );
    expect(result.passed).toBe(true);
  });

  it('passes when no manifests changed', () => {
    const result = checkDependency(
      { pull_request: { body: null }, changedFiles: ['src/index.ts'] },
      defaultConfig
    );
    expect(result.passed).toBe(true);
  });

  it('fails when manifest changed but no lockfile updated', () => {
    const result = checkDependency(
      { pull_request: { body: null }, changedFiles: ['package.json'] },
      defaultConfig
    );
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('lockfile');
  });

  it('passes when both manifest and lockfile are updated', () => {
    const result = checkDependency(
      { pull_request: { body: null }, changedFiles: ['package.json', 'package-lock.json'] },
      defaultConfig
    );
    expect(result.passed).toBe(true);
    expect(result.summary).toContain('package-lock.json');
  });
});
