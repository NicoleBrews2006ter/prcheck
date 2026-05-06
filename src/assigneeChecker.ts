import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface AssigneeCheckerConfig {
  requireAssignee: boolean;
  minAssignees: number;
  maxAssignees: number;
  allowedAssignees: string[];
}

export interface PullRequestAssigneeContext {
  assignees: Array<{ login: string }>;
}

export function extractAssigneeLogins(context: PullRequestAssigneeContext): string[] {
  return context.assignees.map((a) => a.login);
}

export function checkAssignees(
  context: PullRequestAssigneeContext,
  config: AssigneeCheckerConfig
): CheckResult {
  const assignees = extractAssigneeLogins(context);
  const count = assignees.length;
  const messages: string[] = [];

  if (config.requireAssignee && count === 0) {
    messages.push('PR must have at least one assignee.');
  }

  if (count < config.minAssignees) {
    messages.push(
      `PR must have at least ${config.minAssignees} assignee(s), but found ${count}.`
    );
  }

  if (config.maxAssignees > 0 && count > config.maxAssignees) {
    messages.push(
      `PR must have no more than ${config.maxAssignees} assignee(s), but found ${count}.`
    );
  }

  if (config.allowedAssignees.length > 0) {
    const disallowed = assignees.filter(
      (login) => !config.allowedAssignees.includes(login)
    );
    if (disallowed.length > 0) {
      messages.push(
        `The following assignees are not in the allowed list: ${disallowed.join(', ')}.`
      );
    }
  }

  const passed = messages.length === 0;

  if (!passed) {
    messages.forEach((msg) => core.warning(msg));
  }

  return {
    passed,
    messages,
  };
}
