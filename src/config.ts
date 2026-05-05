import * as core from "@actions/core";
import * as fs from "fs";

export interface PRCheckConfig {
  requiredLabels: string[];
  labelMatchAll: boolean;
  templateFile: string | null;
  requiredSections: string[];
  titlePattern: string | null;
  titleMinLength: number;
  titleMaxLength: number;
}

export function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function loadTemplateFromFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    core.warning(`Could not read template file "${filePath}": ${e}`);
    return null;
  }
}

export function loadConfig(): PRCheckConfig {
  const requiredLabelsRaw = core.getInput("required_labels");
  const templateFile = core.getInput("template_file") || null;
  const requiredSectionsRaw = core.getInput("required_sections");
  const titlePattern = core.getInput("title_pattern") || null;
  const titleMinLength = parseInt(core.getInput("title_min_length") || "10", 10);
  const titleMaxLength = parseInt(core.getInput("title_max_length") || "72", 10);
  const labelMatchAll = core.getInput("label_match_all") === "true";

  return {
    requiredLabels: parseCommaSeparated(requiredLabelsRaw),
    labelMatchAll,
    templateFile,
    requiredSections: parseCommaSeparated(requiredSectionsRaw),
    titlePattern,
    titleMinLength: isNaN(titleMinLength) ? 10 : titleMinLength,
    titleMaxLength: isNaN(titleMaxLength) ? 72 : titleMaxLength,
  };
}
