# MarkDeck MCP Server

A minimal Model Context Protocol (MCP) server for safe, structured manipulation of MarkDeck STATUS.md files.

## Overview

The MarkDeck MCP server provides a focused set of tools that allow LLMs to safely read and modify STATUS.md files without risking corruption or data loss. It acts as a protective layer around the file system, ensuring all changes maintain the RYGBO status model and round-trip fidelity.

## Design Philosophy

- **Minimal**: Only exposes essential operations
- **Safe**: Prevents structural corruption of STATUS.md
- **Composable**: Thin adapter around MarkDeck core, not a new subsystem
- **Stateless**: No caching or persistent state
- **Focused**: Does one thing well - manipulate STATUS.md safely

## Architecture

```
┌─────────────┐
│     LLM     │
└──────┬──────┘
       │
       ├─ Direct file access (read STATUS.md)
       │
       ├─ MCP Tools (structured operations)
       │  ├─ get_board
       │  ├─ update_card
       │  ├─ add_card
       │  ├─ delete_card
       │  └─ move_card
       │
┌──────▼──────┐
│  MCP Server │
└──────┬──────┘
       │
       ├─ Reuses: parseStatusMarkdown()
       ├─ Reuses: projectToMarkdown()
       └─ No new parsers or state models
       │
┌──────▼──────┐
│ STATUS.md   │
└─────────────┘
```

## Available Tools

### `get_board`

Parse STATUS.md and return the complete board state.

**Input:**
```json
{
  "statusPath": "/path/to/STATUS.md"
}
```

**Output:**
```json
{
  "metadata": { "title": "...", "version": "...", "lastUpdated": "..." },
  "swimlanes": [
    { "id": "...", "title": "🎯 CORE FEATURES", "order": 0 }
  ],
  "cards": [
    {
      "id": "...",
      "laneId": "...",
      "status": "todo",
      "blocked": false,
      "title": "Implement feature A",
      "description": "Details...",
      "links": [],
      "originalLine": 10
    }
  ],
  "notes": []
}
```

### `update_card`

Update properties of an existing card.

**Input:**
```json
{
  "statusPath": "/path/to/STATUS.md",
  "cardId": "card-123",
  "changes": {
    "status": "in_progress",
    "blocked": true,
    "title": "Updated title",
    "description": "New description",
    "laneId": "new-lane-id"
  }
}
```

**Output:**
```json
{
  "success": true,
  "card": { /* updated card */ }
}
```

### `add_card`

Add a new card to the board.

**Input:**
```json
{
  "statusPath": "/path/to/STATUS.md",
  "laneId": "lane-123",
  "status": "todo",
  "blocked": false,
  "title": "New task",
  "description": "Optional description"
}
```

**Output:**
```json
{
  "success": true,
  "card": { /* new card */ }
}
```

### `delete_card`

Remove a card from the board.

**Input:**
```json
{
  "statusPath": "/path/to/STATUS.md",
  "cardId": "card-123"
}
```

**Output:**
```json
{
  "success": true
}
```

### `move_card`

Move a card to a different lane.

**Input:**
```json
{
  "statusPath": "/path/to/STATUS.md",
  "cardId": "card-123",
  "targetLaneId": "lane-456"
}
```

**Output:**
```json
{
  "success": true,
  "card": { /* moved card */ }
}
```

## RYGBO Status Model

The server enforces the MarkDeck RYGBO (Red-Yellow-Green-Blue-Orange) status model:

- 🔵 **Blue** - TODO (unblocked)
- 🟡 **Yellow** - IN PROGRESS (unblocked)
- 🟢 **Green** - DONE (always unblocked)
- 🔴 **Red** - TODO (blocked)
- 🟧 **Orange** - IN PROGRESS (blocked)

**Important Rules:**
- DONE cards cannot be blocked (automatically normalized)
- Blocked is a modifier on TODO or IN PROGRESS, not a separate column

## Installation

```bash
cd mcp
npm install
npm run build
```

## Usage

### Standalone

```bash
npm start
```

### As MCP Server

Configure in your MCP client (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "markdeck": {
      "command": "node",
      "args": ["/path/to/markdeck/mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Watch tests
npm run test:watch
```

## Testing

The test suite validates:
- ✅ Correct parsing of STATUS.md into board state
- ✅ Safe card updates (status, blocked, title, description)
- ✅ Adding and deleting cards
- ✅ Moving cards between lanes
- ✅ Round-trip fidelity (parse → modify → serialize → parse)
- ✅ RYGBO status normalization (e.g., blocked DONE → unblocked DONE)

Run tests:
```bash
npm test
```

## Error Handling

All tools return structured error responses:

```json
{
  "error": "Card with id card-123 not found"
}
```

Errors include:
- Card not found
- Invalid status value
- File read/write errors
- Parse errors

## Constraints

- **No caching**: Each operation reads from disk
- **Single file**: Operates on one STATUS.md at a time
- **No concurrency control**: Assumes single-user edits
- **No history**: No undo/redo support

## Future Enhancements

Potential additions (if needed):
- Batch operations (update multiple cards)
- Card search/filter
- Lane operations (add/delete/reorder)
- Validation mode (dry-run)
- Backup/restore

## License

Same as MarkDeck parent project.
