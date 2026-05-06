import * as core from '@actions/core';

export interface MilestoneCheckerConfig {
  requireMilestone: boolean;
  allowedMilestones: string[];
}

export interface MilestoneCheckResult {
  passed: boolean;
  message: string;
  milestone: string | null;
}

export function extractMilestone(
  pr: { milestone?: { title: string } | null }
): string | null {
  return pr.milestone?.title ?? null;
}

export function checkMilestone(
  pr: { milestone?: { title: string } | null },
  config: MilestoneCheckerConfig
): MilestoneCheckResult {
  if (!config.requireMilestone) {
    return { passed: true, message: 'Milestone check skipped.', milestone: null };
  }

  const milestone = extractMilestone(pr);

  if (!milestone) {
    return {
      passed: false,
      message: 'PR must have a milestone assigned.',
      milestone: null,
    };
  }

  if (
    config.allowedMilestones.length > 0 &&
    !config.allowedMilestones.includes(milestone)
  ) {
    return {
      passed: false,
      message: `Milestone "${milestone}" is not in the allowed list: ${config.allowedMilestones.join(', ')}.`,
      milestone,
    };
  }

  return {
    passed: true,
    message: `Milestone "${milestone}" is valid.`,
    milestone,
  };
}
