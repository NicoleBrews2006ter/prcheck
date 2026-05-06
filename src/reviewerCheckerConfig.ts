import * as core from '@actions/core';

export interface ReviewerCheckerConfig {
  enabled: boolean;
  minReviewers: number;
  requiredReviewers: string[];
  requiredTeams: string[];
  allowAuthorAsReviewer: boolean;
}

export function loadReviewerCheckerConfig(): ReviewerCheckerConfig {
  const enabled = core.getInput('reviewer_check_enabled').toLowerCase() !== 'false';
  const minReviewersRaw = core.getInput('min_reviewers');
  const minReviewers = minReviewersRaw ? parseInt(minReviewersRaw, 10) : 1;

  const requiredReviewersRaw = core.getInput('required_reviewers');
  const requiredReviewers = requiredReviewersRaw
    ? requiredReviewersRaw.split(',').map((r) => r.trim()).filter(Boolean)
    : [];

  const requiredTeamsRaw = core.getInput('required_teams');
  const requiredTeams = requiredTeamsRaw
    ? requiredTeamsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const allowAuthorAsReviewer =
    core.getInput('allow_author_as_reviewer').toLowerCase() === 'true';

  return {
    enabled,
    minReviewers: isNaN(minReviewers) ? 1 : minReviewers,
    requiredReviewers,
    requiredTeams,
    allowAuthorAsReviewer,
  };
}

export function buildReviewerCheckerSummary(config: ReviewerCheckerConfig): string {
  const lines: string[] = ['**Reviewer Checker Config:**'];
  lines.push(`- Enabled: ${config.enabled}`);
  lines.push(`- Min Reviewers: ${config.minReviewers}`);
  if (config.requiredReviewers.length > 0) {
    lines.push(`- Required Reviewers: ${config.requiredReviewers.join(', ')}`);
  }
  if (config.requiredTeams.length > 0) {
    lines.push(`- Required Teams: ${config.requiredTeams.join(', ')}`);
  }
  lines.push(`- Allow Author As Reviewer: ${config.allowAuthorAsReviewer}`);
  return lines.join('\n');
}
