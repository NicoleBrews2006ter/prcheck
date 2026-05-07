import * as core from '@actions/core';
import { parseCommaSeparated } from './config';

export interface LinkedIssueCheckerConfig {
  enabled: boolean;
  required: boolean;
  allowedKeywords: string[];
}

const DEFAULT_KEYWORDS = ['closes', 'close', 'closed', 'fixes', 'fix', 'fixed', 'resolves', 'resolve', 'resolved'];

export function loadLinkedIssueCheckerConfig(): LinkedIssueCheckerConfig {
  const enabled = core.getInput('linked_issue_enabled').toLowerCase() !== 'false';
  const required = core.getInput('linked_issue_required').toLowerCase() !== 'false';
  const keywordsInput = core.getInput('linked_issue_keywords');
  const allowedKeywords =
    keywordsInput.trim().length > 0 ? parseCommaSeparated(keywordsInput) : DEFAULT_KEYWORDS;

  return { enabled, required, allowedKeywords };
}

export function buildLinkedIssueCheckerSummary(config: LinkedIssueCheckerConfig): string {
  const lines: string[] = ['**Linked Issue Checker**'];
  lines.push(`- Enabled: ${config.enabled}`);
  lines.push(`- Required: ${config.required}`);
  lines.push(`- Allowed keywords: ${config.allowedKeywords.join(', ')}`);
  return lines.join('\n');
}
