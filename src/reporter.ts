import * as core from "@actions/core";

export type CheckStatus = "pass" | "fail" | "skip";

export interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  details?: string[];
}

export interface ReportSummary {
  passed: number;
  failed: number;
  skipped: number;
  results: CheckResult[];
}

export function createCheckResult(
  name: string,
  status: CheckStatus,
  message: string,
  details?: string[]
): CheckResult {
  return { name, status, message, details };
}

export function buildSummary(results: CheckResult[]): ReportSummary {
  return {
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    skipped: results.filter((r) => r.status === "skip").length,
    results,
  };
}

export function logReport(summary: ReportSummary): void {
  core.info("\n===== PR Check Report =====");

  for (const result of summary.results) {
    const icon =
      result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⏭️";
    core.info(`${icon} [${result.name}] ${result.message}`);
    if (result.details && result.details.length > 0) {
      for (const detail of result.details) {
        core.info(`   - ${detail}`);
      }
    }
  }

  core.info(
    `\nSummary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`
  );

  if (summary.failed > 0) {
    core.setFailed(
      `PR check failed: ${summary.failed} check(s) did not pass.`
    );
  }
}
