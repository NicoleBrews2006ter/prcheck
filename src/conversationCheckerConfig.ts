import * as core from '@actions/core';

export interface ConversationCheckerConfig {
  requireResolved: boolean;
  maxUnresolved: number;
}

export function loadConversationCheckerConfig(): ConversationCheckerConfig {
  const requireResolved =
    core.getInput('conversation_require_resolved').toLowerCase() !== 'false';
  const maxUnresolvedRaw = core.getInput('conversation_max_unresolved');
  const maxUnresolved =
    maxUnresolvedRaw !== '' ? parseInt(maxUnresolvedRaw, 10) : 0;

  return {
    requireResolved,
    maxUnresolved: isNaN(maxUnresolved) ? 0 : maxUnresolved,
  };
}

export function buildConversationCheckerSummary(
  requireResolved: boolean,
  maxUnresolved: number
): string {
  if (!requireResolved) {
    return 'Conversation checker: disabled.';
  }
  return `Conversation checker: require all resolved, max unresolved allowed: ${maxUnresolved}.`;
}
