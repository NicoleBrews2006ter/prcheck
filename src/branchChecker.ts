import { CheckResult } from './reporter';

export interface BranchCheckerConfig {
  enabled: boolean;
  allowedPatterns: string[];
  forbiddenPatterns: string[];
  maxLength: number;
}

export function buildBranchRegex(pattern: string): RegExp {
  return new RegExp(`^${pattern}$`);
}

export function checkBranchName(
  branchName: string,
  config: BranchCheckerConfig
): CheckResult {
  if (!config.enabled) {
    return { passed: true, summary: 'Branch name check is disabled.' };
  }

  const errors: string[] = [];

  if (config.maxLength > 0 && branchName.length > config.maxLength) {
    errors.push(
      `Branch name "${branchName}" exceeds max length of ${config.maxLength} characters.`
    );
  }

  if (config.forbiddenPatterns.length > 0) {
    for (const pattern of config.forbiddenPatterns) {
      if (buildBranchRegex(pattern).test(branchName)) {
        errors.push(
          `Branch name "${branchName}" matches forbidden pattern: ${pattern}`
        );
      }
    }
  }

  if (config.allowedPatterns.length > 0) {
    const matchesAny = config.allowedPatterns.some((p) =>
      buildBranchRegex(p).test(branchName)
    );
    if (!matchesAny) {
      errors.push(
        `Branch name "${branchName}" does not match any allowed pattern: ${config.allowedPatterns.join(', ')}`
      );
    }
  }

  if (errors.length > 0) {
    return { passed: false, summary: errors.join('\n') };
  }

  return { passed: true, summary: `Branch name "${branchName}" is valid.` };
}
