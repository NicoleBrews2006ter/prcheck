import * as core from "@actions/core";
import * as github from "@actions/github";
import { loadConfig } from "./config";
import { checkLabels, extractPRLabels } from "./labelChecker";
import { checkDescription } from "./descriptionChecker";
import {
  createCheckResult,
  buildSummary,
  logReport,
  CheckResult,
} from "./reporter";

async function run(): Promise<void> {
  try {
    const config = loadConfig();
    const pr = github.context.payload.pull_request;

    if (!pr) {
      core.warning("This action should be triggered on pull_request events.");
      return;
    }

    const results: CheckResult[] = [];
    const prBody: string = pr.body ?? "";
    const prLabels = extractPRLabels(github.context.payload);

    // Description check
    if (config.templateContent) {
      const descResult = checkDescription(prBody, config.templateContent);
      results.push(
        createCheckResult(
          "description",
          descResult.valid ? "pass" : "fail",
          descResult.valid
            ? "PR description meets template requirements"
            : "PR description is missing required sections",
          descResult.missingSections
        )
      );
    } else {
      results.push(
        createCheckResult("description", "skip", "No template configured")
      );
    }

    // Label check
    if (config.requiredLabels.length > 0 || config.labelGroups.length > 0) {
      const labelResult = checkLabels(prLabels, config);
      results.push(
        createCheckResult(
          "labels",
          labelResult.valid ? "pass" : "fail",
          labelResult.valid
            ? "PR labels satisfy requirements"
            : "PR labels do not satisfy requirements",
          labelResult.errors
        )
      );
    } else {
      results.push(
        createCheckResult("labels", "skip", "No label rules configured")
      );
    }

    logReport(buildSummary(results));
  } catch (error) {
    core.setFailed(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

run();
