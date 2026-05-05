import * as core from '@actions/core';

export interface SizeConfig {
  maxAdditions?: number;
  maxDeletions?: number;
  maxChangedFiles?: number;
  warnOnly?: boolean;
}

export interface SizeResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

export interface PRSizeMetrics {
  additions: number;
  deletions: number;
  changedFiles: number;
}

export function checkSize(metrics: PRSizeMetrics, config: SizeConfig): SizeResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const { warnOnly = false } = config;

  if (config.maxAdditions !== undefined && metrics.additions > config.maxAdditions) {
    const msg = `PR additions (${metrics.additions}) exceed the maximum allowed (${config.maxAdditions}).`;
    warnOnly ? warnings.push(msg) : errors.push(msg);
  }

  if (config.maxDeletions !== undefined && metrics.deletions > config.maxDeletions) {
    const msg = `PR deletions (${metrics.deletions}) exceed the maximum allowed (${config.maxDeletions}).`;
    warnOnly ? warnings.push(msg) : errors.push(msg);
  }

  if (config.maxChangedFiles !== undefined && metrics.changedFiles > config.maxChangedFiles) {
    const msg = `PR changed files (${metrics.changedFiles}) exceed the maximum allowed (${config.maxChangedFiles}).`;
    warnOnly ? warnings.push(msg) : errors.push(msg);
  }

  const passed = errors.length === 0;

  if (!passed) {
    core.debug(`Size check failed: ${errors.join(', ')}`);
  }
  if (warnings.length > 0) {
    core.debug(`Size check warnings: ${warnings.join(', ')}`);
  }

  return { passed, warnings, errors };
}

export function extractSizeMetrics(prData: {
  additions: number;
  deletions: number;
  changed_files: number;
}): PRSizeMetrics {
  return {
    additions: prData.additions,
    deletions: prData.deletions,
    changedFiles: prData.changed_files,
  };
}
