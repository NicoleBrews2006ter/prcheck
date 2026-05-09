import { checkComments, extractComments, CommentCheckerConfig } from "../commentChecker";

const baseConfig: CommentCheckerConfig = {
  enabled: true,
  requireComment: false,
  minComments: 1,
  requiredAuthors: [],
  blockedKeywords: [],
};

describe("checkComments", () => {
  it("passes when checker is disabled", () => {
    const result = checkComments([], { ...baseConfig, enabled: false });
    expect(result.passed).toBe(true);
    expect(result.message).toContain("disabled");
  });

  it("passes when no requirements set and comments exist", () => {
    const comments = [{ author: "alice", body: "LGTM" }];
    const result = checkComments(comments, baseConfig);
    expect(result.passed).toBe(true);
  });

  it("fails when requireComment is true and no comments exist", () => {
    const config = { ...baseConfig, requireComment: true, minComments: 1 };
    const result = checkComments([], config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("at least 1");
  });

  it("passes when minComments threshold is met", () => {
    const config = { ...baseConfig, requireComment: true, minComments: 2 };
    const comments = [
      { author: "alice", body: "looks good" },
      { author: "bob", body: "approved" },
    ];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(true);
  });

  it("fails when minComments threshold is not met", () => {
    const config = { ...baseConfig, requireComment: true, minComments: 3 };
    const comments = [
      { author: "alice", body: "looks good" },
      { author: "bob", body: "approved" },
    ];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("at least 3");
  });

  it("fails when required author has not commented", () => {
    const config = { ...baseConfig, requiredAuthors: ["alice", "bob"] };
    const comments = [{ author: "alice", body: "LGTM" }];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("bob");
  });

  it("passes when all required authors have commented", () => {
    const config = { ...baseConfig, requiredAuthors: ["alice", "bob"] };
    const comments = [
      { author: "alice", body: "LGTM" },
      { author: "bob", body: "approved" },
    ];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(true);
    expect(result.matchedAuthors).toContain("alice");
    expect(result.matchedAuthors).toContain("bob");
  });

  it("fails when a blocked keyword is found in comments", () => {
    const config = { ...baseConfig, blockedKeywords: ["WIP", "DO NOT MERGE"] };
    const comments = [{ author: "alice", body: "This is WIP, please wait" }];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(false);
    expect(result.blockedFound).toContain("WIP");
  });

  it("is case-insensitive for blocked keywords", () => {
    const config = { ...baseConfig, blockedKeywords: ["do not merge"] };
    const comments = [{ author: "bob", body: "DO NOT MERGE yet" }];
    const result = checkComments(comments, config);
    expect(result.passed).toBe(false);
  });

  it("returns total comment count in result", () => {
    const comments = [
      { author: "a", body: "one" },
      { author: "b", body: "two" },
      { author: "c", body: "three" },
    ];
    const result = checkComments(comments, baseConfig);
    expect(result.totalComments).toBe(3);
  });
});
