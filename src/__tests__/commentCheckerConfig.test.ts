import * as core from "@actions/core";
import {
  loadCommentCheckerConfig,
  buildCommentCheckerSummary,
} from "../commentCheckerConfig";

jest.mock("@actions/core");

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation(
    (name: string) => inputs[name] ?? ""
  );
}

describe("loadCommentCheckerConfig", () => {
  it("returns defaults when no inputs provided", () => {
    setupInputs({});
    const config = loadCommentCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.requireComment).toBe(false);
    expect(config.minComments).toBe(1);
    expect(config.requiredAuthors).toEqual([]);
    expect(config.blockedKeywords).toEqual([]);
  });

  it("disables checker when comment_checker_enabled is false", () => {
    setupInputs({ comment_checker_enabled: "false" });
    const config = loadCommentCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it("parses requireComment correctly", () => {
    setupInputs({ comment_require: "true" });
    const config = loadCommentCheckerConfig();
    expect(config.requireComment).toBe(true);
  });

  it("parses minComments correctly", () => {
    setupInputs({ comment_min_count: "3" });
    const config = loadCommentCheckerConfig();
    expect(config.minComments).toBe(3);
  });

  it("falls back to 1 for invalid minComments", () => {
    setupInputs({ comment_min_count: "abc" });
    const config = loadCommentCheckerConfig();
    expect(config.minComments).toBe(1);
  });

  it("parses requiredAuthors as comma-separated list", () => {
    setupInputs({ comment_required_authors: "alice, bob, carol" });
    const config = loadCommentCheckerConfig();
    expect(config.requiredAuthors).toEqual(["alice", "bob", "carol"]);
  });

  it("parses blockedKeywords as comma-separated list", () => {
    setupInputs({ comment_blocked_keywords: "WIP, DO NOT MERGE" });
    const config = loadCommentCheckerConfig();
    expect(config.blockedKeywords).toEqual(["WIP", "DO NOT MERGE"]);
  });
});

describe("buildCommentCheckerSummary", () => {
  it("includes all config fields in summary", () => {
    const config = {
      enabled: true,
      requireComment: true,
      minComments: 2,
      requiredAuthors: ["alice"],
      blockedKeywords: ["WIP"],
    };
    const summary = buildCommentCheckerSummary(config);
    expect(summary).toContain("Enabled: true");
    expect(summary).toContain("Require comment: true");
    expect(summary).toContain("Min comments: 2");
    expect(summary).toContain("alice");
    expect(summary).toContain("WIP");
  });

  it("omits optional sections when empty", () => {
    const config = {
      enabled: false,
      requireComment: false,
      minComments: 1,
      requiredAuthors: [],
      blockedKeywords: [],
    };
    const summary = buildCommentCheckerSummary(config);
    expect(summary).not.toContain("Required authors");
    expect(summary).not.toContain("Blocked keywords");
  });
});
