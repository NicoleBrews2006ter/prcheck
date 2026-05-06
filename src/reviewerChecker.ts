import * as core from '@actions/core';

export interface ReviewerCheckerConfig {
  minReviewers: number;
  requiredReviewers: string[];
  requireTeamReview: boolean;
  requiredTeams: string[];
}

export interface ReviewerCheckResult {
  passed: boolean;
  summary: string;
  details: string[];
}

export function checkReviewers(
  requestedReviewers: string[],
  requestedTeams: string[],
  config: ReviewerCheckerConfig
): ReviewerCheckResult {
  const details: string[] = [];
  let passed = true;

  const totalReviewers = requestedReviewers.length + requestedTeams.length;
  if (totalReviewers < config.minReviewers) {
    passed = false;
    details.push(
      `Minimum reviewers not met: expected at least ${config.minReviewers}, got ${totalReviewers}`
    );
  }

  if (config.requiredReviewers.length > 0) {
    const missing = config.requiredReviewers.filter(
      (r) => !requestedReviewers.includes(r)
    );
    if (missing.length > 0) {
      passed = false;
      details.push(`Missing required reviewers: ${missing.join(', ')}`);
    }
  }

  if (config.requireTeamReview && requestedTeams.length === 0) {
    passed = false;
    details.push('At least one team review is required but none were requested');
  }

  if (config.requiredTeams.length > 0) {
    const missingTeams = config.requiredTeams.filter(
      (t) => !requestedTeams.includes(t)
    );
    if (missingTeams.length > 0) {
      passed = false;
      details.push(`Missing required team reviewers: ${missingTeams.join(', ')}`);
    }
  }

  const summary = passed
    ? `Reviewer requirements met (${totalReviewers} reviewer(s) requested)`
    : `Reviewer requirements not met`;

  core.debug(`Reviewer check: passed=${passed}, details=${JSON.stringify(details)}`);

  return { passed, summary, details };
}

export function extractReviewerNames(
  reviewers: Array<{ login: string }>
): string[] {
  return reviewers.map((r) => r.login);
}

export function extractTeamNames(
  teams: Array<{ slug: string }>
): string[] {
  return teams.map((t) => t.slug);
}
