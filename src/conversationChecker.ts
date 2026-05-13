import * as github from '@actions/github';

export interface ConversationCheckResult {
  passed: boolean;
  unresolvedCount: number;
  totalCount: number;
  summary: string;
}

export interface ReviewThread {
  isResolved: boolean;
  isOutdated: boolean;
}

export function extractReviewThreads(
  context: { reviewThreads?: ReviewThread[] }
): ReviewThread[] {
  return context.reviewThreads ?? [];
}

export function countUnresolved(threads: ReviewThread[]): number {
  return threads.filter((t) => !t.isResolved && !t.isOutdated).length;
}

export function checkConversations(
  threads: ReviewThread[],
  requireResolved: boolean,
  maxUnresolved: number
): ConversationCheckResult {
  const totalCount = threads.length;
  const unresolvedCount = countUnresolved(threads);

  if (!requireResolved) {
    return {
      passed: true,
      unresolvedCount,
      totalCount,
      summary: 'Conversation resolution check is disabled.',
    };
  }

  const passed = unresolvedCount <= maxUnresolved;
  const summary = passed
    ? `All conversations resolved (${unresolvedCount} unresolved, limit: ${maxUnresolved}).`
    : `Found ${unresolvedCount} unresolved conversation(s) (limit: ${maxUnresolved}).`;

  return { passed, unresolvedCount, totalCount, summary };
}
