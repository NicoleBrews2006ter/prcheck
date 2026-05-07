import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';

export interface DiffCheckerConfig {
  maxAdditions: number | null;
  maxDeletions: number | null;
  maxChangedFiles: number | null;
  ignorePaths: string[];
}

export interface DiffMetrics {
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface DiffCheckResult {
  passed: boolean;
  metrics: DiffMetrics;
  violations: string[];
}

export async function extractDiffMetrics(
  client: InstanceType<typeof GitHub>,
  context: Context,
  ignorePaths: string[]
): Promise<DiffMetrics> {
  const { data: files } = await client.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request!.number,
    per_page: 100,
  });

  const filtered = ignorePaths.length
    ? files.filter((f) => !ignorePaths.some((p) => f.filename.startsWith(p)))
    : files;

  return {
    additions: filtered.reduce((sum, f) => sum + f.additions, 0),
    deletions: filtered.reduce((sum, f) => sum + f.deletions, 0),
    changedFiles: filtered.length,
  };
}

export function checkDiff(
  metrics: DiffMetrics,
  config: DiffCheckerConfig
): DiffCheckResult {
  const violations: string[] = [];

  if (config.maxAdditions !== null && metrics.additions > config.maxAdditions) {
    violations.push(
      `Additions (${metrics.additions}) exceed the maximum allowed (${config.maxAdditions}).`
    );
  }

  if (config.maxDeletions !== null && metrics.deletions > config.maxDeletions) {
    violations.push(
      `Deletions (${metrics.deletions}) exceed the maximum allowed (${config.maxDeletions}).`
    );
  }

  if (
    config.maxChangedFiles !== null &&
    metrics.changedFiles > config.maxChangedFiles
  ) {
    violations.push(
      `Changed files (${metrics.changedFiles}) exceed the maximum allowed (${config.maxChangedFiles}).`
    );
  }

  return { passed: violations.length === 0, metrics, violations };
}
