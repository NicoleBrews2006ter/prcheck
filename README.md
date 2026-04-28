# prcheck

A lightweight GitHub Action that enforces customizable PR description templates and labels.

## Installation

```bash
npm install
npm run build
```

## Usage

Add the following to your workflow file (e.g. `.github/workflows/prcheck.yml`):

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  prcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run prcheck
        uses: your-org/prcheck@v1
        with:
          template: '.github/pull_request_template.md'
          required-labels: 'bug, feature, chore'
          fail-on-missing-label: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `template` | Path to the PR description template | `.github/pull_request_template.md` |
| `required-labels` | Comma-separated list of accepted labels | `""` |
| `fail-on-missing-label` | Fail the check if no matching label is found | `false` |

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

## License

[MIT](LICENSE)