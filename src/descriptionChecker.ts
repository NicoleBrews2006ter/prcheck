import * as core from '@actions/core';

export interface DescriptionCheckResult {
  passed: boolean;
  missingPlaceholders: string[];
  missingRequiredSections: string[];
}

/**
 * Extracts placeholders from a template string.
 * Placeholders are defined as {{ PLACEHOLDER_NAME }}
 */
export function extractTemplatePlaceholders(template: string): string[] {
  const regex = /\{\{\s*([A-Z_]+)\s*\}\}/g;
  const placeholders: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1]);
  }
  return [...new Set(placeholders)];
}

/**
 * Checks whether required section headings are present in the PR description.
 */
export function checkRequiredSections(
  description: string,
  requiredSections: string[]
): string[] {
  if (!requiredSections.length) return [];
  return requiredSections.filter((section) => {
    const regex = new RegExp(`#+\\s*${escapeRegex(section)}`, 'i');
    return !regex.test(description);
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether a PR description fulfills the template requirements.
 * - All template placeholders must be replaced (no {{ PLACEHOLDER }} left).
 * - All required sections must be present.
 */
export function checkDescription(
  description: string | null | undefined,
  template: string,
  requiredSections: string[]
): DescriptionCheckResult {
  if (!description || description.trim() === '') {
    core.warning('PR description is empty.');
    const placeholders = extractTemplatePlaceholders(template);
    const missingSections = checkRequiredSections('', requiredSections);
    return {
      passed: false,
      missingPlaceholders: placeholders,
      missingRequiredSections: missingSections,
    };
  }

  const missingPlaceholders = extractTemplatePlaceholders(description);
  const missingRequiredSections = checkRequiredSections(
    description,
    requiredSections
  );

  const passed =
    missingPlaceholders.length === 0 && missingRequiredSections.length === 0;

  return { passed, missingPlaceholders, missingRequiredSections };
}
