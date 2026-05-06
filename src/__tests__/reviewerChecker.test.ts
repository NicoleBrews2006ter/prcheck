import { checkReviewers, extractReviewerNames, extractTeamNames } from '../reviewerChecker';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

const baseConfig = {
  minReviewers: 1,
  requiredReviewers: [],
  requireTeamReview: false,
  requiredTeams: [],
};

describe('checkReviewers', () => {
  it('passes when minimum reviewers are met', () => {
    const result = checkReviewers(['alice'], [], { ...baseConfig, minReviewers: 1 });
    expect(result.passed).toBe(true);
    expect(result.details).toHaveLength(0);
  });

  it('fails when fewer reviewers than minimum', () => {
    const result = checkReviewers([], [], { ...baseConfig, minReviewers: 2 });
    expect(result.passed).toBe(false);
    expect(result.details[0]).toMatch(/Minimum reviewers not met/);
  });

  it('fails when required reviewer is missing', () => {
    const result = checkReviewers(
      ['alice'],
      [],
      { ...baseConfig, requiredReviewers: ['bob'] }
    );
    expect(result.passed).toBe(false);
    expect(result.details[0]).toMatch(/Missing required reviewers: bob/);
  });

  it('passes when all required reviewers are present', () => {
    const result = checkReviewers(
      ['alice', 'bob'],
      [],
      { ...baseConfig, requiredReviewers: ['alice', 'bob'] }
    );
    expect(result.passed).toBe(true);
  });

  it('fails when team review required but none requested', () => {
    const result = checkReviewers([], [], { ...baseConfig, requireTeamReview: true });
    expect(result.passed).toBe(false);
    expect(result.details[0]).toMatch(/team review is required/);
  });

  it('passes when team review required and team is present', () => {
    const result = checkReviewers([], ['core-team'], { ...baseConfig, requireTeamReview: true });
    expect(result.passed).toBe(true);
  });

  it('fails when required team is missing', () => {
    const result = checkReviewers(
      [],
      ['other-team'],
      { ...baseConfig, requiredTeams: ['core-team'] }
    );
    expect(result.passed).toBe(false);
    expect(result.details[0]).toMatch(/Missing required team reviewers: core-team/);
  });

  it('includes reviewer count in summary on pass', () => {
    const result = checkReviewers(['alice', 'bob'], ['team-a'], baseConfig);
    expect(result.summary).toMatch(/3 reviewer/);
  });
});

describe('extractReviewerNames', () => {
  it('extracts login names from reviewer objects', () => {
    const names = extractReviewerNames([{ login: 'alice' }, { login: 'bob' }]);
    expect(names).toEqual(['alice', 'bob']);
  });
});

describe('extractTeamNames', () => {
  it('extracts slugs from team objects', () => {
    const names = extractTeamNames([{ slug: 'core-team' }, { slug: 'frontend' }]);
    expect(names).toEqual(['core-team', 'frontend']);
  });
});
