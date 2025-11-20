# Snapshot Testing

This directory contains Vitest snapshot files.

## What are snapshots?

Snapshots are saved outputs from tests that are used to detect unexpected changes.

## When to use snapshots

- **Markdown serialization**: Ensure output format doesn't change unexpectedly
- **UI component structure**: Catch unintended UI changes
- **Parsing output**: Verify parser output consistency

## Updating snapshots

When intentional changes are made:

```bash
npm run test -- -u
```

## Best practices

1. Keep snapshots small and focused
2. Review snapshot diffs carefully in PRs
3. Don't snapshot everything - use for stability checks
4. Commit snapshots to version control
5. Update snapshots only when changes are intentional

## Example

```typescript
it('should match markdown output snapshot', () => {
  const output = serializeProject(project)
  expect(output).toMatchSnapshot()
})
```
