import { checkLabels, extractPRLabels, LabelCheckerConfig } from '../labelChecker';

describe('checkLabels', () => {
  const baseConfig: LabelCheckerConfig = {
    requiredLabels: [],
    forbiddenLabels: [],
    requireAtLeastOne: false,
  };

  it('passes when no constraints are set', () => {
    const result = checkLabels(['bug'], baseConfig);
    expect(result.passed).toBe(true);
  });

  it('fails when required label is missing', () => {
    const config: LabelCheckerConfig = {
      ...baseConfig,
      requiredLabels: ['reviewed'],
    };
    const result = checkLabels(['bug'], config);
    expect(result.passed).toBe(false);
    expect(result.missingRequired).toContain('reviewed');
  });

  it('passes when all required labels are present', () => {
    const config: LabelCheckerConfig = {
      ...baseConfig,
      requiredLabels: ['reviewed', 'bug'],
    };
    const result = checkLabels(['reviewed', 'bug', 'urgent'], config);
    expect(result.passed).toBe(true);
    expect(result.missingRequired).toHaveLength(0);
  });

  it('fails when a forbidden label is present', () => {
    const config: LabelCheckerConfig = {
      ...baseConfig,
      forbiddenLabels: ['wip'],
    };
    const result = checkLabels(['wip', 'bug'], config);
    expect(result.passed).toBe(false);
    expect(result.foundForbidden).toContain('wip');
  });

  it('fails when requireAtLeastOne is true and no labels present', () => {
    const config: LabelCheckerConfig = {
      ...baseConfig,
      requireAtLeastOne: true,
    };
    const result = checkLabels([], config);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/at least one label/i);
  });

  it('includes all failure reasons in message', () => {
    const config: LabelCheckerConfig = {
      requiredLabels: ['approved'],
      forbiddenLabels: ['wip'],
      requireAtLeastOne: false,
    };
    const result = checkLabels(['wip'], config);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/approved/);
    expect(result.message).toMatch(/wip/);
  });
});

describe('extractPRLabels', () => {
  it('returns empty array when pull_request is undefined', () => {
    expect(extractPRLabels(undefined)).toEqual([]);
  });

  it('extracts label names from pull request payload', () => {
    const pr = { labels: [{ name: 'bug' }, { name: 'urgent' }] };
    expect(extractPRLabels(pr as any)).toEqual(['bug', 'urgent']);
  });

  it('filters out labels with no name', () => {
    const pr = { labels: [{ name: 'bug' }, {}, { name: '' }] };
    expect(extractPRLabels(pr as any)).toEqual(['bug']);
  });
});
