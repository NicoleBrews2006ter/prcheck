import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface AuthorContext {
  pull_request: {
    user: { login: string } | null;
    author_association: string;
  };
}

export function extractAuthorLogin(context: AuthorContext): string {
  return context.pull_request.user?.login ?? '';
}

export function extractAuthorAssociation(context: AuthorContext): string {
  return context.pull_request.author_association ?? '';
}

export function checkAuthor(
  context: AuthorContext,
  allowedAuthors: string[],
  allowedAssociations: string[],
  blockAuthors: string[]
): CheckResult {
  const login = extractAuthorLogin(context);
  const association = extractAuthorAssociation(context);

  if (blockAuthors.length > 0 && blockAuthors.includes(login)) {
    return {
      passed: false,
      message: `PR author "${login}" is in the blocked authors list.`,
    };
  }

  if (allowedAuthors.length > 0 && !allowedAuthors.includes(login)) {
    return {
      passed: false,
      message: `PR author "${login}" is not in the allowed authors list: [${allowedAuthors.join(', ')}].`,
    };
  }

  if (allowedAssociations.length > 0 && !allowedAssociations.includes(association)) {
    return {
      passed: false,
      message: `PR author association "${association}" is not in the allowed associations: [${allowedAssociations.join(', ')}].`,
    };
  }

  core.debug(`Author check passed for "${login}" (association: ${association})`);
  return {
    passed: true,
    message: `PR author "${login}" passed all author checks.`,
  };
}
