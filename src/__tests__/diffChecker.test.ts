import { checkDiff, DiffCheckerConfig, DiffMetrics } from '../diffChecker';

const defaultConfig: DiffCheckerConfig = {
  maxAdditions: null,
  maxDeletions: null,
  maxChangedFiles: null,
  ignorePaths: [],
};

const defaultMetrics: DiffMetrics = {
  additions: 50,
  deletions: 20,
  changedFiles: 5,
};

describe('checkDiff', () => {
  it('passes when no limits are configured', () => {
    const result = checkDiff(defaultMetrics, defaultConfig);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('passes when metrics are within limits', () => {
    const config: DiffCheckerConfig = {
      ...defaultConfig,
      maxAdditions: 100,
      maxDeletions: 50,
      maxChangedFiles: 10,
    };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('fails when additions exceed limit', () => {
    const config: DiffCheckerConfig = { ...defaultConfig, maxAdditions: 30 };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatch(/Additions \(50\)/);
  });

  it('fails when deletions exceed limit', () => {
    const config: DiffCheckerConfig = { ...defaultConfig, maxDeletions: 10 };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/Deletions \(20\)/);
  });

  it('fails when changed files exceed limit', () => {
    const config: DiffCheckerConfig = { ...defaultConfig, maxChangedFiles: 3 };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/Changed files \(5\)/);
  });

  it('reports multiple violations', () => {
    const config: DiffCheckerConfig = {
      ...defaultConfig,
      maxAdditions: 10,
      maxDeletions: 5,
      maxChangedFiles: 2,
    };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(3);
  });

  it('passes exactly at the limit boundary', () => {
    const config: DiffCheckerConfig = {
      ...defaultConfig,
      maxAdditions: 50,
      maxDeletions: 20,
      maxChangedFiles: 5,
    };
    const result = checkDiff(defaultMetrics, config);
    expect(result.passed).toBe(true);
  });

  it('returns metrics in result', () => {
    const result = checkDiff(defaultMetrics, defaultConfig);
    expect(result.metrics).toEqual(defaultMetrics);
  });
});
