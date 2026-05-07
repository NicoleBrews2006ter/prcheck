import { checkFiles, matchesGlob, FileCheckerConfig } from "../fileChecker";

describe("matchesGlob", () => {
  it("matches exact filenames", () => {
    expect(matchesGlob("package-lock.json", "package-lock.json")).toBe(true);
  });

  it("matches wildcard patterns", () => {
    expect(matchesGlob("*.lock", "yarn.lock")).toBe(true);
    expect(matchesGlob("*.lock", "package.json")).toBe(false);
  });

  it("matches path patterns", () => {
    expect(matchesGlob("dist/*", "dist/index.js")).toBe(true);
    expect(matchesGlob("dist/*", "src/index.ts")).toBe(false);
  });

  it("matches single character wildcard", () => {
    expect(matchesGlob("file?.ts", "fileA.ts")).toBe(true);
    expect(matchesGlob("file?.ts", "fileAB.ts")).toBe(false);
  });
});

describe("checkFiles", () => {
  const baseConfig: FileCheckerConfig = {
    forbiddenFiles: [],
    requiredFiles: [],
    maxFilesChanged: 0,
  };

  it("passes when no constraints set", () => {
    const result = checkFiles(baseConfig, 5, ["src/index.ts"]);
    expect(result.passed).toBe(true);
  });

  it("fails when forbidden file is present", () => {
    const config = { ...baseConfig, forbiddenFiles: ["*.lock"] };
    const result = checkFiles(config, 1, ["yarn.lock", "src/index.ts"]);
    expect(result.passed).toBe(false);
    expect(result.forbiddenFound).toEqual(["yarn.lock"]);
  });

  it("fails when required file is missing", () => {
    const config = { ...baseConfig, requiredFiles: ["CHANGELOG.md"] };
    const result = checkFiles(config, 1, ["src/index.ts"]);
    expect(result.passed).toBe(false);
    expect(result.requiredMissing).toEqual(["CHANGELOG.md"]);
  });

  it("passes when required file is present", () => {
    const config = { ...baseConfig, requiredFiles: ["CHANGELOG.md"] };
    const result = checkFiles(config, 1, ["CHANGELOG.md", "src/index.ts"]);
    expect(result.passed).toBe(true);
    expect(result.requiredMissing).toHaveLength(0);
  });

  it("fails when files changed exceeds max", () => {
    const config = { ...baseConfig, maxFilesChanged: 5 };
    const result = checkFiles(config, 10, []);
    expect(result.passed).toBe(false);
    expect(result.filesChanged).toBe(10);
  });

  it("passes when files changed equals max", () => {
    const config = { ...baseConfig, maxFilesChanged: 5 };
    const result = checkFiles(config, 5, []);
    expect(result.passed).toBe(true);
  });

  it("ignores max files changed when set to 0", () => {
    const config = { ...baseConfig, maxFilesChanged: 0 };
    const result = checkFiles(config, 1000, []);
    expect(result.passed).toBe(true);
  });
});
