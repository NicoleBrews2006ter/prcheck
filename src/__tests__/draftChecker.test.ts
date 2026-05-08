import { checkDraft, isDraft, DraftContext, DraftCheckerConfig } from '../draftChecker';

const makeContext = (draft: boolean): DraftContext => ({
  pull_request: {
    draft,
    title: 'Test PR',
  },
});

const enabledConfig: DraftCheckerConfig = { enabled: true, failOnDraft: true };
const allowDraftConfig: DraftCheckerConfig = { enabled: true, failOnDraft: false };
const disabledConfig: DraftCheckerConfig = { enabled: false, failOnDraft: true };

describe('isDraft', () => {
  it('returns true when PR is a draft', () => {
    expect(isDraft(makeContext(true))).toBe(true);
  });

  it('returns false when PR is not a draft', () => {
    expect(isDraft(makeContext(false))).toBe(false);
  });
});

describe('checkDraft', () => {
  it('passes when check is disabled regardless of draft state', () => {
    const result = checkDraft(makeContext(true), disabledConfig);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/disabled/i);
  });

  it('passes when PR is not a draft', () => {
    const result = checkDraft(makeContext(false), enabledConfig);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/not a draft/i);
  });

  it('fails when PR is a draft and failOnDraft is true', () => {
    const result = checkDraft(makeContext(true), enabledConfig);
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/draft state/i);
    expect(result.details).toContain('Mark the PR as ready for review before merging.');
  });

  it('passes when PR is a draft but failOnDraft is false', () => {
    const result = checkDraft(makeContext(true), allowDraftConfig);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/draft state/i);
    expect(result.details[0]).toMatch(/allowed/i);
  });
});
