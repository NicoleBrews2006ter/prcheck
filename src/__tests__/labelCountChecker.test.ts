import { checkLabelCount, extractLabelCount, LabelCountContext } from '../labelCountChecker';

function makeContext(labelNames: string[]): LabelCountContext {
  return {
    payload: {
      pull_request: {
        labels: labelNames.map((name) => ({ name })),
      },
    },
  };
}

describe('extractLabelCount', () => {
  it('returns 0 when no labels are present', () => {
    const ctx = makeContext([]);
    expect(extractLabelCount(ctx)).toBe(0);
  });

  it('returns correct count for multiple labels', () => {
    const ctx = makeContext(['bug', 'enhancement', 'help wanted']);
    expect(extractLabelCount(ctx)).toBe(3);
  });

  it('returns 0 when pull_request is undefined', () => {
    const ctx: LabelCountContext = { payload: {} };
    expect(extractLabelCount(ctx)).toBe(0);
  });
});

describe('checkLabelCount', () => {
  it('passes when count meets minimum', () => {
    const ctx = makeContext(['bug', 'enhancement']);
    const result = checkLabelCount(ctx, 1, 0);
    expect(result.passed).toBe(true);
  });

  it('fails when count is below minimum', () => {
    const ctx = makeContext([]);
    const result = checkLabelCount(ctx, 1, 0);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('at least 1 is required');
  });

  it('fails when count exceeds maximum', () => {
    const ctx = makeContext(['a', 'b', 'c', 'd']);
    const result = checkLabelCount(ctx, 0, 3);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('no more than 3 is allowed');
  });

  it('passes when count is within range', () => {
    const ctx = makeContext(['bug', 'enhancement']);
    const result = checkLabelCount(ctx, 1, 5);
    expect(result.passed).toBe(true);
  });

  it('passes when min and max are both 0 (disabled)', () => {
    const ctx = makeContext([]);
    const result = checkLabelCount(ctx, 0, 0);
    expect(result.passed).toBe(true);
  });

  it('passes when count exactly equals minimum', () => {
    const ctx = makeContext(['bug']);
    const result = checkLabelCount(ctx, 1, 0);
    expect(result.passed).toBe(true);
  });

  it('passes when count exactly equals maximum', () => {
    const ctx = makeContext(['bug', 'enhancement', 'fix']);
    const result = checkLabelCount(ctx, 0, 3);
    expect(result.passed).toBe(true);
  });
});
