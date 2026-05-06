import * as core from '@actions/core';
import { parseCommaSeparated } from './config';
import { MilestoneCheckerConfig } from './milestoneChecker';

export function loadMilestoneCheckerConfig(): MilestoneCheckerConfig {
  const requireMilestone =
    core.getInput('require_milestone').toLowerCase() === 'true';
  const allowedMilestones = parseCommaSeparated(
    core.getInput('allowed_milestones')
  );

  return {
    requireMilestone,
    allowedMilestones,
  };
}

export function buildMilestoneCheckerSummary(
  config: MilestoneCheckerConfig
): string {
  const lines: string[] = ['**Milestone Checker Config:**'];
  lines.push(`- Require milestone: ${config.requireMilestone}`);
  if (config.allowedMilestones.length > 0) {
    lines.push(
      `- Allowed milestones: ${config.allowedMilestones.join(', ')}`
    );
  } else {
    lines.push('- Allowed milestones: any');
  }
  return lines.join('\n');
}
