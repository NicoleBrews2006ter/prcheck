import { parseCommaSeparated } from "../config";

describe("parseCommaSeparated", () => {
  it("splits a comma-separated string into trimmed values", () => {
    expect(parseCommaSeparated("bug, enhancement, help wanted")).toEqual([
      "bug",
      "enhancement",
      "help wanted",
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseCommaSeparated("")).toEqual([]);
  });

  it("filters out blank entries", () => {
    expect(parseCommaSeparated("bug,,fix, ")).toEqual(["bug", "fix"]);
  });

  it("handles a single value without commas", () => {
    expect(parseCommaSeparated("bug")).toEqual(["bug"]);
  });

  it("trims whitespace around each value", () => {
    expect(parseCommaSeparated("  feat  ,  fix  ")).toEqual(["feat", "fix"]);
  });
});
