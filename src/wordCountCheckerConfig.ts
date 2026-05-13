import * as core from '@actions/core';

export interface WordCountCheckerConfig {
  enabled: boolean;
  minBodyWords: number;
  maxBodyWords: number;
  minTitleWords: number;
  maxTitleWords: number;
}

export function loadWordCountCheckerConfig(): WordCountCheckerConfig {
  const enabled = core.getInput('word-count-enabled').toLowerCase() !== 'false';
  const minBodyWords = parseInt(core.getInput('word-count-min-body') || '0', 10);
  const maxBodyWords = parseInt(core.getInput('word-count-max-body') || '0', 10);
  const minTitleWords = parseInt(core.getInput('word-count-min-title') || '0', 10);
  const maxTitleWords = parseInt(core.getInput('word-count-max-title') || '0', 10);

  return {
    enabled,
    minBodyWords: isNaN(minBodyWords) ? 0 : minBodyWords,
    maxBodyWords: isNaN(maxBodyWords) ? 0 : maxBodyWords,
    minTitleWords: isNaN(minTitleWords) ? 0 : minTitleWords,
    maxTitleWords: isNaN(maxTitleWords) ? 0 : maxTitleWords,
  };
}

export function buildWordCountCheckerSummary(config: WordCountCheckerConfig): string {
  const lines: string[] = ['**Word Count Checker**'];
  if (config.minBodyWords > 0) lines.push(`- Min body words: ${config.minBodyWords}`);
  if (config.maxBodyWords > 0) lines.push(`- Max body words: ${config.maxBodyWords}`);
  if (config.minTitleWords > 0) lines.push(`- Min title words: ${config.minTitleWords}`);
  if (config.maxTitleWords > 0) lines.push(`- Max title words: ${config.maxTitleWords}`);
  return lines.join('\n');
}
