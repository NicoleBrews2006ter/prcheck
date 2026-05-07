import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface LinkedIssueContext {
  body: string | null;
}

const ISSUE_PATTERNS = [
  /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi,
  /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+https?:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/(\d+)/gi,
];

export function extractLinkedIssues(body: string): string[] {
  const issues: string[] = [];
  for (const pattern of ISSUE_PATTERNS) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(body)) !== null) {
      issues.push(match[1]);
    }
  }
  return [...new Set(issues)];
}

export function checkLinkedIssue(
  context: LinkedIssueContext,
  required: boolean,
  allowedKeywords: string[]
): CheckResult {
  if (!required) {
    return { passed: true, summary: 'Linked issue check skipped (not required).' };
  }

  const body = context.body ?? '';

  if (!body.trim()) {
    core.warning('PR body is empty; cannot check for linked issues.');
    return { passed: false, summary: 'PR description is empty. A linked issue is required.' };
  }

  const keywordPattern = allowedKeywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const dynamicPattern = new RegExp(
    `(?:${keywordPattern})\\s+(?:#\\d+|https?:\/\/github\.com\/[\\w-]+\/[\\w-]+\/issues\/\\d+)`,
    'gi'
  );

  const found = dynamicPattern.test(body);

  if (!found) {
    return {
      passed: false,
      summary: `No linked issue found. Use one of the keywords (${allowedKeywords.join(', ')}) followed by an issue reference.`,
    };
  }

  const issues = extractLinkedIssues(body);
  return {
    passed: true,
    summary: `Linked issue(s) found: ${issues.length > 0 ? issues.map((i) => `#${i}`).join(', ') : 'via URL reference'}.`,
  };
}
