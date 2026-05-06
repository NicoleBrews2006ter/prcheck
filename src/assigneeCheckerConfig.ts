import * as core from '@actions/core';

export interface AssigneeCheckerConfig {
  enabled: boolean;
  minAssignees: number;
  maxAssignees: number;
  requiredAssignees: string[];
}

export function loadAssigneeCheckerConfig(): AssigneeCheckerConfig {
  const enabled = core.getInput('assignee-check-enabled').toLowerCase() !== 'false';
  const minAssignees = parseInt(core.getInput('min-assignees') || '1', 10);
  const maxAssignees = parseInt(core.getInput('max-assignees') || '0', 10);
  const requiredAssigneesRaw = core.getInput('required-assignees') || '';
  const requiredAssignees = requiredAssigneesRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    enabled,
    minAssignees: isNaN(minAssignees) ? 1 : minAssignees,
    maxAssignees: isNaN(maxAssignees) ? 0 : maxAssignees,
    requiredAssignees,
  };
}

export function buildAssigneeCheckerSummary(config: AssigneeCheckerConfig): string {
  const lines: string[] = [];
  lines.push(`Assignee check enabled: ${config.enabled}`);
  lines.push(`Min assignees: ${config.minAssignees}`);
  if (config.maxAssignees > 0) {
    lines.push(`Max assignees: ${config.maxAssignees}`);
  }
  if (config.requiredAssignees.length > 0) {
    lines.push(`Required assignees: ${config.requiredAssignees.join(', ')}`);
  }
  return lines.join('\n');
}
