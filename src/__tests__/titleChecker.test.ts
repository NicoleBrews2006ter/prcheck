import { checkTitle, buildTitleRegex } from "../titleChecker";

describe("buildTitleRegex", () => {
  it("returns a valid RegExp for a valid pattern", () => {
    const regex = buildTitleRegex("^feat:");
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.test("feat: add new feature")).toBe(true);
  });

  it("returns /.*/ for an invalid pattern", () => {
    const regex = buildTitleRegex("[");
    expect(regex.test("anything")).toBe(true);
  });
});

describe("checkTitle", () => {
  it("fails for empty title", () => {
    const result = checkTitle("", null, 10, 72);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/empty/);
  });

  it("fails when title is too short", () => {
    const result = checkTitle("fix", null, 10, 72);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/too short/);
  });

  it("fails when title is too long", () => {
    const long = "a".repeat(80);
    const result = checkTitle(long, null, 5, 72);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/too long/);
  });

  it("fails when title does not match pattern", () => {
    const result = checkTitle("update readme", "^(feat|fix|chore):", 5, 72);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/does not match/);
  });

  it("passes when title matches pattern and length constraints", () => {
    const result = checkTitle("feat: add title checker", "^(feat|fix|chore):", 5, 72);
    expect(result.passed).toBe(true);
  });

  it("passes with no pattern and valid length", () => {
    const result = checkTitle("Update the README file", null, 5, 72);
    expect(result.passed).toBe(true);
  });

  it("ignores maxLength when set to 0", () => {
    const long = "a".repeat(200);
    const result = checkTitle(long, null, 5, 0);
    expect(result.passed).toBe(true);
  });

  it("ignores minLength when set to 0", () => {
    const result = checkTitle("hi", null, 0, 72);
    expect(result.passed).toBe(true);
  });

  it("title at exactly minLength boundary passes", () => {
    const result = checkTitle("hello", null, 5, 72);
    expect(result.passed).toBe(true);
  });

  it("title at exactly maxLength boundary passes", () => {
    const title = "a".repeat(72);
    const result = checkTitle(title, null, 5, 72);
    expect(result.passed).toBe(true);
  });
});
