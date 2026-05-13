import { checkAuthor, extractAuthorLogin, extractAuthorAssociation } from '../authorChecker';

function makeContext(login: string, association = 'CONTRIBUTOR') {
  return {
    pull_request: {
      user: { login },
      author_association: association,
    },
  };
}

describe('extractAuthorLogin', () => {
  it('returns the login from context', () => {
    expect(extractAuthorLogin(makeContext('alice'))).toBe('alice');
  });

  it('returns empty string when user is null', () => {
    const ctx = { pull_request: { user: null, author_association: 'NONE' } };
    expect(extractAuthorLogin(ctx)).toBe('');
  });
});

describe('extractAuthorAssociation', () => {
  it('returns the author_association from context', () => {
    expect(extractAuthorAssociation(makeContext('alice', 'OWNER'))).toBe('OWNER');
  });
});

describe('checkAuthor', () => {
  it('passes when no restrictions are configured', () => {
    const result = checkAuthor(makeContext('alice'), [], [], []);
    expect(result.passed).toBe(true);
  });

  it('passes when author is in allowedAuthors', () => {
    const result = checkAuthor(makeContext('alice'), ['alice', 'bob'], [], []);
    expect(result.passed).toBe(true);
  });

  it('fails when author is not in allowedAuthors', () => {
    const result = checkAuthor(makeContext('charlie'), ['alice', 'bob'], [], []);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('charlie');
  });

  it('fails when author is in blockAuthors', () => {
    const result = checkAuthor(makeContext('badactor'), [], [], ['badactor']);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('blocked');
  });

  it('blockAuthors takes precedence over allowedAuthors', () => {
    const result = checkAuthor(makeContext('alice'), ['alice'], [], ['alice']);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('blocked');
  });

  it('passes when association is in allowedAssociations', () => {
    const result = checkAuthor(makeContext('alice', 'MEMBER'), [], ['MEMBER', 'OWNER'], []);
    expect(result.passed).toBe(true);
  });

  it('fails when association is not in allowedAssociations', () => {
    const result = checkAuthor(makeContext('alice', 'FIRST_TIME_CONTRIBUTOR'), [], ['MEMBER', 'OWNER'], []);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('FIRST_TIME_CONTRIBUTOR');
  });

  it('passes message includes author login on success', () => {
    const result = checkAuthor(makeContext('alice'), ['alice'], [], []);
    expect(result.message).toContain('alice');
  });
});
