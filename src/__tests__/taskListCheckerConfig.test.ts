import * as core from '@actions/core';
import { loadTaskListCheckerConfig, buildTaskListCheckerSummary } from '../taskListCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadTaskListCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadTaskListCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.requireAllChecked).toBe(false);
    expect(config.minChecked).toBe(0);
    expect(config.minTotal).toBe(0);
  });

  it('disables checker when enabled is false', () => {
    setupInputs({ task_list_checker_enabled: 'false' });
    const config = loadTaskListCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it('sets requireAllChecked when input is true', () => {
    setupInputs({ task_list_require_all_checked: 'true' });
    const config = loadTaskListCheckerConfig();
    expect(config.requireAllChecked).toBe(true);
  });

  it('parses minChecked and minTotal correctly', () => {
    setupInputs({ task_list_min_checked: '2', task_list_min_total: '4' });
    const config = loadTaskListCheckerConfig();
    expect(config.minChecked).toBe(2);
    expect(config.minTotal).toBe(4);
  });

  it('defaults to 0 for invalid numeric inputs', () => {
    setupInputs({ task_list_min_checked: 'abc', task_list_min_total: 'xyz' });
    const config = loadTaskListCheckerConfig();
    expect(config.minChecked).toBe(0);
    expect(config.minTotal).toBe(0);
  });
});

describe('buildTaskListCheckerSummary', () => {
  it('includes all config fields in summary', () => {
    const config = { enabled: true, requireAllChecked: true, minChecked: 2, minTotal: 3 };
    const summary = buildTaskListCheckerSummary(config);
    expect(summary).toContain('Enabled: true');
    expect(summary).toContain('Require all checked: true');
    expect(summary).toContain('Min checked: 2');
    expect(summary).toContain('Min total tasks: 3');
  });
});
