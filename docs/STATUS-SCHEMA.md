# STATUS.md Schema Specification

This document defines the exact format that MarkDeck expects for STATUS.md files.

## Overview

MarkDeck parses STATUS.md files into a three-column Kanban board (TODO → IN PROGRESS → DONE) with swimlanes and blocked status.

## Card Format

A **card** is a markdown bullet point with a status emoji:

```markdown
- <status-emoji> <title>
    <optional indented description>
    <can be multiple lines>
```

### Status Emojis (Required)

Each card MUST have ONE of these status emojis:

| Emoji | Status | Column |
|-------|--------|--------|
| ❗ | TODO | TODO |
| ⚠️ | IN PROGRESS | IN PROGRESS |
| ✅ | DONE | DONE |

### Blocked Indicator (Optional)

The ❌ emoji can be added to ANY card to mark it as blocked:

```markdown
- ❌ ⚠️ Blocked task in progress
- ❌ ✅ Blocked but completed
- ❌ ❗ Blocked todo
```

**Special Case**: If a bullet has ONLY ❌ without a status emoji, it defaults to TODO + blocked:

```markdown
- ❌ This becomes TODO + blocked
    Even with description
```

This ensures all tracked items appear on the board.

## Complete Examples

### Basic Cards
```markdown
- ✅ Deployed to production
- ⚠️ Code review in progress
- ❗ Write documentation
```

### Cards with Descriptions
```markdown
- ⚠️ Implement authentication
    OAuth2 flow
    JWT tokens
    Refresh token rotation
```

### Blocked Cards
```markdown
- ❌ ⚠️ Database migration
    Waiting for DBA approval
    Cannot proceed until schema review
```

### Blocked-Only Cards (Default to TODO)
```markdown
- ❌ Custom domain setup
    Need DNS access
    Waiting on infra team
```

## Swimlanes

H2 (`##`) and H3 (`###`) headings create swimlanes:

```markdown
## 🚀 DEPLOYMENT

- ✅ CI/CD pipeline
- ⚠️ Staging environment

## 🧪 TESTING

### Unit Tests
- ✅ Parser tests
- ❗ Integration tests

### E2E Tests
- ❌ Visual regression
```

Each swimlane contains the same three columns (TODO, IN PROGRESS, DONE).

## Non-Card Content

Any markdown that doesn't match the card format is preserved as-is:

- Regular bullets without emojis
- Paragraphs
- Code blocks
- Tables
- Comments

Example:
```markdown
## NOTES

Some general context about the project.

- Regular bullet point (not a card)
- Another note

- ✅ This IS a card
```

## Metadata (Optional)

MarkDeck extracts metadata from the document header:

```markdown
# Project Title

**Last Updated:** 2025-01-15
**Version:** 1.0.0

## First Swimlane
...
```

## Round-Trip Safety

MarkDeck preserves all original markdown when saving:
- Non-card content remains unchanged
- Formatting is preserved
- Comments stay intact
- Only card status emojis are updated

## Validation Rules

A valid card requires:
1. Bullet point (`-` or `*`)
2. At least one emoji (status or ❌)
3. Non-empty title text

Invalid bullets are ignored:
```markdown
- No emoji at all
- 🔥 Unknown emoji
```

## See Also

- [EXAMPLE-STATUS.md](./EXAMPLE-STATUS.md) - Complete example
- [../STATUS.md](../STATUS.md) - Live project status
