import * as core from '@actions/core';

export interface MergeCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export interface MergeCheckConfig {
  allowedBaseBranches: string[];
  allowedMergeMethods: string[];
  requireUpToDate: boolean;
  blockDraftMerge: boolean;
}

export function checkBaseBranch(
  baseBranch: string,
  allowedBranches: string[]
): boolean {
  if (!allowedBranches || allowedBranches.length === 0) return true;
  return allowedBranches.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    return regex.test(baseBranch);
  });
}

export function checkMergeMethod(
  method: string,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods || allowedMethods.length === 0) return true;
  return allowedMethods.includes(method);
}

export function checkMerge(
  baseBranch: string,
  isDraft: boolean,
  isBehind: boolean,
  config: MergeCheckConfig
): MergeCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    config.allowedBaseBranches &&
    config.allowedBaseBranches.length > 0 &&
    !checkBaseBranch(baseBranch, config.allowedBaseBranches)
  ) {
    errors.push(
      `Base branch "${baseBranch}" is not in allowed branches: [${config.allowedBaseBranches.join(', ')}]`
    );
  }

  if (config.blockDraftMerge && isDraft) {
    errors.push('Draft PRs are not allowed to be merged.');
  }

  if (config.requireUpToDate && isBehind) {
    warnings.push('PR branch is behind the base branch. Consider updating your branch.');
  }

  core.debug(`Merge check — base: ${baseBranch}, draft: ${isDraft}, behind: ${isBehind}`);

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}
