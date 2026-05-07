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

export function matchesGlob(pattern: string, filename: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`).test(filename);
}

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
