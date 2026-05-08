import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface DraftCheckerConfig {
  enabled: boolean;
  failOnDraft: boolean;
}

export interface DraftContext {
  pull_request: {
    draft: boolean;
    title: string;
  };
}

export function isDraft(context: DraftContext): boolean {
  return context.pull_request.draft === true;
}

export function checkDraft(
  context: DraftContext,
  config: DraftCheckerConfig
): CheckResult {
  if (!config.enabled) {
    return {
      passed: true,
      summary: 'Draft check is disabled.',
      details: [],
    };
  }

  const draft = isDraft(context);

  if (!draft) {
    return {
      passed: true,
      summary: 'PR is not a draft.',
      details: ['PR is ready for review.'],
    };
  }

  const message = 'PR is currently in draft state.';

  if (config.failOnDraft) {
    core.warning(message);
    return {
      passed: false,
      summary: message,
      details: ['Mark the PR as ready for review before merging.'],
    };
  }

  return {
    passed: true,
    summary: message,
    details: ['Draft PRs are allowed by current configuration.'],
  };
}
