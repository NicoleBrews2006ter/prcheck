import { checkChecklist, extractChecksumMetrics, ChecksumContext } from '../checksumChecker';

function makeContext(overrides: Partial<ChecksumContext['pull_request']> = {}): ChecksumContext {
  return {
    pull_request: {
      body: null,
      changed_files: 3,
      additions: 10,
      deletions: 5,
      ...overrides,
    },
  };
}

describe('extractChecksumMetrics', () => {
  it('returns correct metrics from context', () => {
    const ctx = makeContext({ changed_files: 4, additions: 20, deletions: 8 });
    const metrics = extractChecksumMetrics(ctx);
    expect(metrics.changedFiles).toBe(4);
    expect(metrics.additions).toBe(20);
    expect(metrics.deletions).toBe(8);
    expect(metrics.totalChanges).toBe(28);
  });

  it('handles null/undefined values gracefully', () => {
    const ctx: ChecksumContext = {
      pull_request: { body: null, changed_files: 0, additions: 0, deletions: 0 },
    };
    const metrics = extractChecksumMetrics(ctx);
    expect(metrics.totalChanges).toBe(0);
  });
});

describe('checkChecklist', () => {
  it('passes when checklist not required', () => {
    const ctx = makeContext({ body: '' });
    const result = checkChecklist(ctx, false);
    expect(result.passed).toBe(true);
  });

  it('fails when body is empty and checklist is required', () => {
    const ctx = makeContext({ body: '' });
    const result = checkChecklist(ctx, true);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('does not contain a completed checklist item');
  });

  it('fails when there are unchecked items', () => {
    const ctx = makeContext({ body: '- [x] Done\n- [ ] Not done' });
    const result = checkChecklist(ctx, true);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('1 unchecked checklist item(s)');
  });

  it('passes when all checklist items are checked', () => {
    const ctx = makeContext({ body: '- [x] Task one\n- [x] Task two' });
    const result = checkChecklist(ctx, true);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('All checklist items are checked');
  });

  it('uses a custom pattern when provided', () => {
    const ctx = makeContext({ body: '* [x] Custom item' });
    const result = checkChecklist(ctx, true, '\\* \\[x\\]');
    expect(result.passed).toBe(true);
  });

  it('fails with custom pattern when no match found', () => {
    const ctx = makeContext({ body: '- [x] Standard item' });
    const result = checkChecklist(ctx, true, '\\* \\[x\\]');
    expect(result.passed).toBe(false);
  });
});
