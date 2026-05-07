import {
  checkApprovals,
  extractApprovedReviews,
  hasChangesRequested,
  ApprovalContext,
} from "../approvalChecker";

const makePR = () => ({ number: 1 } as any);

const makeReviews = (
  entries: Array<{ login: string; state: string }>
): ApprovalContext["reviews"] =>
  entries.map(({ login, state }) => ({ state, user: { login } }));

describe("extractApprovedReviews", () => {
  it("returns logins of approved reviewers", () => {
    const reviews = makeReviews([
      { login: "alice", state: "APPROVED" },
      { login: "bob", state: "APPROVED" },
    ]);
    expect(extractApprovedReviews(reviews)).toEqual(["alice", "bob"]);
  });

  it("removes approval if reviewer later requests changes", () => {
    const reviews = makeReviews([
      { login: "alice", state: "APPROVED" },
      { login: "alice", state: "CHANGES_REQUESTED" },
    ]);
    expect(extractApprovedReviews(reviews)).toEqual([]);
  });

  it("ignores reviews with null user", () => {
    const reviews = [{ state: "APPROVED", user: null }];
    expect(extractApprovedReviews(reviews)).toEqual([]);
  });
});

describe("hasChangesRequested", () => {
  it("returns true when changes are requested", () => {
    const reviews = makeReviews([{ login: "bob", state: "CHANGES_REQUESTED" }]);
    expect(hasChangesRequested(reviews)).toBe(true);
  });

  it("returns false when no changes are requested", () => {
    const reviews = makeReviews([{ login: "alice", state: "APPROVED" }]);
    expect(hasChangesRequested(reviews)).toBe(false);
  });

  it("uses latest review state per user", () => {
    const reviews = makeReviews([
      { login: "alice", state: "CHANGES_REQUESTED" },
      { login: "alice", state: "APPROVED" },
    ]);
    expect(hasChangesRequested(reviews)).toBe(false);
  });
});

describe("checkApprovals", () => {
  const ctx = (reviews: ApprovalContext["reviews"]): ApprovalContext => ({
    pull_request: makePR(),
    reviews,
  });

  it("passes when required approvals are met", () => {
    const result = checkApprovals(
      ctx(makeReviews([{ login: "alice", state: "APPROVED" }])),
      1,
      false
    );
    expect(result.passed).toBe(true);
    expect(result.approvalCount).toBe(1);
  });

  it("fails when not enough approvals", () => {
    const result = checkApprovals(ctx([]), 2, false);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("2 approval");
  });

  it("fails when changes requested and flag is set", () => {
    const result = checkApprovals(
      ctx([
        ...makeReviews([{ login: "alice", state: "APPROVED" }]),
        ...makeReviews([{ login: "bob", state: "CHANGES_REQUESTED" }]),
      ]),
      1,
      true
    );
    expect(result.passed).toBe(false);
    expect(result.changesRequested).toBe(true);
  });

  it("passes when changes requested but flag is false", () => {
    const result = checkApprovals(
      ctx([
        ...makeReviews([{ login: "alice", state: "APPROVED" }]),
        ...makeReviews([{ login: "bob", state: "CHANGES_REQUESTED" }]),
      ]),
      1,
      false
    );
    expect(result.passed).toBe(true);
  });
});
