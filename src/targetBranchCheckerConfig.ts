import * as core from '@actions/core';
import { parseCommaSeparated } from './config';
import { TargetBranchCheckerConfig } from './targetBranchChecker';

export function loadTargetBranchCheckerConfig(): TargetBranchCheckerConfig {
  const enabled = core.getInput('target-branch-check-enabled') !== 'false';
  const allowedBranches = parseCommaSeparated(
    core.getInput('target-branch-allowed-branches')
  );
  const blockedBranches = parseCommaSeparated(
    core.getInput('target-branch-blocked-branches')
  );

  return {
    enabled,
    allowedBranches,
    blockedBranches,
  };
}

export function buildTargetBranchCheckerSummary(
  config: TargetBranchCheckerConfig
): string {
  const lines: string[] = ['**Target Branch Checker Config:**'];
  lines.push(`- Enabled: ${config.enabled}`);
  if (config.allowedBranches.length > 0) {
    lines.push(`- Allowed branches: ${config.allowedBranches.join(', ')}`);
  } else {
    lines.push('- Allowed branches: (any)');
  }
  if (config.blockedBranches.length > 0) {
    lines.push(`- Blocked branches: ${config.blockedBranches.join(', ')}`);
  } else {
    lines.push('- Blocked branches: (none)');
  }
  return lines.join('\n');
}
