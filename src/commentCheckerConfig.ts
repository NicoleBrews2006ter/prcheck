import * as core from "@actions/core";
import { parseCommaSeparated } from "./config";
import { CommentCheckerConfig } from "./commentChecker";

export function loadCommentCheckerConfig(): CommentCheckerConfig {
  const enabled = core.getInput("comment_checker_enabled") !== "false";
  const requireComment =
    core.getInput("comment_require").toLowerCase() === "true";
  const minCommentsRaw = core.getInput("comment_min_count");
  const minComments = minCommentsRaw ? parseInt(minCommentsRaw, 10) : 1;
  const requiredAuthors = parseCommaSeparated(
    core.getInput("comment_required_authors")
  );
  const blockedKeywords = parseCommaSeparated(
    core.getInput("comment_blocked_keywords")
  );

  return {
    enabled,
    requireComment,
    minComments: isNaN(minComments) ? 1 : minComments,
    requiredAuthors,
    blockedKeywords,
  };
}

export function buildCommentCheckerSummary(
  config: CommentCheckerConfig
): string {
  const lines: string[] = ["**Comment Checker Config:**"];
  lines.push(`- Enabled: ${config.enabled}`);
  lines.push(`- Require comment: ${config.requireComment}`);
  lines.push(`- Min comments: ${config.minComments}`);
  if (config.requiredAuthors.length > 0) {
    lines.push(`- Required authors: ${config.requiredAuthors.join(", ")}`);
  }
  if (config.blockedKeywords.length > 0) {
    lines.push(`- Blocked keywords: ${config.blockedKeywords.join(", ")}`);
  }
  return lines.join("\n");
}
