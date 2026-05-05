import * as core from '@actions/core';
import { parseCommaSeparated } from './config';
import { MergeCheckConfig } from './mergeChecker';

export function loadMergeCheckerConfig(): MergeCheckConfig {
  const allowedBaseBranchesRaw = core.getInput('allowed_base_branches');
  const allowedMergeMethodsRaw = core.getInput('allowed_merge_methods');
  const requireUpToDate = core.getInput('require_up_to_date') !== 'false';
  const blockDraftMerge = core.getInput('block_draft_merge') !== 'false';

  const allowedBaseBranches = parseCommaSeparated(allowedBaseBranchesRaw);
  const allowedMergeMethods = parseCommaSeparated(allowedMergeMethodsRaw);

  core.debug(`Merge checker config loaded — baseBranches: [${allowedBaseBranches}], methods: [${allowedMergeMethods}]`);

  return {
    allowedBaseBranches,
    allowedMergeMethods,
    requireUpToDate,
    blockDraftMerge,
  };
}

export function buildMergeCheckerSummary(config: MergeCheckConfig): string {
  const lines: string[] = ['**Merge Checker Config:**'];
  if (config.allowedBaseBranches.length > 0) {
    lines.push(`- Allowed base branches: ${config.allowedBaseBranches.join(', ')}`);
  }
  if (config.allowedMergeMethods.length > 0) {
    lines.push(`- Allowed merge methods: ${config.allowedMergeMethods.join(', ')}`);
  }
  lines.push(`- Require up-to-date: ${config.requireUpToDate}`);
  lines.push(`- Block draft merge: ${config.blockDraftMerge}`);
  return lines.join('\n');
}
