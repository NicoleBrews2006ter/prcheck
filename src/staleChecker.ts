import { CheckResult } from './reporter';

export interface StaleCheckerConfig {
  enabled: boolean;
  maxDaysWithoutUpdate: number;
  warnDaysWithoutUpdate: number;
  ignoreDraftPRs: boolean;
}

export interface StaleContext {
  updatedAt: string;
  isDraft: boolean;
}

export function getDaysSinceUpdate(updatedAt: string, now: Date = new Date()): number {
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function checkStale(
  context: StaleContext,
  config: StaleCheckerConfig
): CheckResult {
  if (!config.enabled) {
    return { passed: true, summary: 'Stale check disabled.' };
  }

  if (config.ignoreDraftPRs && context.isDraft) {
    return { passed: true, summary: 'Stale check skipped for draft PRs.' };
  }

  const days = getDaysSinceUpdate(context.updatedAt);

  if (days >= config.maxDaysWithoutUpdate) {
    return {
      passed: false,
      summary: `PR is stale: no updates in ${days} day(s) (max allowed: ${config.maxDaysWithoutUpdate}).`,
    };
  }

  if (days >= config.warnDaysWithoutUpdate) {
    return {
      passed: true,
      summary: `Warning: PR has not been updated in ${days} day(s). Consider reviewing soon.`,
    };
  }

  return {
    passed: true,
    summary: `PR is active: last updated ${days} day(s) ago.`,
  };
}
