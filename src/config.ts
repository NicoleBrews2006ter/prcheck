import * as core from '@actions/core';
import { LabelCheckerConfig } from './labelChecker';

export interface ActionConfig {
  labelChecker: LabelCheckerConfig;
  failOnError: boolean;
}

function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(): ActionConfig {
  const requiredLabels = parseCommaSeparated(
    core.getInput('required-labels') || ''
  );
  const forbiddenLabels = parseCommaSeparated(
    core.getInput('forbidden-labels') || ''
  );
  const requireAtLeastOne =
    core.getInput('require-at-least-one-label') === 'true';
  const failOnError = core.getInput('fail-on-error') !== 'false';

  core.debug(`Required labels: ${requiredLabels.join(', ') || 'none'}`);
  core.debug(`Forbidden labels: ${forbiddenLabels.join(', ') || 'none'}`);
  core.debug(`Require at least one: ${requireAtLeastOne}`);

  return {
    labelChecker: {
      requiredLabels,
      forbiddenLabels,
      requireAtLeastOne,
    },
    failOnError,
  };
}
