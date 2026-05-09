import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface TimelineContext {
  pull_request: {
    created_at: string;
    updated_at: string;
    merged_at?: string | null;
    draft: boolean;
  };
}

export interface TimelineConfig {
  maxAgeInDays?: number;
  maxOpenDaysBeforeMerge?: number;
  warnIfDraftOlderThanDays?: number;
}

export function getDaysDiff(from: string, to: string = new Date().toISOString()): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function checkTimeline(context: TimelineContext, config: TimelineConfig): CheckResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  const { created_at, updated_at, merged_at, draft } = context.pull_request;
  const ageInDays = getDaysDiff(created_at);
  const daysSinceUpdate = getDaysDiff(updated_at);

  if (config.maxAgeInDays !== undefined && ageInDays > config.maxAgeInDays) {
    failures.push(
      `PR is ${ageInDays} day(s) old, exceeding the maximum allowed age of ${config.maxAgeInDays} day(s).`
    );
  }

  if (
    config.maxOpenDaysBeforeMerge !== undefined &&
    !merged_at &&
    ageInDays > config.maxOpenDaysBeforeMerge
  ) {
    warnings.push(
      `PR has been open for ${ageInDays} day(s) without being merged (limit: ${config.maxOpenDaysBeforeMerge} day(s)).`
    );
  }

  if (
    config.warnIfDraftOlderThanDays !== undefined &&
    draft &&
    ageInDays > config.warnIfDraftOlderThanDays
  ) {
    warnings.push(
      `Draft PR is ${ageInDays} day(s) old (warn threshold: ${config.warnIfDraftOlderThanDays} day(s)).`
    );
  }

  core.debug(`Timeline check: age=${ageInDays}d, daysSinceUpdate=${daysSinceUpdate}d, draft=${draft}`);

  return {
    passed: failures.length === 0,
    failures,
    warnings,
  };
}
