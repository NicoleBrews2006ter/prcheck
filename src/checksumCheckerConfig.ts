import * as core from '@actions/core';

export interface ChecksumCheckerConfig {
  requireChecklist: boolean;
  checklistPattern?: string;
}

export function loadChecksumCheckerConfig(): ChecksumCheckerConfig {
  const requireChecklist = core.getInput('checklist_required').toLowerCase() === 'true';
  const checklistPattern = core.getInput('checklist_pattern') || undefined;

  return {
    requireChecklist,
    checklistPattern,
  };
}

export function buildChecksumCheckerSummary(config: ChecksumCheckerConfig): string {
  const lines: string[] = ['**Checklist Checker Config:**'];

  lines.push(`- Require checklist: ${config.requireChecklist}`);

  if (config.checklistPattern) {
    lines.push(`- Checklist pattern: \`${config.checklistPattern}\``);
  } else {
    lines.push(`- Checklist pattern: \`- [x]\` (default)`);
  }

  return lines.join('\n');
}
