import { CheckResult } from './reporter';

export interface WordCountContext {
  pull_request: {
    body: string | null;
    title: string;
  };
}

export interface WordCountMetrics {
  bodyWordCount: number;
  titleWordCount: number;
}

export function countWords(text: string | null): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

export function extractWordCountMetrics(context: WordCountContext): WordCountMetrics {
  return {
    bodyWordCount: countWords(context.pull_request.body),
    titleWordCount: countWords(context.pull_request.title),
  };
}

export function checkWordCount(
  context: WordCountContext,
  minBodyWords: number,
  maxBodyWords: number,
  minTitleWords: number,
  maxTitleWords: number
): CheckResult {
  const { bodyWordCount, titleWordCount } = extractWordCountMetrics(context);
  const failures: string[] = [];

  if (minBodyWords > 0 && bodyWordCount < minBodyWords) {
    failures.push(
      `PR body has ${bodyWordCount} word(s), but at least ${minBodyWords} are required.`
    );
  }
  if (maxBodyWords > 0 && bodyWordCount > maxBodyWords) {
    failures.push(
      `PR body has ${bodyWordCount} word(s), but at most ${maxBodyWords} are allowed.`
    );
  }
  if (minTitleWords > 0 && titleWordCount < minTitleWords) {
    failures.push(
      `PR title has ${titleWordCount} word(s), but at least ${minTitleWords} are required.`
    );
  }
  if (maxTitleWords > 0 && titleWordCount > maxTitleWords) {
    failures.push(
      `PR title has ${titleWordCount} word(s), but at most ${maxTitleWords} are allowed.`
    );
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
