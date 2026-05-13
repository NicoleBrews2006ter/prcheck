import {
  extractReviewThreads,
  countUnresolved,
  checkConversations,
  ReviewThread,
} from '../conversationChecker';

const makeThread = (isResolved: boolean, isOutdated = false): ReviewThread => ({
  isResolved,
  isOutdated,
});

describe('extractReviewThreads', () => {
  it('returns empty array when no threads provided', () => {
    expect(extractReviewThreads({})).toEqual([]);
  });

  it('returns threads from context', () => {
    const threads = [makeThread(true), makeThread(false)];
    expect(extractReviewThreads({ reviewThreads: threads })).toEqual(threads);
  });
});

describe('countUnresolved', () => {
  it('counts only unresolved and non-outdated threads', () => {
    const threads = [
      makeThread(false),
      makeThread(true),
      makeThread(false, true),
    ];
    expect(countUnresolved(threads)).toBe(1);
  });

  it('returns 0 when all resolved', () => {
    expect(countUnresolved([makeThread(true), makeThread(true)])).toBe(0);
  });
});

describe('checkConversations', () => {
  it('passes when requireResolved is false', () => {
    const result = checkConversations([makeThread(false)], false, 0);
    expect(result.passed).toBe(true);
    expect(result.summary).toContain('disabled');
  });

  it('passes when unresolved count is within limit', () => {
    const threads = [makeThread(false), makeThread(true)];
    const result = checkConversations(threads, true, 1);
    expect(result.passed).toBe(true);
    expect(result.unresolvedCount).toBe(1);
  });

  it('fails when unresolved count exceeds limit', () => {
    const threads = [makeThread(false), makeThread(false)];
    const result = checkConversations(threads, true, 1);
    expect(result.passed).toBe(false);
    expect(result.summary).toContain('2 unresolved');
  });

  it('passes with zero unresolved and limit 0', () => {
    const result = checkConversations([makeThread(true)], true, 0);
    expect(result.passed).toBe(true);
  });
});
