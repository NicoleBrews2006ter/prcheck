# Conversation Checker

The **conversation checker** ensures that all review conversations (comments) on a pull request are resolved before merging.

## Inputs

| Input | Description | Default |
|---|---|---|
| `conversation_require_resolved` | Require all conversations to be resolved | `true` |
| `conversation_max_unresolved` | Maximum number of unresolved conversations allowed | `0` |

## Examples

### Require all conversations resolved

```yaml
- uses: your-org/prcheck@v1
  with:
    conversation_require_resolved: 'true'
    conversation_max_unresolved: '0'
```

### Allow up to 2 unresolved conversations

```yaml
- uses: your-org/prcheck@v1
  with:
    conversation_require_resolved: 'true'
    conversation_max_unresolved: '2'
```

### Disable conversation check

```yaml
- uses: your-org/prcheck@v1
  with:
    conversation_require_resolved: 'false'
```

## Notes

- Outdated threads are not counted as unresolved.
- This checker requires the `pull_request_review_thread` event or GraphQL access to review threads.
