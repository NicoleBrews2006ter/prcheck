import { loadCommitCheckerConfig, buildCommitCheckerSummary } from '../commitCheckerConfig';
import * as core from '@actions/core';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

describe('loadCommitCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadCommitCheckerConfig();
    expect(config.conventionalCommits).toBe(false);
    expect(config.maxCommits).toBeNull();
    expect(config.requireSignedCommits).toBe(false);
  });

  it('parses conventional_commits=true', () => {
    setupInputs({ conventional_commits: 'true' });
    const config = loadCommitCheckerConfig();
    expect(config.conventionalCommits).toBe(true);
  });

  it('parses max_commits as integer', () => {
    setupInputs({ max_commits: '10' });
    const config = loadCommitCheckerConfig();
    expect(config.maxCommits).toBe(10);
  });

  it('treats non-numeric max_commits as null', () => {
    setupInputs({ max_commits: 'abc' });
    const config = loadCommitCheckerConfig();
    expect(config.maxCommits).toBeNull();
  });

  it('parses require_signed_commits=true', () => {
    setupInputs({ require_signed_commits: 'true' });
    const config = loadCommitCheckerConfig();
    expect(config.requireSignedCommits).toBe(true);
  });
});

describe('buildCommitCheckerSummary', () => {
  it('includes all config values in summary', () => {
    const summary = buildCommitCheckerSummary({
      conventionalCommits: true,
      maxCommits: 5,
      requireSignedCommits: true,
    });
    expect(summary).toContain('enabled');
    expect(summary).toContain('Max Commits: 5');
    expect(summary).toContain('yes');
  });

  it('shows unlimited when maxCommits is null', () => {
    const summary = buildCommitCheckerSummary({
      conventionalCommits: false,
      maxCommits: null,
      requireSignedCommits: false,
    });
    expect(summary).toContain('unlimited');
  });
});
