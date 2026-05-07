import * as core from '@actions/core';
import { DiffCheckerConfig } from './diffChecker';
import { parseCommaSeparated } from './config';

export function loadDiffCheckerConfig(): DiffCheckerConfig {
  const maxAdditionsRaw = core.getInput('diff_max_additions');
  const maxDeletionsRaw = core.getInput('diff_max_deletions');
  const maxChangedFilesRaw = core.getInput('diff_max_changed_files');
  const ignorePathsRaw = core.getInput('diff_ignore_paths');

  const parseLimit = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const value = parseInt(trimmed, 10);
    return isNaN(value) ? null : value;
  };

  return {
    maxAdditions: parseLimit(maxAdditionsRaw),
    maxDeletions: parseLimit(maxDeletionsRaw),
    maxChangedFiles: parseLimit(maxChangedFilesRaw),
    ignorePaths: parseCommaSeparated(ignorePathsRaw),
  };
}

export function buildDiffCheckerSummary(config: DiffCheckerConfig): string {
  const lines: string[] = ['**Diff Checker Configuration**'];

  if (config.maxAdditions !== null) {
    lines.push(`- Max additions: ${config.maxAdditions}`);
  }
  if (config.maxDeletions !== null) {
    lines.push(`- Max deletions: ${config.maxDeletions}`);
  }
  if (config.maxChangedFiles !== null) {
    lines.push(`- Max changed files: ${config.maxChangedFiles}`);
  }
  if (config.ignorePaths.length > 0) {
    lines.push(`- Ignored paths: ${config.ignorePaths.join(', ')}`);
  }

  return lines.join('\n');
}
