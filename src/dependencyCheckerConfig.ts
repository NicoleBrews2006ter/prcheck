import * as core from '@actions/core';
import { DependencyCheckConfig } from './dependencyChecker';
import { parseCommaSeparated } from './config';

export function loadDependencyCheckerConfig(): DependencyCheckConfig {
  const requireLockfileUpdate =
    core.getInput('dependency_require_lockfile_update').toLowerCase() !== 'false';

  const lockfilePatterns = parseCommaSeparated(
    core.getInput('dependency_lockfile_patterns') ||
      'package-lock\.json,yarn\.lock,pnpm-lock\.yaml,Gemfile\.lock,poetry\.lock,go\.sum'
  );

  const manifestPatterns = parseCommaSeparated(
    core.getInput('dependency_manifest_patterns') ||
      'package\.json,Gemfile,pyproject\.toml,go\.mod,requirements\.txt'
  );

  return {
    requireLockfileUpdate,
    lockfilePatterns,
    manifestPatterns,
  };
}

export function buildDependencyCheckerSummary(config: DependencyCheckConfig): string {
  const lines: string[] = [
    `Require lockfile update: ${config.requireLockfileUpdate}`,
    `Lockfile patterns: ${config.lockfilePatterns.join(', ')}`,
    `Manifest patterns: ${config.manifestPatterns.join(', ')}`,
  ];
  return lines.join('\n');
}
