import * as core from "@actions/core";

export interface ApprovalCheckerConfig {
  enabled: boolean;
  requiredApprovals: number;
  requireNoChangesRequested: boolean;
}

export function loadApprovalCheckerConfig(): ApprovalCheckerConfig {
  const enabled = core.getInput("approval_check_enabled") !== "false";
  const requiredApprovalsRaw = core.getInput("required_approvals");
  const requiredApprovals = requiredApprovalsRaw
    ? parseInt(requiredApprovalsRaw, 10)
    : 1;
  const requireNoChangesRequested =
    core.getInput("require_no_changes_requested") === "true";

  return {
    enabled,
    requiredApprovals: isNaN(requiredApprovals) ? 1 : requiredApprovals,
    requireNoChangesRequested,
  };
}

export function buildApprovalCheckerSummary(
  config: ApprovalCheckerConfig
): string {
  const lines: string[] = [
    `- Approval check enabled: ${config.enabled}`,
    `- Required approvals: ${config.requiredApprovals}`,
    `- Require no changes requested: ${config.requireNoChangesRequested}`,
  ];
  return lines.join("\n");
}
