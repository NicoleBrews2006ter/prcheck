import { CheckResult } from './reporter';

export interface TaskListMetrics {
  total: number;
  checked: number;
  unchecked: number;
}

export function extractTaskListMetrics(body: string): TaskListMetrics {
  if (!body) return { total: 0, checked: 0, unchecked: 0 };

  const checkedPattern = /^\s*-\s*\[x\]/gim;
  const uncheckedPattern = /^\s*-\s*\[\s\]/gim;

  const checked = (body.match(checkedPattern) || []).length;
  const unchecked = (body.match(uncheckedPattern) || []).length;
  const total = checked + unchecked;

  return { total, checked, unchecked };
}

export function checkTaskList(
  context: { payload: { pull_request: { body: string | null } } },
  requireAllChecked: boolean,
  minChecked: number,
  minTotal: number
): CheckResult {
  const body = context.payload.pull_request.body || '';
  const metrics = extractTaskListMetrics(body);

  const details: string[] = [
    `Total tasks: ${metrics.total}`,
    `Checked: ${metrics.checked}`,
    `Unchecked: ${metrics.unchecked}`,
  ];

  if (minTotal > 0 && metrics.total < minTotal) {
    return {
      pass: false,
      message: `PR must have at least ${minTotal} task(s) in the checklist (found ${metrics.total}).`,
      details,
    };
  }

  if (requireAllChecked && metrics.unchecked > 0) {
    return {
      pass: false,
      message: `All tasks must be checked before merging (${metrics.unchecked} unchecked).`,
      details,
    };
  }

  if (minChecked > 0 && metrics.checked < minChecked) {
    return {
      pass: false,
      message: `At least ${minChecked} task(s) must be checked (found ${metrics.checked}).`,
      details,
    };
  }

  return {
    pass: true,
    message: 'Task list check passed.',
    details,
  };
}
