import { extractLinkedIssues, checkLinkedIssue } from '../linkedIssueChecker';

const DEFAULT_KEYWORDS = ['closes', 'fixes', 'resolves'];

describe('extractLinkedIssues', () => {
  it('extracts issue number from closes keyword', () => {
    expect(extractLinkedIssues('Closes #42')).toEqual(['42']);
  });

  it('extracts multiple issue numbers', () => {
    expect(extractLinkedIssues('Fixes #10\nResolves #20')).toEqual(['10', '20']);
  });

  it('extracts issue from full GitHub URL', () => {
    const body = 'Fixes https://github.com/owner/repo/issues/99';
    expect(extractLinkedIssues(body)).toEqual(['99']);
  });

  it('returns empty array when no issues found', () => {
    expect(extractLinkedIssues('No issues here')).toEqual([]);
  });

  it('deduplicates issue numbers', () => {
    expect(extractLinkedIssues('Closes #5\nFixes #5')).toEqual(['5']);
  });
});

describe('checkLinkedIssue', () => {
  it('passes when not required', () => {
    const result = checkLinkedIssue({ body: '' }, false, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(true);
  });

  it('fails when required and body is empty', () => {
    const result = checkLinkedIssue({ body: '' }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/empty/);
  });

  it('fails when required and no linked issue in body', () => {
    const result = checkLinkedIssue({ body: 'Some description without issue' }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/No linked issue/);
  });

  it('passes when body contains a valid linked issue', () => {
    const result = checkLinkedIssue({ body: 'Closes #123' }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/#123/);
  });

  it('passes with URL-based issue reference', () => {
    const body = 'Fixes https://github.com/owner/repo/issues/55';
    const result = checkLinkedIssue({ body }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(true);
  });

  it('handles null body as empty', () => {
    const result = checkLinkedIssue({ body: null }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(false);
  });

  it('is case-insensitive for keywords', () => {
    const result = checkLinkedIssue({ body: 'CLOSES #7' }, true, DEFAULT_KEYWORDS);
    expect(result.passed).toBe(true);
  });
});
