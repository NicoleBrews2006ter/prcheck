import * as core from '@actions/core';

export interface TaskListCheckerConfig {
  enabled: boolean;
  requireAllChecked: boolean;
  minChecked: number;
  minTotal: number;
}

export function loadTaskListCheckerConfig(): TaskListCheckerConfig {
  const enabled = core.getInput('task_list_checker_enabled') !== 'false';
  const requireAllChecked = core.getInput('task_list_require_all_checked') === 'true';
  const minChecked = parseInt(core.getInput('task_list_min_checked') || '0', 10);
  const minTotal = parseInt(core.getInput('task_list_min_total') || '0', 10);

  return {
    enabled,
    requireAllChecked,
    minChecked: isNaN(minChecked) ? 0 : minChecked,
    minTotal: isNaN(minTotal) ? 0 : minTotal,
  };
}

export function buildTaskListCheckerSummary(config: TaskListCheckerConfig): string {
  const lines: string[] = ['**Task List Checker Config:**'];
  lines.push(`- Enabled: ${config.enabled}`);
  lines.push(`- Require all checked: ${config.requireAllChecked}`);
  lines.push(`- Min checked: ${config.minChecked}`);
  lines.push(`- Min total tasks: ${config.minTotal}`);
  return lines.join('\n');
}
