import { CheckResult } from './reporter';

export interface ChecksumContext {
  pull_request: {
    body: string | null;
    changed_files: number;
    additions: number;
    deletions: number;
  };
}

export interface ChecksumMetrics {
  changedFiles: number;
  additions: number;
  deletions: number;
  totalChanges: number;
}

export function extractChecksumMetrics(context: ChecksumContext): ChecksumMetrics {
  const { changed_files, additions, deletions } = context.pull_request;
  return {
    changedFiles: changed_files ?? 0,
    additions: additions ?? 0,
    deletions: deletions ?? 0,
    totalChanges: (additions ?? 0) + (deletions ?? 0),
  };
}

export function checkBodyChecksum(
  context: ChecksumContext,
  requireChecklist: boolean,
  checklistPattern: RegExp
): CheckResult {
  if (!requireChecklist) {
    return { passed: true, message: 'Checklist check skipped.' };
  }

  const body = context.pull_request.body ?? '';
  const matches = body.match(checklistPattern);

  if (!matches || matches.length === 0) {
    return {
      passed: false,
      message: 'PR description does not contain a completed checklist item.',
    };
  }

  const unchecked = body.match(/- \[ \]/g);
  if (unchecked && unchecked.length > 0) {
    return {
      passed: false,
      message: `PR description has ${unchecked.length} unchecked checklist item(s).`,
    };
  }

  return { passed: true, message: `All checklist items are checked.` };
}

export function checkChecklist(
  context: ChecksumContext,
  requireChecklist: boolean,
  pattern?: string
): CheckResult {
  const checklistPattern = pattern
    ? new RegExp(pattern)
    : /- \[x\]/gi;

  return checkBodyChecksum(context, requireChecklist, checklistPattern);
}
