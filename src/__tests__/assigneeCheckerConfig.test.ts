import { loadAssigneeCheckerConfig, buildAssigneeCheckerSummary } from '../assigneeCheckerConfig';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(require('@actions/core'), 'getInput').mockImplementation((name: string) => {
    return inputs[name] ?? '';
  });
}

describe('loadAssigneeCheckerConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadAssigneeCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.minAssignees).toBe(1);
    expect(config.maxAssignees).toBe(0);
    expect(config.requiredAssignees).toEqual([]);
  });

  it('disables check when assignee-check-enabled is false', () => {
    setupInputs({ 'assignee-check-enabled': 'false' });
    const config = loadAssigneeCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it('parses min and max assignees', () => {
    setupInputs({ 'min-assignees': '2', 'max-assignees': '5' });
    const config = loadAssigneeCheckerConfig();
    expect(config.minAssignees).toBe(2);
    expect(config.maxAssignees).toBe(5);
  });

  it('parses required assignees from comma-separated string', () => {
    setupInputs({ 'required-assignees': 'alice, bob, carol' });
    const config = loadAssigneeCheckerConfig();
    expect(config.requiredAssignees).toEqual(['alice', 'bob', 'carol']);
  });

  it('falls back to defaults for invalid numeric inputs', () => {
    setupInputs({ 'min-assignees': 'abc', 'max-assignees': 'xyz' });
    const config = loadAssigneeCheckerConfig();
    expect(config.minAssignees).toBe(1);
    expect(config.maxAssignees).toBe(0);
  });
});

describe('buildAssigneeCheckerSummary', () => {
  it('includes enabled status and min assignees', () => {
    const summary = buildAssigneeCheckerSummary({
      enabled: true,
      minAssignees: 1,
      maxAssignees: 0,
      requiredAssignees: [],
    });
    expect(summary).toContain('Assignee check enabled: true');
    expect(summary).toContain('Min assignees: 1');
    expect(summary).not.toContain('Max assignees');
  });

  it('includes max assignees when set', () => {
    const summary = buildAssigneeCheckerSummary({
      enabled: true,
      minAssignees: 1,
      maxAssignees: 3,
      requiredAssignees: [],
    });
    expect(summary).toContain('Max assignees: 3');
  });

  it('includes required assignees when provided', () => {
    const summary = buildAssigneeCheckerSummary({
      enabled: true,
      minAssignees: 1,
      maxAssignees: 0,
      requiredAssignees: ['alice', 'bob'],
    });
    expect(summary).toContain('Required assignees: alice, bob');
  });
});
