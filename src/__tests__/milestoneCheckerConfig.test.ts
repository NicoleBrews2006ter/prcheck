import * as core from '@actions/core';
import {
  loadMilestoneCheckerConfig,
  buildMilestoneCheckerSummary,
} from '../milestoneCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

describe('loadMilestoneCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads requireMilestone as true', () => {
    setupInputs({ require_milestone: 'true' });
    const config = loadMilestoneCheckerConfig();
    expect(config.requireMilestone).toBe(true);
  });

  it('loads requireMilestone as false by default', () => {
    setupInputs({});
    const config = loadMilestoneCheckerConfig();
    expect(config.requireMilestone).toBe(false);
  });

  it('parses allowed milestones', () => {
    setupInputs({ require_milestone: 'true', allowed_milestones: 'v1.0, v2.0' });
    const config = loadMilestoneCheckerConfig();
    expect(config.allowedMilestones).toEqual(['v1.0', 'v2.0']);
  });

  it('returns empty array when no allowed milestones specified', () => {
    setupInputs({ require_milestone: 'true' });
    const config = loadMilestoneCheckerConfig();
    expect(config.allowedMilestones).toEqual([]);
  });
});

describe('buildMilestoneCheckerSummary', () => {
  it('includes require milestone setting', () => {
    const summary = buildMilestoneCheckerSummary({
      requireMilestone: true,
      allowedMilestones: [],
    });
    expect(summary).toContain('Require milestone: true');
    expect(summary).toContain('Allowed milestones: any');
  });

  it('lists allowed milestones when provided', () => {
    const summary = buildMilestoneCheckerSummary({
      requireMilestone: true,
      allowedMilestones: ['v1.0', 'v2.0'],
    });
    expect(summary).toContain('v1.0, v2.0');
  });
});
