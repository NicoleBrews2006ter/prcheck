import * as core from "@actions/core";
import { parseCommaSeparated } from "./config";
import { FileCheckerConfig } from "./fileChecker";

export function loadFileCheckerConfig(): FileCheckerConfig {
  const forbiddenFiles = parseCommaSeparated(
    core.getInput("forbidden-files")
  );
  const requiredFiles = parseCommaSeparated(
    core.getInput("required-files")
  );
  const maxFilesChangedRaw = core.getInput("max-files-changed");
  const maxFilesChanged = maxFilesChangedRaw
    ? parseInt(maxFilesChangedRaw, 10)
    : 0;

  return {
    forbiddenFiles,
    requiredFiles,
    maxFilesChanged: isNaN(maxFilesChanged) ? 0 : maxFilesChanged,
  };
}

export function buildFileCheckerSummary(
  forbiddenFound: string[],
  requiredMissing: string[],
  filesChanged: number,
  maxFilesChanged: number
): string {
  const lines: string[] = [];

  if (forbiddenFound.length > 0) {
    lines.push(
      `Forbidden files found: ${forbiddenFound.join(", ")}`
    );
  }

  if (requiredMissing.length > 0) {
    lines.push(
      `Required files missing: ${requiredMissing.join(", ")}`
    );
  }

  if (maxFilesChanged > 0 && filesChanged > maxFilesChanged) {
    lines.push(
      `Too many files changed: ${filesChanged} (max: ${maxFilesChanged})`
    );
  }

  return lines.join("\n");
}
