import { countWords, extractWordCountMetrics, checkWordCount, WordCountContext } from '../wordCountChecker';

function makeContext(body: string | null, title: string): WordCountContext {
  return { pull_request: { body, title } };
}

describe('countWords', () => {
  it('returns 0 for null', () => {
    expect(countWords(null)).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('fix the broken thing')).toBe(4);
  });

  it('handles extra whitespace between words', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });
});

describe('extractWordCountMetrics', () => {
  it('extracts body and title word counts', () => {
    const ctx = makeContext('this is a description', 'fix bug');
    expect(extractWordCountMetrics(ctx)).toEqual({ bodyWordCount: 4, titleWordCount: 2 });
  });

  it('handles null body', () => {
    const ctx = makeContext(null, 'fix bug');
    expect(extractWordCountMetrics(ctx)).toEqual({ bodyWordCount: 0, titleWordCount: 2 });
  });
});

describe('checkWordCount', () => {
  it('passes when no limits set', () => {
    const result = checkWordCount(makeContext('hello world', 'fix'), 0, 0, 0, 0);
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('fails when body is below min', () => {
    const result = checkWordCount(makeContext('short', 'title'), 5, 0, 0, 0);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toMatch(/body has 1 word/);
  });

  it('fails when body exceeds max', () => {
    const result = checkWordCount(makeContext('one two three four five', 'title'), 0, 3, 0, 0);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toMatch(/body has 5 word/);
  });

  it('fails when title is below min', () => {
    const result = checkWordCount(makeContext('body text here', 'fix'), 0, 0, 2, 0);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toMatch(/title has 1 word/);
  });

  it('fails when title exceeds max', () => {
    const result = checkWordCount(makeContext('body', 'one two three four'), 0, 0, 0, 2);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toMatch(/title has 4 word/);
  });

  it('reports multiple failures', () => {
    const result = checkWordCount(makeContext(null, 'x'), 10, 0, 3, 0);
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(2);
  });

  it('passes when within all limits', () => {
    const result = checkWordCount(makeContext('a b c d e', 'fix the bug'), 3, 10, 2, 5);
    expect(result.passed).toBe(true);
  });
});
