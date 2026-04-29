import * as core from '@actions/core';
import * as github from '@actions/github';

export interface LabelCheckerConfig {
  requiredLabels: string[];
  forbiddenLabels: string[];
  requireAtLeastOne: boolean;
}

export interface LabelCheckResult {
  passed: boolean;
  missingRequired: string[];
  foundForbidden: string[];
  message: string;
}

export function checkLabels(
  prLabels: string[],
  config: LabelCheckerConfig
): LabelCheckResult {
  const missingRequired: string[] = [];
  const foundForbidden: string[] = [];

  for (const required of config.requiredLabels) {
    if (!prLabels.includes(required)) {
      missingRequired.push(required);
    }
  }

  for (const forbidden of config.forbiddenLabels) {
    if (prLabels.includes(forbidden)) {
      foundForbidden.push(forbidden);
    }
  }

  const hasAtLeastOne =
    !config.requireAtLeastOne ||
    (config.requiredLabels.length === 0 && prLabels.length > 0) ||
    config.requiredLabels.some((label) => prLabels.includes(label));

  const passed =
    missingRequired.length === 0 &&
    foundForbidden.length === 0 &&
    hasAtLeastOne;

  let message = '';
  if (!passed) {
    const parts: string[] = [];
    if (missingRequired.length > 0) {
      parts.push(`Missing required labels: ${missingRequired.join(', ')}`);
    }
    if (foundForbidden.length > 0) {
      parts.push(`Forbidden labels present: ${foundForbidden.join(', ')}`);
    }
    if (!hasAtLeastOne) {
      parts.push('At least one label must be applied to this PR');
    }
    message = parts.join('. ');
  } else {
    message = 'All label checks passed.';
  }

  return { passed, missingRequired, foundForbidden, message };
}

export function extractPRLabels(
  pullRequest: typeof github.context.payload.pull_request
): string[] {
  if (!pullRequest || !Array.isArray(pullRequest.labels)) {
    return [];
  }
  return pullRequest.labels
    .map((label: { name?: string }) => label.name ?? '')
    .filter(Boolean);
}
