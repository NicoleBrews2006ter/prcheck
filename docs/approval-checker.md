# Approval Checker

The **Approval Checker** enforces that a pull request has received the required number of approvals before merging, and optionally blocks merges when changes have been requested.

## Inputs

| Input | Description | Default |
|---|---|---|
| `approval_check_enabled` | Enable or disable the approval check | `true` |
| `required_approvals` | Minimum number of approvals required | `1` |
| `require_no_changes_requested` | Fail if any reviewer has requested changes | `false` |

## Behavior

- Counts only the **latest review state** per reviewer. If a reviewer approved and then requested changes, only the change request is counted.
- If `require_no_changes_requested` is `true`, the check fails even if the required approval count is met.

## Example

```yaml
- uses: your-org/prcheck@v1
  with:
    approval_check_enabled: true
    required_approvals: 2
    require_no_changes_requested: true
```

## Output

The checker reports:
- Number of approvals received vs. required
- Whether any reviewer has outstanding change requests
- The list of users who have approved the PR
