import * as core from '@actions/core';
import * as fs from 'fs';

export interface PRCheckConfig {
  requireLabels: boolean;
  allowedLabels: string[];
  requiredLabels: string[];
  descriptionTemplate: string;
  requiredSections: string[];
  failOnMissingDescription: boolean;
}

export function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function loadTemplateFromFile(templatePath: string): string {
  try {
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
  } catch (err) {
    core.warning(`Could not read template file at ${templatePath}: ${err}`);
  }
  return '';
}

export function loadConfig(): PRCheckConfig {
  const templatePath = core.getInput('description_template_path') || '.github/pull_request_template.md';
  const inlineTemplate = core.getInput('description_template');
  const descriptionTemplate = inlineTemplate || loadTemplateFromFile(templatePath);

  return {
    requireLabels: core.getInput('require_labels') === 'true',
    allowedLabels: parseCommaSeparated(core.getInput('allowed_labels')),
    requiredLabels: parseCommaSeparated(core.getInput('required_labels')),
    descriptionTemplate,
    requiredSections: parseCommaSeparated(core.getInput('required_sections')),
    failOnMissingDescription: core.getInput('fail_on_missing_description') !== 'false',
  };
}
