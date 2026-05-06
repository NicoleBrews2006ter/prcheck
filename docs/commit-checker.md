# Commit Checker

The commit checker enforces rules on individual commits within a pull request.

## Inputs

| Input | Description | Default |
|---|---|---|
| `conventional_commits` | Require all commit messages to follow the [Conventional Commits](https://www.conventionalcommits.org/) spec | `false` |
| `max_commits` | Maximum number of commits allowed in a PR. Leave empty for no limit. | _(none)_ |
| `require_signed_commits` | Require all commits to be GPG-signed/verified | `false` |

## Conventional Commits Format

When `conventional_commits: true`, each commit's first line must match:

```
<type>(<scope>): <description>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Example

```yaml
- uses: your-org/prcheck@v1
  with:
    conventional_commits: true
    max_commits: 10
    require_signed_commits: false
```

## Violations

If any rule is violated, the check will fail and a summary of violations will be reported, for example:

- `PR has 12 commits, but the maximum allowed is 10.`
- `Commit 3 does not follow Conventional Commits: "updated stuff"`
- `Commit 2 is not signed/verified.`
