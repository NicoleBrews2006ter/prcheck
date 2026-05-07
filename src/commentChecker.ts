import { Context } from "@actions/github/lib/context";

export interface CommentCheckerConfig {
  enabled: boolean;
  requireComment: boolean;
  minComments: number;
  requiredAuthors: string[];
  blockedKeywords: string[];
}

export interface CommentCheckerResult {
  passed: boolean;
  totalComments: number;
  matchedAuthors: string[];
  blockedFound: string[];
  message: string;
}

export function extractComments(
  context: Context
): { author: string; body: string }[] {
  const comments: { author: string; body: string }[] =
    (context.payload.pull_request as any)?._comments ?? [];
  return comments;
}

export function checkComments(
  comments: { author: string; body: string }[],
  config: CommentCheckerConfig
): CommentCheckerResult {
  if (!config.enabled) {
    return {
      passed: true,
      totalComments: 0,
      matchedAuthors: [],
      blockedFound: [],
      message: "Comment checker is disabled.",
    };
  }

  const totalComments = comments.length;

  if (config.requireComment && totalComments < config.minComments) {
    return {
      passed: false,
      totalComments,
      matchedAuthors: [],
      blockedFound: [],
      message: `PR requires at least ${config.minComments} comment(s), but found ${totalComments}.`,
    };
  }

  const matchedAuthors = config.requiredAuthors.filter((author) =>
    comments.some((c) => c.author.toLowerCase() === author.toLowerCase())
  );

  if (
    config.requiredAuthors.length > 0 &&
    matchedAuthors.length < config.requiredAuthors.length
  ) {
    const missing = config.requiredAuthors.filter(
      (a) => !matchedAuthors.includes(a)
    );
    return {
      passed: false,
      totalComments,
      matchedAuthors,
      blockedFound: [],
      message: `Missing required comments from: ${missing.join(", ")}.`,
    };
  }

  const blockedFound = config.blockedKeywords.filter((kw) =>
    comments.some((c) => c.body.toLowerCase().includes(kw.toLowerCase()))
  );

  if (blockedFound.length > 0) {
    return {
      passed: false,
      totalComments,
      matchedAuthors,
      blockedFound,
      message: `PR contains comments with blocked keywords: ${blockedFound.join(", ")}.`,
    };
  }

  return {
    passed: true,
    totalComments,
    matchedAuthors,
    blockedFound: [],
    message: "Comment check passed.",
  };
}
