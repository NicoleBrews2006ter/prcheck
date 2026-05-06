import { getInput } from '@actions/core';

export interface CommitCheckResult {
  passed: boolean;
  violations: string[];
  commitCount: number;
}

export interface CommitCheckerConfig {
  conventionalCommits: boolean;
  maxCommits: number | null;
  requireSignedCommits: boolean;
}

export function buildConventionalCommitRegex(): RegExp {
  const types = 'feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert';
  return new RegExp(`^(${types})(\\(.+\\))?: .+`);
}

export interface CommitInfo {
  message: string;
  verified: boolean;
}

export function checkCommits(
  commits: CommitInfo[],
  config: CommitCheckerConfig
): CommitCheckResult {
  const violations: string[] = [];

  if (config.maxCommits !== null && commits.length > config.maxCommits) {
    violations.push(
      `PR has ${commits.length} commits, but the maximum allowed is ${config.maxCommits}.`
    );
  }

  if (config.conventionalCommits) {
    const regex = buildConventionalCommitRegex();
    commits.forEach((commit, index) => {
      const firstLine = commit.message.split('\n')[0].trim();
      if (!regex.test(firstLine)) {
        violations.push(
          `Commit ${index + 1} does not follow Conventional Commits: "${firstLine}"`
        );
      }
    });
  }

  if (config.requireSignedCommits) {
    commits.forEach((commit, index) => {
      if (!commit.verified) {
        violations.push(`Commit ${index + 1} is not signed/verified.`);
      }
    });
  }

  return {
    passed: violations.length === 0,
    violations,
    commitCount: commits.length,
  };
}
