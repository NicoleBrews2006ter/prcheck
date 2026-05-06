import { checkMilestone, extractMilestone } from '../milestoneChecker';
import type { MilestoneCheckerConfig } from '../milestoneChecker';

const baseConfig: MilestoneCheckerConfig = {
  requireMilestone: true,
  allowedMilestones: [],
};

describe('extractMilestone', () => {
  it('returns milestone title when present', () => {
    expect(extractMilestone({ milestone: { title: 'v1.0' } })).toBe('v1.0');
  });

  it('returns null when milestone is null', () => {
    expect(extractMilestone({ milestone: null })).toBeNull();
  });

  it('returns null when milestone is undefined', () => {
    expect(extractMilestone({})).toBeNull();
  });
});

describe('checkMilestone', () => {
  it('passes when requireMilestone is false', () => {
    const result = checkMilestone(
      { milestone: null },
      { ...baseConfig, requireMilestone: false }
    );
    expect(result.passed).toBe(true);
  });

  it('fails when milestone is missing and required', () => {
    const result = checkMilestone({ milestone: null }, baseConfig);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/must have a milestone/);
  });

  it('passes when milestone is present and no restrictions', () => {
    const result = checkMilestone(
      { milestone: { title: 'v2.0' } },
      baseConfig
    );
    expect(result.passed).toBe(true);
    expect(result.milestone).toBe('v2.0');
  });

  it('passes when milestone is in allowed list', () => {
    const result = checkMilestone(
      { milestone: { title: 'v1.0' } },
      { ...baseConfig, allowedMilestones: ['v1.0', 'v2.0'] }
    );
    expect(result.passed).toBe(true);
  });

  it('fails when milestone is not in allowed list', () => {
    const result = checkMilestone(
      { milestone: { title: 'v3.0' } },
      { ...baseConfig, allowedMilestones: ['v1.0', 'v2.0'] }
    );
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not in the allowed list/);
    expect(result.milestone).toBe('v3.0');
  });
});
