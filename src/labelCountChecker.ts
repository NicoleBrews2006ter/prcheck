import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface LabelCountContext {
  payload: {
    pull_request?: {
      labels?: Array<{ name: string }>;
    };
  };
}

export function extractLabelCount(context: LabelCountContext): number {
  const labels = context.payload.pull_request?.labels ?? [];
  return labels.length;
}

export function checkLabelCount(
  context: LabelCountContext,
  minLabels: number,
  maxLabels: number
): CheckResult {
  const count = extractLabelCount(context);

  if (minLabels > 0 && count < minLabels) {
    return {
      passed: false,
      message: `PR has ${count} label(s), but at least ${minLabels} is required.`,
    };
  }

  if (maxLabels > 0 && count > maxLabels) {
    return {
      passed: false,
      message: `PR has ${count} label(s), but no more than ${maxLabels} is allowed.`,
    };
  }

  return {
    passed: true,
    message: `PR label count (${count}) is within the allowed range.`,
  };
}
