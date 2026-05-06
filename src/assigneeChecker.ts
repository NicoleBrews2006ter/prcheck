import { Context } from '@actions/github/lib/context';

export interface AssigneeCheckOptions {
  minAssignees: number;
  maxAssignees: number;
  requiredAssignees: string[];
}

export interface AssigneeCheckResult {
  passed: boolean;
  message: string;
}

export function extractAssigneeLogins(context: Context): string[] {
  const pr = context.payload?.pull_request;
  if (!pr || !Array.isArray(pr.assignees)) {
    return [];
  }
  return pr.assignees.map((a: { login: string }) => a.login);
}

export function checkAssignees(
  assignees: string[],
  options: AssigneeCheckOptions
): AssigneeCheckResult {
  const count = assignees.length;

  if (count < options.minAssignees) {
    return {
      passed: false,
      message: `PR must have at least ${options.minAssignees} assignee(s), but found ${count}.`,
    };
  }

  if (options.maxAssignees > 0 && count > options.maxAssignees) {
    return {
      passed: false,
      message: `PR must have at most ${options.maxAssignees} assignee(s), but found ${count}.`,
    };
  }

  const missing = options.requiredAssignees.filter(
    (required) => !assignees.includes(required)
  );

  if (missing.length > 0) {
    return {
      passed: false,
      message: `PR is missing required assignee(s): ${missing.join(', ')}.`,
    };
  }

  return {
    passed: true,
    message: `Assignee check passed (${count} assignee(s)).`,
  };
}
