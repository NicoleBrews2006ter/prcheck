import { PullRequest } from "@octokit/webhooks-types";

export interface FileCheckerConfig {
  forbiddenFiles: string[];
  requiredFiles: string[];
  maxFilesChanged: number;
}

export interface FileCheckerResult {
  passed: boolean;
  forbiddenFound: string[];
  requiredMissing: string[];
  filesChanged: number;
  maxFilesChanged: number;
}

export function extractChangedFiles(
  pr: Pick<PullRequest, "changed_files">,
  fileNames: string[]
): string[] {
  return fileNames;
}

/**
 * Tests whether a filename matches a glob pattern.
 * Supports `*` (any sequence of characters) and `?` (any single character).
 *
 * @param pattern - Glob pattern to match against (e.g. `"*.ts"`, `"src/**"`)
 * @param filename - The filename or path to test
 * @returns `true` if the filename matches the pattern
 */
export function matchesGlob(pattern: string, filename: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`).test(filename);
}

/**
 * Checks a list of changed files against the provided configuration rules.
 *
 * @param config - Rules defining forbidden files, required files, and max file count
 * @param filesChanged - Total number of files changed in the pull request
 * @param fileNames - List of filenames changed in the pull request
 * @returns A result object describing which checks passed or failed
 */
export function checkFiles(
  config: FileCheckerConfig,
  filesChanged: number,
  fileNames: string[]
): FileCheckerResult {
  const forbiddenFound = fileNames.filter((file) =>
    config.forbiddenFiles.some((pattern) => matchesGlob(pattern, file))
  );

  const requiredMissing = config.requiredFiles.filter(
    (pattern) => !fileNames.some((file) => matchesGlob(pattern, file))
  );

  const passed =
    forbiddenFound.length === 0 &&
    requiredMissing.length === 0 &&
    (config.maxFilesChanged <= 0 || filesChanged <= config.maxFilesChanged);

  return {
    passed,
    forbiddenFound,
    requiredMissing,
    filesChanged,
    maxFilesChanged: config.maxFilesChanged,
  };
}
