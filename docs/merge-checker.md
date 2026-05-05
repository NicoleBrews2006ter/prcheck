# Merge Checker

The **merge checker** module validates pull request merge readiness based on configurable rules.

## Features

- Restrict which base branches PRs can target (supports wildcard patterns)
- Enforce allowed merge methods (`squash`, `merge`, `rebase`)
- Warn when a PR branch is behind its base branch
- Block draft PRs from being considered merge-ready

## Configuration

Add the following inputs to your workflow:

```yaml
- uses: your-org/prcheck@v1
  with:
    allowed_base_branches: 'main,develop,release/*'
    allowed_merge_methods: 'squash,merge'
    require_up_to_date: 'true'
    block_draft_merge: 'true'
```

### Inputs

| Input | Description | Default |
|---|---|---|
| `allowed_base_branches` | Comma-separated list of allowed base branches (supports `*` wildcard) | *(all allowed)* |
| `allowed_merge_methods` | Comma-separated list of allowed merge methods | *(all allowed)* |
| `require_up_to_date` | Warn when PR branch is behind base | `true` |
| `block_draft_merge` | Fail check if PR is a draft | `true` |

## Behavior

- **Errors** (cause the check to fail): invalid base branch, draft PR when blocked
- **Warnings** (informational only): branch is behind base

## Example Output

```
❌ Base branch "hotfix/urgent" is not in allowed branches: [main, develop]
⚠️  PR branch is behind the base branch. Consider updating your branch.
```
