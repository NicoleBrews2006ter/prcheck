import * as core from "@actions/core";
import {
  loadApprovalCheckerConfig,
  buildApprovalCheckerSummary,
} from "../approvalCheckerConfig";

jest.mock("@actions/core");

const mockedGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(inputs: Record<string, string>) {
  mockedGetInput.mockImplementation((name: string) => inputs[name] ?? "");
}

describe("loadApprovalCheckerConfig", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns defaults when no inputs are set", () => {
    setupInputs({});
    const config = loadApprovalCheckerConfig();
    expect(config.enabled).toBe(true);
    expect(config.requiredApprovals).toBe(1);
    expect(config.requireNoChangesRequested).toBe(false);
  });

  it("disables check when approval_check_enabled is false", () => {
    setupInputs({ approval_check_enabled: "false" });
    const config = loadApprovalCheckerConfig();
    expect(config.enabled).toBe(false);
  });

  it("parses required_approvals correctly", () => {
    setupInputs({ required_approvals: "3" });
    const config = loadApprovalCheckerConfig();
    expect(config.requiredApprovals).toBe(3);
  });

  it("falls back to 1 when required_approvals is not a number", () => {
    setupInputs({ required_approvals: "abc" });
    const config = loadApprovalCheckerConfig();
    expect(config.requiredApprovals).toBe(1);
  });

  it("enables requireNoChangesRequested when set to true", () => {
    setupInputs({ require_no_changes_requested: "true" });
    const config = loadApprovalCheckerConfig();
    expect(config.requireNoChangesRequested).toBe(true);
  });
});

describe("buildApprovalCheckerSummary", () => {
  it("includes all config fields in summary", () => {
    const summary = buildApprovalCheckerSummary({
      enabled: true,
      requiredApprovals: 2,
      requireNoChangesRequested: true,
    });
    expect(summary).toContain("enabled: true");
    expect(summary).toContain("Required approvals: 2");
    expect(summary).toContain("Require no changes requested: true");
  });
});
