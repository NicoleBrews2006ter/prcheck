import { checkSize, extractSizeMetrics, PRSizeMetrics, SizeConfig } from '../sizeChecker';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

const baseMetrics: PRSizeMetrics = {
  additions: 100,
  deletions: 50,
  changedFiles: 10,
};

describe('checkSize', () => {
  it('passes when no limits are configured', () => {
    const result = checkSize(baseMetrics, {});
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('passes when all metrics are within limits', () => {
    const config: SizeConfig = { maxAdditions: 200, maxDeletions: 100, maxChangedFiles: 20 };
    const result = checkSize(baseMetrics, config);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when additions exceed limit', () => {
    const result = checkSize(baseMetrics, { maxAdditions: 50 });
    expect(result.passed).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/additions.*100.*50/);
  });

  it('fails when deletions exceed limit', () => {
    const result = checkSize(baseMetrics, { maxDeletions: 20 });
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toMatch(/deletions.*50.*20/);
  });

  it('fails when changed files exceed limit', () => {
    const result = checkSize(baseMetrics, { maxChangedFiles: 5 });
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toMatch(/changed files.*10.*5/);
  });

  it('reports warnings instead of errors when warnOnly is true', () => {
    const config: SizeConfig = { maxAdditions: 50, warnOnly: true };
    const result = checkSize(baseMetrics, config);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/additions/);
  });

  it('accumulates multiple errors', () => {
    const config: SizeConfig = { maxAdditions: 50, maxDeletions: 10, maxChangedFiles: 5 };
    const result = checkSize(baseMetrics, config);
    expect(result.passed).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe('extractSizeMetrics', () => {
  it('maps PR data fields to size metrics', () => {
    const prData = { additions: 42, deletions: 7, changed_files: 3 };
    const metrics = extractSizeMetrics(prData);
    expect(metrics).toEqual({ additions: 42, deletions: 7, changedFiles: 3 });
  });
});
