import * as core from '@actions/core';
import { BranchCheckerConfig } from './branchChecker';
import { parseCommaSeparated } from './config';

export function loadBranchCheckerConfig(): BranchCheckerConfig {
  const enabled = core.getInput('branch_check_enabled').toLowerCase() !== 'false';
  const allowedPatterns = parseCommaSeparated(
    core.getInput('branch_allowed_patterns')
  );
  const forbiddenPatterns = parseCommaSeparated(
    core.getInput('branch_forbidden_patterns')
  );
  const maxLengthRaw = core.getInput('branch_max_length');
  const maxLength = maxLengthRaw ? parseInt(maxLengthRaw, 10) : 0;

  return {
    enabled,
    allowedPatterns,
    forbiddenPatterns,
    maxLength: isNaN(maxLength) ? 0 : maxLength,
  };
}

export function buildBranchCheckerSummary(config: BranchCheckerConfig): string {
  const lines: string[] = ['**Branch Checker Config:**'];
  lines.push(`- Enabled: ${config.enabled}`);
  if (config.allowedPatterns.length > 0) {
    lines.push(`- Allowed patterns: ${config.allowedPatterns.join(', ')}`);
  }
  if (config.forbiddenPatterns.length > 0) {
    lines.push(`- Forbidden patterns: ${config.forbiddenPatterns.join(', ')}`);
  }
  if (config.maxLength > 0) {
    lines.push(`- Max length: ${config.maxLength}`);
  }
  return lines.join('\n');
}
