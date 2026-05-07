import { PullRequest } from "@octokit/webhooks-types";

export interface ApprovalContext {
  pull_request: PullRequest;
  reviews: Array<{ state: string; user: { login: string } | null }>;
}

export interface ApprovalResult {
  passed: boolean;
  message: string;
  approvalCount: number;
  requiredApprovals: number;
  changesRequested: boolean;
  approvedBy: string[];
}

export function extractApprovedReviews(
  reviews: ApprovalContext["reviews"]
): string[] {
  const approvals = new Map<string, string>();
  for (const review of reviews) {
    if (!review.user) continue;
    const login = review.user.login;
    if (review.state === "APPROVED") {
      approvals.set(login, login);
    } else if (review.state === "CHANGES_REQUESTED" || review.state === "DISMISSED") {
      approvals.delete(login);
    }
  }
  return Array.from(approvals.keys());
}

export function hasChangesRequested(
  reviews: ApprovalContext["reviews"]
): boolean {
  const latest = new Map<string, string>();
  for (const review of reviews) {
    if (!review.user) continue;
    latest.set(review.user.login, review.state);
  }
  return Array.from(latest.values()).some((s) => s === "CHANGES_REQUESTED");
}

export function checkApprovals(
  context: ApprovalContext,
  requiredApprovals: number,
  requireNoChangesRequested: boolean
): ApprovalResult {
  const approvedBy = extractApprovedReviews(context.reviews);
  const approvalCount = approvedBy.length;
  const changesRequested = hasChangesRequested(context.reviews);

  const failedCount = approvalCount < requiredApprovals;
  const failedChanges = requireNoChangesRequested && changesRequested;

  if (failedCount) {
    return {
      passed: false,
      message: `PR requires at least ${requiredApprovals} approval(s), but only has ${approvalCount}.`,
      approvalCount,
      requiredApprovals,
      changesRequested,
      approvedBy,
    };
  }

  if (failedChanges) {
    return {
      passed: false,
      message: "PR has outstanding changes requested and cannot be merged.",
      approvalCount,
      requiredApprovals,
      changesRequested,
      approvedBy,
    };
  }

  return {
    passed: true,
    message: `PR has ${approvalCount} approval(s) and meets all review requirements.`,
    approvalCount,
    requiredApprovals,
    changesRequested,
    approvedBy,
  };
}
