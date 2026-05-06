import { checkAssignees, extractAssigneeLogins, AssigneeCheckerConfig } from '../assigneeChecker';

const defaultConfig: AssigneeCheckerConfig = {
  requireAssignee: false,
  minAssignees: 0,
  maxAssignees: 0,
  allowedAssignees: [],
};

function makeContext(logins: string[]) {
  return { assignees: logins.map((login) => ({ login })) };
}

describe('extractAssigneeLogins', () => {
  it('returns empty array when no assignees', () => {
    expect(extractAssigneeLogins(makeContext([]))).toEqual([]);
  });

  it('returns logins from assignees', () => {
    expect(extractAssigneeLogins(makeContext(['alice', 'bob']))).toEqual(['alice', 'bob']);
  });
});

describe('checkAssignees', () => {
  it('passes when no constraints and no assignees', () => {
    const result = checkAssignees(makeContext([]), defaultConfig);
    expect(result.passed).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  it('fails when requireAssignee is true and no assignees present', () => {
    const config = { ...defaultConfig, requireAssignee: true };
    const result = checkAssignees(makeContext([]), config);
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/at least one assignee/);
  });

  it('passes when requireAssignee is true and assignee is present', () => {
    const config = { ...defaultConfig, requireAssignee: true };
    const result = checkAssignees(makeContext(['alice']), config);
    expect(result.passed).toBe(true);
  });

  it('fails when count is below minAssignees', () => {
    const config = { ...defaultConfig, minAssignees: 2 };
    const result = checkAssignees(makeContext(['alice']), config);
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/at least 2/);
  });

  it('fails when count exceeds maxAssignees', () => {
    const config = { ...defaultConfig, maxAssignees: 1 };
    const result = checkAssignees(makeContext(['alice', 'bob']), config);
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/no more than 1/);
  });

  it('passes when count is within min and max bounds', () => {
    const config = { ...defaultConfig, minAssignees: 1, maxAssignees: 3 };
    const result = checkAssignees(makeContext(['alice', 'bob']), config);
    expect(result.passed).toBe(true);
  });

  it('fails when assignee is not in allowedAssignees list', () => {
    const config = { ...defaultConfig, allowedAssignees: ['alice'] };
    const result = checkAssignees(makeContext(['alice', 'charlie']), config);
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/charlie/);
  });

  it('passes when all assignees are in allowedAssignees list', () => {
    const config = { ...defaultConfig, allowedAssignees: ['alice', 'bob'] };
    const result = checkAssignees(makeContext(['alice', 'bob']), config);
    expect(result.passed).toBe(true);
  });
});
