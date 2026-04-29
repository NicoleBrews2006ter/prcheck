import * as core from "@actions/core";
import {
  createCheckResult,
  buildSummary,
  logReport,
  CheckResult,
} from "../reporter";

jest.mock("@actions/core");

const mockCore = core as jest.Mocked<typeof core>;

describe("createCheckResult", () => {
  it("creates a result with required fields", () => {
    const result = createCheckResult("labels", "pass", "Labels are valid");
    expect(result).toEqual({
      name: "labels",
      status: "pass",
      message: "Labels are valid",
      details: undefined,
    });
  });

  it("includes details when provided", () => {
    const result = createCheckResult("description", "fail", "Missing sections", [
      "## Summary",
      "## Testing",
    ]);
    expect(result.details).toHaveLength(2);
  });
});

describe("buildSummary", () => {
  const results: CheckResult[] = [
    createCheckResult("labels", "pass", "OK"),
    createCheckResult("description", "fail", "Missing sections"),
    createCheckResult("size", "skip", "Not configured"),
  ];

  it("counts statuses correctly", () => {
    const summary = buildSummary(results);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.skipped).toBe(1);
  });

  it("includes all results", () => {
    const summary = buildSummary(results);
    expect(summary.results).toHaveLength(3);
  });
});

describe("logReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls core.setFailed when there are failures", () => {
    const results: CheckResult[] = [
      createCheckResult("labels", "fail", "No labels"),
    ];
    logReport(buildSummary(results));
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("1 check(s) did not pass")
    );
  });

  it("does not call core.setFailed when all pass", () => {
    const results: CheckResult[] = [
      createCheckResult("labels", "pass", "OK"),
    ];
    logReport(buildSummary(results));
    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  it("logs details when present", () => {
    const results: CheckResult[] = [
      createCheckResult("description", "fail", "Missing", ["## Summary"]),
    ];
    logReport(buildSummary(results));
    expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining("## Summary"));
  });
});
