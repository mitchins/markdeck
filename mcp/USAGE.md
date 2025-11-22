# MCP Server Usage Examples

This document demonstrates how to use the MarkDeck MCP server to safely manipulate STATUS.md files.

> **Use in other projects:** You can point the tools at any MarkDeck-formatted `STATUS.md` by passing an absolute or relative `statusPath`. Keep this repo (or a published build of `mcp`) available locally so the server can import the MarkDeck core parser/serializer.

## Installation

Fastest path (after publishing):

```bash
npx @markdeck/mcp-server --status /absolute/path/to/STATUS.md
```

Local build (current repo):

```bash
cd mcp
npm install
npm run build
```

## Running the MCP Server

The MCP server runs as a stdio-based service:

```bash
npm run markdeck-mcp
# or directly:
node mcp/dist/index.js
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "markdeck": {
      "command": "node",
      "args": ["/absolute/path/to/markdeck/mcp/dist/index.js"]
    }
  }
}
```

## Tool Usage Examples

### 1. Get Board State

Retrieve the current state of a STATUS.md file:

```json
{
  "tool": "get_board",
  "arguments": {
    "statusPath": "./STATUS.md"
  }
}
```

**Response:**
```json
{
  "metadata": {
    "title": "MarkDeck — Project Status",
    "version": "0.2.0 MVP",
    "lastUpdated": "2025-11-20"
  },
  "swimlanes": [
    {
      "id": "core-features",
      "title": "🎯 CORE FEATURES",
      "order": 0
    }
  ],
  "cards": [
    {
      "id": "core-features-markdown-parser",
      "laneId": "core-features",
      "status": "done",
      "blocked": false,
      "title": "Markdown parser for STATUS.md format",
      "description": "Supports H2/H3 headings...",
      "links": [],
      "originalLine": 8
    }
  ]
}
```

### 2. Update Card Status

Change a card's status from TODO to IN PROGRESS:

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "core-features-github-provider",
    "changes": {
      "status": "in_progress"
    }
  }
}
```

### 3. Block a Card

Mark a card as blocked:

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "deployment-custom-domain",
    "changes": {
      "blocked": true
    }
  }
}
```

The card will change from 🔵 (blue, unblocked TODO) to 🔴 (red, blocked TODO).

### 4. Update Card Title and Description

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "core-features-local-file",
    "changes": {
      "title": "Local file support with auto-save",
      "description": "Implemented file provider\nAdded auto-save every 5 seconds\nHandles file system errors gracefully"
    }
  }
}
```

### 5. Add a New Card

Create a new card in a specific lane:

```json
{
  "tool": "add_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "laneId": "core-features",
    "status": "todo",
    "blocked": false,
    "title": "Implement export to PDF",
    "description": "Allow users to export board state as PDF document"
  }
}
```

### 6. Add a Blocked Card

```json
{
  "tool": "add_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "laneId": "deployment",
    "status": "todo",
    "blocked": true,
    "title": "Setup CDN caching",
    "description": "Waiting for infrastructure team approval"
  }
}
```

This creates a card with 🔴 emoji (blocked TODO).

### 7. Move Card to Different Lane

```json
{
  "tool": "move_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "testing-visual-regression",
    "targetLaneId": "core-features"
  }
}
```

### 8. Mark Card as Done

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "deployment-cloudflare-pages",
    "changes": {
      "status": "done"
    }
  }
}
```

Note: DONE cards are automatically unblocked (🟢 green emoji).

### 9. Delete a Card

```json
{
  "tool": "delete_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "obsolete-feature-card"
  }
}
```

## RYGBO Status Model

The MCP server enforces the RYGBO (Red-Yellow-Green-Blue-Orange) status model:

| Emoji | Status | Blocked | Meaning |
|-------|--------|---------|---------|
| 🔵 | `todo` | `false` | Not started, unblocked |
| 🔴 | `todo` | `true` | Not started, blocked |
| 🟡 | `in_progress` | `false` | In progress, unblocked |
| 🟧 | `in_progress` | `true` | In progress, blocked |
| 🟢 | `done` | `false` | Completed (always unblocked) |

**Key Rules:**
- DONE cards cannot be blocked (automatically normalized to unblocked)
- Blocked is a modifier on TODO or IN PROGRESS, not a separate status
- No "Blocked" column exists in the model

## Common Workflows

### Starting Work on a Task

```json
// 1. Get the board to find your task
{ "tool": "get_board", "arguments": { "statusPath": "./STATUS.md" } }

// 2. Update the card to in_progress
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "your-task-id",
    "changes": { "status": "in_progress" }
  }
}
```

### Blocking a Task

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "blocked-task-id",
    "changes": {
      "blocked": true,
      "description": "Blocked by: Waiting for API access credentials"
    }
  }
}
```

### Completing a Task

```json
{
  "tool": "update_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "cardId": "completed-task-id",
    "changes": {
      "status": "done",
      "description": "Implemented with full test coverage\nDeployed to production"
    }
  }
}
```

### Adding a New Epic with Multiple Tasks

```json
// First, add the new section manually or via STATUS.md editing
// Then add cards to the new lane:

{
  "tool": "add_card",
  "arguments": {
    "statusPath": "./STATUS.md",
    "laneId": "new-epic-name",
    "status": "todo",
    "blocked": false,
    "title": "Task 1: Research phase",
    "description": "Investigate options and create design doc"
  }
}
```

## Error Handling

All tools return structured error responses:

```json
{
  "error": "Card with id invalid-card-id not found"
}
```

Common errors:
- `Card with id {id} not found` - The specified card doesn't exist
- `File read/write errors` - Permission issues or file doesn't exist
- `Parse errors` - STATUS.md has invalid format

## Best Practices

1. **Always use get_board first** to understand the current state
2. **Use meaningful card IDs** - They're generated from lane + title
3. **Update descriptions** when blocking/unblocking tasks to explain why
4. **Verify changes** by calling get_board after modifications
5. **Handle errors gracefully** - Files may be in use or locked

## Limitations

- No caching: Each operation reads from disk
- Single file: Operates on one STATUS.md at a time
- No concurrency control: Assumes single-user edits
- No history/undo: Make backups before bulk changes
- Position-based serialization: New cards require special handling

## Testing

Test the MCP server:

```bash
cd mcp
npm test
```

This runs 14 tests covering:
- Board state parsing
- Card updates (status, blocked, title, description)
- Adding and deleting cards
- Moving cards between lanes
- Round-trip fidelity
- RYGBO status normalization

## Troubleshooting

### Server won't start

```bash
# Ensure dependencies are installed
cd mcp
npm install

# Rebuild
npm run build

# Check for errors
node dist/index.js
```

### Changes not persisting

- Verify the file path is correct and absolute
- Check file permissions
- Ensure STATUS.md exists at the specified path

### Unexpected status emojis

- Remember: DONE cards are always 🟢 (never blocked)
- Blocked TODO = 🔴, Blocked IN PROGRESS = 🟧
- Unblocked TODO = 🔵, Unblocked IN PROGRESS = 🟡

## Development

```bash
# Watch mode for development
cd mcp
npm run dev

# Run tests in watch mode
npm run test:watch
```

## Architecture

The MCP server is a thin adapter around MarkDeck core:

```
MCP Tools → parseStatusMarkdown() → Domain Model
         ← projectToMarkdown()   ← Modified Model
```

No new parsers or state models are introduced. Everything reuses existing, tested code.
