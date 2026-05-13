import { CheckResult } from './reporter';

export interface DependencyContext {
  pull_request: {
    body: string | null;
  };
  changedFiles: string[];
}

export interface DependencyCheckConfig {
  requireLockfileUpdate: boolean;
  lockfilePatterns: string[];
  manifestPatterns: string[];
}

export function extractChangedManifests(
  changedFiles: string[],
  manifestPatterns: string[]
): string[] {
  return changedFiles.filter((f) =>
    manifestPatterns.some((p) => new RegExp(p).test(f))
  );
}

export function extractChangedLockfiles(
  changedFiles: string[],
  lockfilePatterns: string[]
): string[] {
  return changedFiles.filter((f) =>
    lockfilePatterns.some((p) => new RegExp(p).test(f))
  );
}

export function checkDependency(
  context: DependencyContext,
  config: DependencyCheckConfig
): CheckResult {
  if (!config.requireLockfileUpdate) {
    return { passed: true, summary: 'Dependency lockfile check is disabled.' };
  }

  const changedManifests = extractChangedManifests(
    context.changedFiles,
    config.manifestPatterns
  );

  if (changedManifests.length === 0) {
    return { passed: true, summary: 'No dependency manifests changed.' };
  }

  const changedLockfiles = extractChangedLockfiles(
    context.changedFiles,
    config.lockfilePatterns
  );

  if (changedLockfiles.length === 0) {
    return {
      passed: false,
      summary: `Dependency manifests changed (${changedManifests.join(', ')}) but no lockfile was updated. Please update the lockfile.`,
    };
  }

  return {
    passed: true,
    summary: `Lockfile updated alongside manifest changes. (${changedLockfiles.join(', ')})`,
  };
}
