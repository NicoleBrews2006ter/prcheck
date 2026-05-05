import { loadMergeCheckerConfig, buildMergeCheckerSummary } from '../mergeCheckerConfig';
import * as core from '@actions/core';

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  debug: jest.fn(),
}));

const mockGetInput = core.getInput as jest.Mock;

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    allowed_base_branches: 'main,develop',
    allowed_merge_methods: 'squash',
    require_up_to_date: 'true',
    block_draft_merge: 'true',
  };
  mockGetInput.mockImplementation((key: string) => overrides[key] ?? defaults[key] ?? '');
}

describe('loadMergeCheckerConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('parses allowed base branches', () => {
    setupInputs();
    const config = loadMergeCheckerConfig();
    expect(config.allowedBaseBranches).toEqual(['main', 'develop']);
  });

  it('parses allowed merge methods', () => {
    setupInputs();
    const config = loadMergeCheckerConfig();
    expect(config.allowedMergeMethods).toEqual(['squash']);
  });

  it('defaults requireUpToDate to true', () => {
    setupInputs({ require_up_to_date: '' });
    const config = loadMergeCheckerConfig();
    expect(config.requireUpToDate).toBe(true);
  });

  it('sets requireUpToDate to false when explicitly false', () => {
    setupInputs({ require_up_to_date: 'false' });
    const config = loadMergeCheckerConfig();
    expect(config.requireUpToDate).toBe(false);
  });

  it('handles empty inputs gracefully', () => {
    setupInputs({ allowed_base_branches: '', allowed_merge_methods: '' });
    const config = loadMergeCheckerConfig();
    expect(config.allowedBaseBranches).toEqual([]);
    expect(config.allowedMergeMethods).toEqual([]);
  });
});

describe('buildMergeCheckerSummary', () => {
  it('includes all config details', () => {
    const summary = buildMergeCheckerSummary({
      allowedBaseBranches: ['main'],
      allowedMergeMethods: ['squash'],
      requireUpToDate: true,
      blockDraftMerge: false,
    });
    expect(summary).toContain('main');
    expect(summary).toContain('squash');
    expect(summary).toContain('true');
    expect(summary).toContain('false');
  });

  it('omits branch/method lines when lists are empty', () => {
    const summary = buildMergeCheckerSummary({
      allowedBaseBranches: [],
      allowedMergeMethods: [],
      requireUpToDate: true,
      blockDraftMerge: true,
    });
    expect(summary).not.toContain('Allowed base branches');
    expect(summary).not.toContain('Allowed merge methods');
  });
});
