import { CheckResult } from './reporter';

export interface TargetBranchContext {
  pull_request: {
    base: {
      ref: string;
    };
  };
}

export interface TargetBranchCheckerConfig {
  enabled: boolean;
  allowedBranches: string[];
  blockedBranches: string[];
}

export function buildTargetBranchRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

export function checkTargetBranch(
  context: TargetBranchContext,
  config: TargetBranchCheckerConfig
): CheckResult {
  if (!config.enabled) {
    return { passed: true, message: 'Target branch check is disabled.' };
  }

  const targetBranch = context.pull_request.base.ref;

  if (config.blockedBranches.length > 0) {
    const isBlocked = config.blockedBranches.some((pattern) =>
      buildTargetBranchRegex(pattern).test(targetBranch)
    );
    if (isBlocked) {
      return {
        passed: false,
        message: `PR targets blocked branch "${targetBranch}". Blocked patterns: ${config.blockedBranches.join(', ')}.`,
      };
    }
  }

  if (config.allowedBranches.length > 0) {
    const isAllowed = config.allowedBranches.some((pattern) =>
      buildTargetBranchRegex(pattern).test(targetBranch)
    );
    if (!isAllowed) {
      return {
        passed: false,
        message: `PR targets "${targetBranch}" which is not in the allowed list: ${config.allowedBranches.join(', ')}.`,
      };
    }
  }

  return { passed: true, message: `Target branch "${targetBranch}" is allowed.` };
}
