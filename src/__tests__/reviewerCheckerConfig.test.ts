import * as core from '@actions/core';
import {
  loadReviewerCheckerConfig,
  buildReviewerCheckerSummary,
} from '../reviewerCheckerConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadReviewerCheckerConfig', () => {
  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadReviewerCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.minReviewers).toBe(1);
    expect(config.requiredReviewers).toEqual([]);
    expect(config.requiredTeams).toEqual([]);
    expect(config.allowAuthorAsReviewer).toBe(false);
  });

  it('disables checker when reviewer_check_enabled is false', () => {
    setupInputs({ reviewer_check_enabled: 'false' });
    const config = loadReviewerCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it('parses min_reviewers correctly', () => {
    setupInputs({ min_reviewers: '3' });
    const config = loadReviewerCheckerConfig();
    expect(config.minReviewers).toBe(3);
  });

  it('falls back to 1 for invalid min_reviewers', () => {
    setupInputs({ min_reviewers: 'abc' });
    const config = loadReviewerCheckerConfig();
    expect(config.minReviewers).toBe(1);
  });

  it('parses required_reviewers as a comma-separated list', () => {
    setupInputs({ required_reviewers: 'alice, bob, carol' });
    const config = loadReviewerCheckerConfig();
    expect(config.requiredReviewers).toEqual(['alice', 'bob', 'carol']);
  });

  it('parses required_teams as a comma-separated list', () => {
    setupInputs({ required_teams: 'team-a, team-b' });
    const config = loadReviewerCheckerConfig();
    expect(config.requiredTeams).toEqual(['team-a', 'team-b']);
  });

  it('enables allow_author_as_reviewer when set to true', () => {
    setupInputs({ allow_author_as_reviewer: 'true' });
    const config = loadReviewerCheckerConfig();
    expect(config.allowAuthorAsReviewer).toBe(true);
  });
});

describe('buildReviewerCheckerSummary', () => {
  it('includes all config fields in the summary', () => {
    const config = {
      enabled: true,
      minReviewers: 2,
      requiredReviewers: ['alice'],
      requiredTeams: ['team-a'],
      allowAuthorAsReviewer: false,
    };
    const summary = buildReviewerCheckerSummary(config);
    expect(summary).toContain('Enabled: true');
    expect(summary).toContain('Min Reviewers: 2');
    expect(summary).toContain('Required Reviewers: alice');
    expect(summary).toContain('Required Teams: team-a');
    expect(summary).toContain('Allow Author As Reviewer: false');
  });

  it('omits required reviewers line when list is empty', () => {
    const config = {
      enabled: true,
      minReviewers: 1,
      requiredReviewers: [],
      requiredTeams: [],
      allowAuthorAsReviewer: false,
    };
    const summary = buildReviewerCheckerSummary(config);
    expect(summary).not.toContain('Required Reviewers');
    expect(summary).not.toContain('Required Teams');
  });
});
