import * as core from "@actions/core";
import * as github from "@actions/github";
import { loadConfig, loadTemplateFromFile } from "./config";
import { checkDescription, extractTemplatePlaceholders, checkRequiredSections } from "./descriptionChecker";
import { checkLabels, extractPRLabels } from "./labelChecker";
import { checkTitle } from "./titleChecker";
import { createCheckResult, buildSummary, logReport } from "./reporter";

async function run(): Promise<void> {
  try {
    const config = loadConfig();
    const pr = github.context.payload.pull_request;

    if (!pr) {
      core.setFailed("This action must be run on pull_request events.");
      return;
    }

    const prTitle: string = pr.title ?? "";
    const prBody: string = pr.body ?? "";
    const prLabels = extractPRLabels(pr);

    const results = [];

    // Title check
    const titleResult = checkTitle(
      prTitle,
      config.titlePattern,
      config.titleMinLength,
      config.titleMaxLength
    );
    results.push(createCheckResult("Title", titleResult.passed, titleResult.message));

    // Description check
    let templateContent: string | null = null;
    if (config.templateFile) {
      templateContent = loadTemplateFromFile(config.templateFile);
    }

    if (templateContent) {
      const placeholders = extractTemplatePlaceholders(templateContent);
      const descResult = checkDescription(prBody, placeholders);
      results.push(createCheckResult("Description (template)", descResult.passed, descResult.message));
    }

    if (config.requiredSections.length > 0) {
      const sectionResult = checkRequiredSections(prBody, config.requiredSections);
      results.push(createCheckResult("Description (sections)", sectionResult.passed, sectionResult.message));
    }

    // Label check
    if (config.requiredLabels.length > 0) {
      const labelResult = checkLabels(prLabels, config.requiredLabels, config.labelMatchAll);
      results.push(createCheckResult("Labels", labelResult.passed, labelResult.message));
    }

    logReport(results);
    const summary = buildSummary(results);

    if (!summary.passed) {
      core.setFailed(`PR check failed: ${summary.failedChecks.join(", ")}`);
    } else {
      core.info("All PR checks passed.");
    }
  } catch (error) {
    core.setFailed(`Unexpected error: ${error}`);
  }
}

run();
