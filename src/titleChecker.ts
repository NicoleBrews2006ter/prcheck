import * as core from "@actions/core";

export interface TitleCheckResult {
  passed: boolean;
  message: string;
}

export function buildTitleRegex(pattern: string): RegExp {
  try {
    return new RegExp(pattern);
  } catch (e) {
    core.warning(`Invalid title pattern "${pattern}": ${e}`);
    return /.*/;
  }
}

export function checkTitle(
  title: string,
  pattern: string | null,
  minLength: number,
  maxLength: number
): TitleCheckResult {
  if (!title || title.trim().length === 0) {
    return { passed: false, message: "PR title must not be empty." };
  }

  const trimmed = title.trim();

  if (trimmed.length < minLength) {
    return {
      passed: false,
      message: `PR title is too short (${trimmed.length} chars). Minimum is ${minLength}.`,
    };
  }

  if (maxLength > 0 && trimmed.length > maxLength) {
    return {
      passed: false,
      message: `PR title is too long (${trimmed.length} chars). Maximum is ${maxLength}.`,
    };
  }

  if (pattern) {
    const regex = buildTitleRegex(pattern);
    if (!regex.test(trimmed)) {
      return {
        passed: false,
        message: `PR title "${trimmed}" does not match required pattern: ${pattern}`,
      };
    }
  }

  return { passed: true, message: "PR title is valid." };
}
