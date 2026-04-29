import {
  extractTemplatePlaceholders,
  checkRequiredSections,
  checkDescription,
} from '../descriptionChecker';

jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('extractTemplatePlaceholders', () => {
  it('returns empty array when no placeholders', () => {
    expect(extractTemplatePlaceholders('No placeholders here.')).toEqual([]);
  });

  it('extracts single placeholder', () => {
    expect(extractTemplatePlaceholders('Hello {{ NAME }}')).toEqual(['NAME']);
  });

  it('extracts multiple unique placeholders', () => {
    const result = extractTemplatePlaceholders(
      '{{ TITLE }} and {{ DESCRIPTION }} and {{ TITLE }} again'
    );
    expect(result).toEqual(['TITLE', 'DESCRIPTION']);
  });

  it('ignores lowercase or mixed case (only uppercase matches)', () => {
    expect(extractTemplatePlaceholders('{{ title }}')).toEqual([]);
  });
});

describe('checkRequiredSections', () => {
  it('returns empty array when no required sections', () => {
    expect(checkRequiredSections('any description', [])).toEqual([]);
  });

  it('returns missing sections', () => {
    const missing = checkRequiredSections('## Summary\nSome text', [
      'Summary',
      'Testing',
    ]);
    expect(missing).toEqual(['Testing']);
  });

  it('passes when all sections present', () => {
    const description = '## Summary\ntext\n## Testing\nmore text';
    expect(checkRequiredSections(description, ['Summary', 'Testing'])).toEqual(
      []
    );
  });

  it('is case-insensitive', () => {
    expect(
      checkRequiredSections('## summary\ntext', ['Summary'])
    ).toEqual([]);
  });
});

describe('checkDescription', () => {
  const template = '## Summary\n{{ SUMMARY }}\n## Testing\n{{ TESTING_NOTES }}';

  it('fails when description is empty', () => {
    const result = checkDescription('', template, ['Summary']);
    expect(result.passed).toBe(false);
    expect(result.missingPlaceholders).toContain('SUMMARY');
  });

  it('fails when placeholders remain unfilled', () => {
    const result = checkDescription(
      '## Summary\n{{ SUMMARY }}\n## Testing\ndone',
      template,
      ['Summary', 'Testing']
    );
    expect(result.passed).toBe(false);
    expect(result.missingPlaceholders).toEqual(['SUMMARY']);
  });

  it('fails when required sections are missing', () => {
    const result = checkDescription(
      '## Summary\nAll good here.',
      template,
      ['Summary', 'Testing']
    );
    expect(result.passed).toBe(false);
    expect(result.missingRequiredSections).toEqual(['Testing']);
  });

  it('passes when description is complete', () => {
    const description = '## Summary\nFixed the bug.\n## Testing\nRan unit tests.';
    const result = checkDescription(description, template, [
      'Summary',
      'Testing',
    ]);
    expect(result.passed).toBe(true);
    expect(result.missingPlaceholders).toEqual([]);
    expect(result.missingRequiredSections).toEqual([]);
  });
});
