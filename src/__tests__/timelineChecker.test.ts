import { getDaysDiff, checkTimeline, TimelineContext } from '../timelineChecker';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeContext(overrides: Partial<TimelineContext['pull_request']> = {}): TimelineContext {
  return {
    pull_request: {
      created_at: daysAgo(5),
      updated_at: daysAgo(1),
      merged_at: null,
      draft: false,
      ...overrides,
    },
  };
}

describe('getDaysDiff', () => {
  it('returns 0 for same timestamp', () => {
    const now = new Date().toISOString();
    expect(getDaysDiff(now, now)).toBe(0);
  });

  it('returns correct day count', () => {
    const from = daysAgo(10);
    expect(getDaysDiff(from)).toBeGreaterThanOrEqual(9);
    expect(getDaysDiff(from)).toBeLessThanOrEqual(10);
  });
});

describe('checkTimeline', () => {
  it('passes when no config constraints are set', () => {
    const result = checkTimeline(makeContext(), {});
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('fails when PR exceeds maxAgeInDays', () => {
    const ctx = makeContext({ created_at: daysAgo(20) });
    const result = checkTimeline(ctx, { maxAgeInDays: 10 });
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toMatch(/exceeding the maximum allowed age/);
  });

  it('passes when PR is within maxAgeInDays', () => {
    const ctx = makeContext({ created_at: daysAgo(3) });
    const result = checkTimeline(ctx, { maxAgeInDays: 10 });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('warns when unmerged PR exceeds maxOpenDaysBeforeMerge', () => {
    const ctx = makeContext({ created_at: daysAgo(15), merged_at: null });
    const result = checkTimeline(ctx, { maxOpenDaysBeforeMerge: 7 });
    expect(result.passed).toBe(true);
    expect(result.warnings[0]).toMatch(/without being merged/);
  });

  it('does not warn about maxOpenDaysBeforeMerge if already merged', () => {
    const ctx = makeContext({ created_at: daysAgo(15), merged_at: daysAgo(1) });
    const result = checkTimeline(ctx, { maxOpenDaysBeforeMerge: 7 });
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when draft PR is older than warnIfDraftOlderThanDays', () => {
    const ctx = makeContext({ created_at: daysAgo(10), draft: true });
    const result = checkTimeline(ctx, { warnIfDraftOlderThanDays: 5 });
    expect(result.warnings[0]).toMatch(/Draft PR is/);
  });

  it('does not warn about draft age for non-draft PRs', () => {
    const ctx = makeContext({ created_at: daysAgo(10), draft: false });
    const result = checkTimeline(ctx, { warnIfDraftOlderThanDays: 5 });
    expect(result.warnings).toHaveLength(0);
  });
});
