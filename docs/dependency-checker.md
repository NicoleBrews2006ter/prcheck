# Dependency Checker

The **Dependency Checker** ensures that whenever a dependency manifest file (e.g., `package.json`) is modified in a pull request, the corresponding lockfile (e.g., `package-lock.json`) is also updated.

## Inputs

| Input | Description | Default |
|---|---|---|
| `dependency_require_lockfile_update` | Fail if a manifest is changed without updating a lockfile | `true` |
| `dependency_lockfile_patterns` | Comma-separated regex patterns to identify lockfiles | `package-lock\.json,yarn\.lock,pnpm-lock\.yaml,Gemfile\.lock,poetry\.lock,go\.sum` |
| `dependency_manifest_patterns` | Comma-separated regex patterns to identify manifests | `package\.json,Gemfile,pyproject\.toml,go\.mod,requirements\.txt` |

## Example

```yaml
- uses: your-org/prcheck@v1
  with:
    dependency_require_lockfile_update: true
    dependency_lockfile_patterns: 'package-lock\.json,yarn\.lock'
    dependency_manifest_patterns: 'package\.json'
```

## Behavior

- If `dependency_require_lockfile_update` is `false`, the check is skipped.
- If no manifest files are changed, the check passes.
- If a manifest is changed but no lockfile pattern matches any changed file, the check **fails**.
- If both a manifest and a lockfile are updated, the check **passes**.
