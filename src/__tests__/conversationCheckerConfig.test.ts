import * as core from '@actions/core';
import {
  loadConversationCheckerConfig,
  buildConversationCheckerSummary,
} from '../conversationCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

describe('loadConversationCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('defaults to requireResolved=true and maxUnresolved=0', () => {
    setupInputs({});
    const config = loadConversationCheckerConfig();
    expect(config.requireResolved).toBe(true);
    expect(config.maxUnresolved).toBe(0);
  });

  it('sets requireResolved to false when input is false', () => {
    setupInputs({ conversation_require_resolved: 'false' });
    const config = loadConversationCheckerConfig();
    expect(config.requireResolved).toBe(false);
  });

  it('parses maxUnresolved from input', () => {
    setupInputs({ conversation_max_unresolved: '3' });
    const config = loadConversationCheckerConfig();
    expect(config.maxUnresolved).toBe(3);
  });

  it('falls back to 0 for invalid maxUnresolved', () => {
    setupInputs({ conversation_max_unresolved: 'abc' });
    const config = loadConversationCheckerConfig();
    expect(config.maxUnresolved).toBe(0);
  });
});

describe('buildConversationCheckerSummary', () => {
  it('returns disabled message when requireResolved is false', () => {
    const summary = buildConversationCheckerSummary(false, 0);
    expect(summary).toContain('disabled');
  });

  it('returns summary with max unresolved when enabled', () => {
    const summary = buildConversationCheckerSummary(true, 2);
    expect(summary).toContain('2');
    expect(summary).toContain('max unresolved');
  });
});
