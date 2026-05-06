import { getInput } from '@actions/core';
import { CommitCheckerConfig } from './commitChecker';

export function loadCommitCheckerConfig(): CommitCheckerConfig {
  const conventionalCommits =
    getInput('conventional_commits').toLowerCase() === 'true';

  const maxCommitsInput = getInput('max_commits').trim();
  const maxCommits =
    maxCommitsInput !== '' && !isNaN(Number(maxCommitsInput))
      ? parseInt(maxCommitsInput, 10)
      : null;

  const requireSignedCommits =
    getInput('require_signed_commits').toLowerCase() === 'true';

  return {
    conventionalCommits,
    maxCommits,
    requireSignedCommits,
  };
}

export function buildCommitCheckerSummary(config: CommitCheckerConfig): string {
  const lines: string[] = ['**Commit Checker Config:**'];

  lines.push(
    `- Conventional Commits: ${config.conventionalCommits ? 'enabled' : 'disabled'}`
  );

  if (config.maxCommits !== null) {
    lines.push(`- Max Commits: ${config.maxCommits}`);
  } else {
    lines.push('- Max Commits: unlimited');
  }

  lines.push(
    `- Require Signed Commits: ${config.requireSignedCommits ? 'yes' : 'no'}`
  );

  return lines.join('\n');
}
