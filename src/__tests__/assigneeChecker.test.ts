import { extractAssigneeLogins, checkAssignees } from '../assigneeChecker';

function makeContext(assignees: { login: string }[]) {
  return {
    payload: {
      pull_request: {
        assignees,
      },
    },
  };
}

describe('extractAssigneeLogins', () => {
  it('returns empty array when no assignees', () => {
    const ctx = makeContext([]);
    expect(extractAssigneeLogins(ctx as any)).toEqual([]);
  });

  it('extracts login names from assignees', () => {
    const ctx = makeContext([{ login: 'alice' }, { login: 'bob' }]);
    expect(extractAssigneeLogins(ctx as any)).toEqual(['alice', 'bob']);
  });

  it('returns empty array when pull_request is missing', () => {
    expect(extractAssigneeLogins({ payload: {} } as any)).toEqual([]);
  });
});

describe('checkAssignees', () => {
  it('passes when assignee count meets minimum', () => {
    const result = checkAssignees(['alice'], { minAssignees: 1, maxAssignees: 0, requiredAssignees: [] });
    expect(result.passed).toBe(true);
  });

  it('fails when fewer assignees than minimum', () => {
    const result = checkAssignees([], { minAssignees: 1, maxAssignees: 0, requiredAssignees: [] });
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/at least 1/);
  });

  it('fails when more assignees than maximum', () => {
    const result = checkAssignees(['alice', 'bob', 'carol'], { minAssignees: 1, maxAssignees: 2, requiredAssignees: [] });
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/at most 2/);
  });

  it('passes when max is 0 (unlimited)', () => {
    const result = checkAssignees(['alice', 'bob', 'carol'], { minAssignees: 1, maxAssignees: 0, requiredAssignees: [] });
    expect(result.passed).toBe(true);
  });

  it('fails when required assignee is missing', () => {
    const result = checkAssignees(['alice'], { minAssignees: 1, maxAssignees: 0, requiredAssignees: ['bob'] });
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/bob/);
  });

  it('passes when all required assignees are present', () => {
    const result = checkAssignees(['alice', 'bob'], { minAssignees: 1, maxAssignees: 0, requiredAssignees: ['bob'] });
    expect(result.passed).toBe(true);
  });
});
