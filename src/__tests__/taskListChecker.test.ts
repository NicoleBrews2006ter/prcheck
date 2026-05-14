import { extractTaskListMetrics, checkTaskList } from '../taskListChecker';

function makeContext(body: string | null) {
  return { payload: { pull_request: { body } } };
}

describe('extractTaskListMetrics', () => {
  it('returns zeros for empty body', () => {
    expect(extractTaskListMetrics('')).toEqual({ total: 0, checked: 0, unchecked: 0 });
  });

  it('counts checked and unchecked tasks', () => {
    const body = '- [x] Task one\n- [ ] Task two\n- [x] Task three';
    expect(extractTaskListMetrics(body)).toEqual({ total: 3, checked: 2, unchecked: 1 });
  });

  it('handles only checked tasks', () => {
    const body = '- [x] Done\n- [x] Also done';
    expect(extractTaskListMetrics(body)).toEqual({ total: 2, checked: 2, unchecked: 0 });
  });

  it('handles only unchecked tasks', () => {
    const body = '- [ ] Not done\n- [ ] Also not done';
    expect(extractTaskListMetrics(body)).toEqual({ total: 2, checked: 0, unchecked: 2 });
  });

  it('handles null body', () => {
    expect(extractTaskListMetrics(null as unknown as string)).toEqual({ total: 0, checked: 0, unchecked: 0 });
  });
});

describe('checkTaskList', () => {
  it('passes when no requirements set', () => {
    const ctx = makeContext('- [x] Task');
    const result = checkTaskList(ctx, false, 0, 0);
    expect(result.pass).toBe(true);
  });

  it('fails when requireAllChecked and unchecked tasks exist', () => {
    const ctx = makeContext('- [x] Done\n- [ ] Not done');
    const result = checkTaskList(ctx, true, 0, 0);
    expect(result.pass).toBe(false);
    expect(result.message).toContain('1 unchecked');
  });

  it('passes when requireAllChecked and all tasks checked', () => {
    const ctx = makeContext('- [x] Done\n- [x] Also done');
    const result = checkTaskList(ctx, true, 0, 0);
    expect(result.pass).toBe(true);
  });

  it('fails when minChecked not met', () => {
    const ctx = makeContext('- [x] One\n- [ ] Two');
    const result = checkTaskList(ctx, false, 3, 0);
    expect(result.pass).toBe(false);
    expect(result.message).toContain('3 task(s) must be checked');
  });

  it('fails when minTotal not met', () => {
    const ctx = makeContext('- [x] One');
    const result = checkTaskList(ctx, false, 0, 5);
    expect(result.pass).toBe(false);
    expect(result.message).toContain('at least 5 task(s)');
  });

  it('handles null body gracefully', () => {
    const ctx = makeContext(null);
    const result = checkTaskList(ctx, true, 0, 0);
    expect(result.pass).toBe(true);
  });
});
