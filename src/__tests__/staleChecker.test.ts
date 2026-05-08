import { checkStale, getDaysSinceUpdate, StaleCheckerConfig, StaleContext } from '../staleChecker';

const baseConfig: StaleCheckerConfig = {
  enabled: true,
  maxDaysWithoutUpdate: 30,
  warnDaysWithoutUpdate: 14,
  ignoreDraftPRs: false,
};

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('getDaysSinceUpdate', () => {
  it('returns 0 for an update just now', () => {
    const now = new Date();
    expect(getDaysSinceUpdate(now.toISOString(), now)).toBe(0);
  });

  it('returns correct days for a past date', () => {
    const now = new Date('2024-06-15T00:00:00Z');
    const updated = new Date('2024-06-10T00:00:00Z');
    expect(getDaysSinceUpdate(updated.toISOString(), now)).toBe(5);
  });
});

describe('checkStale', () => {
  it('passes when stale check is disabled', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(60), isDraft: false };
    const result = checkStale(ctx, { ...baseConfig, enabled: false });
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/disabled/i);
  });

  it('skips draft PRs when ignoreDraftPRs is true', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(60), isDraft: true };
    const result = checkStale(ctx, { ...baseConfig, ignoreDraftPRs: true });
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/draft/i);
  });

  it('fails when PR exceeds maxDaysWithoutUpdate', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(35), isDraft: false };
    const result = checkStale(ctx, baseConfig);
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/stale/i);
  });

  it('passes with warning when PR exceeds warnDaysWithoutUpdate but not max', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(20), isDraft: false };
    const result = checkStale(ctx, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/warning/i);
  });

  it('passes cleanly when PR is recently updated', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(3), isDraft: false };
    const result = checkStale(ctx, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/active/i);
  });

  it('does not skip draft PRs when ignoreDraftPRs is false', () => {
    const ctx: StaleContext = { updatedAt: daysAgo(35), isDraft: true };
    const result = checkStale(ctx, { ...baseConfig, ignoreDraftPRs: false });
    expect(result.passed).toBe(false);
  });
});
