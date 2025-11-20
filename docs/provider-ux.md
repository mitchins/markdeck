# Provider UX Specification

**Author:** UX Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0

---

## Executive Summary

This document defines the user experience for all data source providers in MarkDeck: local file mode, GitHub integration, and static/demo mode. It covers the complete user journey from connection setup to error recovery, ensuring a consistent, accessible experience regardless of the data source.

**Core Principles:**
1. **Progressive Disclosure** - Show complexity only when needed
2. **Clear Feedback** - Users always know connection status and next steps
3. **Graceful Degradation** - Failures provide actionable recovery paths
4. **Zero Data Loss** - Local changes preserved during connection issues
5. **Accessibility-First** - All flows keyboard-accessible and screen reader-friendly

---

## Provider Types Overview

| Provider      | Use Case                              | Setup Complexity |
|---------------|---------------------------------------|------------------|
| **File**      | Local files, one-time edits           | None             |
| **GitHub**    | Team projects, version control        | Medium (token)   |
| **Static**    | Demo, onboarding, testing             | None             |

---

## Local File Mode UX

### First-Time Experience

**User arrives at app with no project loaded:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    MarkDeck                         │
│          Visual Kanban for STATUS.md                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │         📄  Drop STATUS.md here              │ │
│  │                                               │ │
│  │              or click to browse               │ │
│  │                                               │ │
│  │      ─────────────────────────────            │ │
│  │                                               │ │
│  │  Supports: ✅ Multi-line descriptions        │ │
│  │            ✅ Swimlane organization          │ │
│  │            ✅ Blocked status tracking        │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│              [Try Demo File]                        │
│                                                     │
│         ───────────── or ─────────────              │
│                                                     │
│              [Connect to GitHub]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Spacing:**
- Upload area: `480px × 320px` minimum
- Padding: `32px` all sides
- Vertical gap between options: `24px`

**Behavior:**
1. **Drag-and-drop zone** - Accepts `.md` files only
2. **Click to browse** - Opens native file picker
3. **Demo button** - Loads example STATUS.md instantly
4. **GitHub button** - Opens GitHub connection modal

### File Upload Flow

**Step 1: User selects file**

```
State: File selected, parsing in progress

┌─────────────────────────────────────────────────────┐
│  Parsing STATUS.md...                              │
│  ████████████████░░░░░░░░░░ 65%                    │
└─────────────────────────────────────────────────────┘
```

**Step 2: Parse success**

```
State: Board loaded, ready to interact

┌─────────────────────────────────────────────────────┐
│  ✅ Loaded: Example Project                         │
│  12 cards across 3 swimlanes                        │
│                                                     │
│  [View Board] ← Auto-navigate here                  │
└─────────────────────────────────────────────────────┘
```

**Toast Notification:**
```
┌──────────────────────────────┐
│ ✅ Project loaded            │
│ 12 cards • 3 swimlanes       │
└──────────────────────────────┘
```
- Duration: 3 seconds
- Position: Bottom-right
- Auto-dismiss

**Step 3: Parse error (see Error States section)**

### Editing and Saving (File Mode)

**Header State:**

```
Unsaved changes present:

┌─────────────────────────────────────────────────────┐
│ MarkDeck        [Example Project ▼]       [•Save]  │
│                                            ↑        │
│                                      Cyan accent    │
└─────────────────────────────────────────────────────┘
```

**Save Button States:**

1. **No Changes:**
   - Label: "Save"
   - Color: Muted gray
   - Disabled: true
   - Tooltip: "No changes to save"

2. **Has Changes:**
   - Label: "•Save" (bullet indicates unsaved)
   - Color: Cyan accent (high visibility)
   - Disabled: false
   - Tooltip: "Save changes (Cmd/Ctrl+S)"

3. **Saving:**
   - Label: "Saving..."
   - Color: Muted
   - Disabled: true
   - Spinner icon

**Save Action (File Mode):**
1. Click "Save" button
2. Browser download dialog appears
3. File downloads as `STATUS.md` (or original filename)
4. Success toast: "File downloaded"
5. Unsaved changes flag cleared

**Keyboard Shortcut:**
- `Cmd/Ctrl + S` triggers save
- Works from any focused element

### Reload / Switch File

**Action: User clicks project selector dropdown**

```
┌─────────────────────────────────────────────────────┐
│ Current Project:  [Example Project ▼]              │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✓ Example Project (local file)               │ │
│  │ ───────────────────────────────────────────── │ │
│  │ ↻ Load different file                        │ │
│  │ 🔗 Connect to GitHub                         │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**If unsaved changes exist:**

```
┌───────────────────────────────────────┐
│  Unsaved Changes                      │
│                                       │
│  You have unsaved changes.            │
│  Save before switching projects?      │
│                                       │
│  [Cancel]  [Discard]  [Save & Switch] │
└───────────────────────────────────────┘
```

**Button Hierarchy:**
- Primary: "Save & Switch" (cyan, right-most)
- Destructive: "Discard" (red, middle)
- Secondary: "Cancel" (muted, left)

---

## GitHub Integration UX

### Connection Flow

**Step 1: User clicks "Connect to GitHub"**

```
┌─────────────────────────────────────────────────────┐
│                 Connect to GitHub                   │
│                                                     │
│  Securely access your STATUS.md files from GitHub  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔑 Personal Access Token                     │ │
│  │ ┌───────────────────────────────────────────┐ │ │
│  │ │ ghp_••••••••••••••••••••••••••••••       │ │ │
│  │ └───────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ℹ️ Tokens are stored locally and never shared     │
│                                                     │
│  Need a token? [Create one on GitHub →]            │
│                                                     │
│  Required scopes: repo (full control)               │
│                                                     │
│              [Cancel]  [Connect]                    │
└─────────────────────────────────────────────────────┘
```

**Modal Dimensions:**
- Width: `520px`
- Max-width: `90vw` (mobile)
- Padding: `32px`

**Token Input:**
- Type: `password` (hidden by default)
- Toggle visibility: Eye icon button
- Validation: Starts with `ghp_`, `gho_`, or `github_pat_`
- Real-time validation feedback
- Autocomplete: off
- Spellcheck: off

**Help Link:**
- Opens in new tab: `https://github.com/settings/tokens/new`
- Pre-fills required scopes if possible

**Step 2: Token validation**

```
State: Validating token...

┌─────────────────────────────────────────────────────┐
│  Validating token...                                │
│  ████████████████████████████████████ 100%          │
│                                                     │
│  Checking GitHub API access...                      │
└─────────────────────────────────────────────────────┘
```

**Step 3a: Success - List repositories**

```
State: Token validated, loading repositories

┌─────────────────────────────────────────────────────┐
│               Select Repository                     │
│                                                     │
│  Connected as: @username                            │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔍 Search repositories...                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Repositories with STATUS.md:                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✓ username/awesome-project                    │ │
│  │   Last updated: 2 hours ago                   │ │
│  ├───────────────────────────────────────────────┤ │
│  │   username/side-project                       │ │
│  │   Last updated: 3 days ago                    │ │
│  ├───────────────────────────────────────────────┤ │
│  │   org/team-project                            │ │
│  │   Last updated: 1 week ago                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Showing 3 of 48 repositories                       │
│  [Show all repositories ↓]                          │
│                                                     │
│              [Cancel]  [Load Project]               │
└─────────────────────────────────────────────────────┘
```

**Repository List:**
- Only shows repos with `STATUS.md` by default
- Option to show all repos
- Sorted by last updated (most recent first)
- Checkmark indicates selection
- Click anywhere on row to select

**Search:**
- Real-time filtering
- Searches repo name and owner
- Debounced 200ms

**Step 3b: Error - Invalid token (see Error States)**

**Step 4: Load project from GitHub**

```
State: Loading STATUS.md from GitHub...

┌─────────────────────────────────────────────────────┐
│  Loading username/awesome-project...                │
│  ████████████████░░░░░░░░░░ 60%                    │
│                                                     │
│  Fetching STATUS.md from main branch...             │
└─────────────────────────────────────────────────────┘
```

**Step 5: Project loaded**

```
Toast notification:

┌──────────────────────────────────────┐
│ ✅ Connected to GitHub               │
│ username/awesome-project             │
│ 24 cards • 5 swimlanes               │
└──────────────────────────────────────┘
```

**Header updates:**

```
┌─────────────────────────────────────────────────────┐
│ MarkDeck  [username/awesome-project ▼]    [•Push]  │
│                                             ↑       │
│           🔗 GitHub-connected         Cyan accent   │
└─────────────────────────────────────────────────────┘
```

### GitHub Mode Editing and Saving

**Save Button Label:**
- File mode: "Save" → Downloads file
- GitHub mode: "Push" → Commits to GitHub

**Push Dialog:**

```
User clicks "Push" button:

┌─────────────────────────────────────────────────────┐
│              Push Changes to GitHub                 │
│                                                     │
│  Repository: username/awesome-project               │
│  Branch: main                                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Commit Message                                │ │
│  │ ┌───────────────────────────────────────────┐ │ │
│  │ │ Update STATUS.md via MarkDeck             │ │ │
│  │ └───────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │ Optional details...                           │ │
│  │ ┌───────────────────────────────────────────┐ │ │
│  │ │ Moved 3 cards to DONE                     │ │ │
│  │ │                                           │ │ │
│  │ └───────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Changes:                                           │
│  • 3 cards moved                                    │
│  • 1 card marked as blocked                         │
│  • 2 descriptions updated                           │
│                                                     │
│              [Cancel]  [Push Changes]               │
└─────────────────────────────────────────────────────┘
```

**Commit Message:**
- Default: "Update STATUS.md via MarkDeck"
- User can customize
- Optional extended description
- Auto-saves preference for next time

**Change Summary:**
- Automatically generated from diff
- Shows card moves, status changes, blocked flags
- Helps user review before pushing

**Push Progress:**

```
┌─────────────────────────────────────────────────────┐
│  Pushing changes to GitHub...                       │
│  ████████████████████████████████████ 100%          │
│                                                     │
│  Committed as: abc1234                              │
└─────────────────────────────────────────────────────┘
```

**Success:**

```
Toast notification:

┌──────────────────────────────────────┐
│ ✅ Pushed to GitHub                  │
│ Commit: abc1234                      │
│ View on GitHub →                     │
└──────────────────────────────────────┘
```

**Link opens:** `https://github.com/username/repo/commit/abc1234`

### Repository Picker (Switching Projects)

**User clicks project dropdown (GitHub mode):**

```
┌─────────────────────────────────────────────────────┐
│ Current: [username/awesome-project ▼]               │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✓ username/awesome-project                    │ │
│  │   Connected to GitHub • main branch           │ │
│  ├───────────────────────────────────────────────┤ │
│  │   username/side-project                       │ │
│  │   Last opened: 2 days ago                     │ │
│  ├───────────────────────────────────────────────┤ │
│  │   org/team-project                            │ │
│  │   Last opened: 1 week ago                     │ │
│  ├───────────────────────────────────────────────┤ │
│  │ 🔍 Browse all repositories...                 │ │
│  ├───────────────────────────────────────────────┤ │
│  │ ↻ Load local file                            │ │
│  │ 🔌 Disconnect GitHub                          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Recent Repositories:**
- Shows last 3 accessed repos
- Persisted to localStorage
- Click to load instantly

**Browse All:**
- Opens full repository picker modal
- Same as initial connection flow

**Disconnect:**
- Removes GitHub token
- Returns to file mode
- Preserves current project in memory
- Confirmation dialog if unsaved changes

### Branch Selection (Future Enhancement)

**Not in v0.2, but designed for:**

```
┌─────────────────────────────────────────────────────┐
│  Repository: username/awesome-project               │
│                                                     │
│  Branch:  [main ▼]                                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✓ main (current)                              │ │
│  │   develop                                     │ │
│  │   feature/new-ui                              │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Static/Demo Mode UX

### Demo Project Loading

**User clicks "Try Demo File" from empty state:**

```
State: Loading demo...

┌─────────────────────────────────────────────────────┐
│  Loading demo project...                            │
│  ████████████████████████████████████ 100%          │
└─────────────────────────────────────────────────────┘
```

**Demo loads instantly (no network request).**

**Header Indicator:**

```
┌─────────────────────────────────────────────────────┐
│ MarkDeck    [Demo Project ▼]           [Export]    │
│                 ↑                          ↑        │
│            Gray badge              Replaces "Save"  │
└─────────────────────────────────────────────────────┘
```

**Demo Badge:**
- Label: "DEMO"
- Color: Muted gray background
- Tooltip: "This is a demo project. Changes won't be saved."
- Position: Next to project name

**Banner (Optional):**

```
┌─────────────────────────────────────────────────────┐
│  ℹ️ This is a demo project. Load your own file or  │
│  connect to GitHub to save changes.                 │
│                                        [Dismiss]    │
└─────────────────────────────────────────────────────┘
```

- Dismissible (persists dismissal to localStorage)
- Shown only on first demo load

### Exporting Demo Changes

**User clicks "Export" button:**

```
┌─────────────────────────────────────────────────────┐
│               Export Demo Project                   │
│                                                     │
│  You've made changes to the demo project.           │
│  Export as a STATUS.md file to save your work.      │
│                                                     │
│  File will be named: STATUS.md                      │
│                                                     │
│              [Cancel]  [Export File]                │
└─────────────────────────────────────────────────────┘
```

**Export Action:**
1. Serializes project to markdown
2. Triggers browser download
3. Success toast: "Demo exported as STATUS.md"

---

## Failure States

### Invalid Markdown

**Scenario:** User uploads malformed STATUS.md

**Detection:**
- Parser fails to extract metadata
- No cards found
- Unrecognized structure

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│                Parse Error                          │
│                                                     │
│  ⚠️ Unable to parse STATUS.md                       │
│                                                     │
│  The file doesn't match the expected format.        │
│                                                     │
│  Common issues:                                     │
│  • Missing H1 title                                 │
│  • No H2/H3 swimlane headers                        │
│  • Incorrect status emojis                          │
│                                                     │
│  [View Raw Markdown]  [See Example]  [Try Again]   │
└─────────────────────────────────────────────────────┘
```

**View Raw Markdown:**
- Switches to Raw Markdown tab
- Highlights problematic lines (if detectable)
- Allows manual editing

**See Example:**
- Opens modal with valid STATUS.md example
- Side-by-side comparison (user's file vs. example)

**Partial Parse Success:**

```
If some cards parsed successfully:

┌──────────────────────────────────────┐
│ ⚠️ Partial Parse                     │
│ Loaded 8 of 12 cards                 │
│ 4 cards had formatting errors        │
│                                      │
│ [View Details]                       │
└──────────────────────────────────────┘
```

**Error Details:**

```
┌─────────────────────────────────────────────────────┐
│             Parsing Issues Found                    │
│                                                     │
│  Line 24: Unknown status emoji "🔥"                 │
│  → Expected: ✅ ⚠️ ❗                                │
│                                                     │
│  Line 38: Card without swimlane header              │
│  → Add H2 or H3 heading above card                  │
│                                                     │
│  Line 51: Duplicate card ID "fix-auth-1"            │
│  → Check for identical lane + title combinations    │
│                                                     │
│              [Edit in Raw View]  [Dismiss]          │
└─────────────────────────────────────────────────────┘
```

### File Missing (GitHub)

**Scenario:** Connected repo doesn't have STATUS.md

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│              STATUS.md Not Found                    │
│                                                     │
│  Repository: username/awesome-project               │
│  Branch: main                                       │
│                                                     │
│  This repository doesn't have a STATUS.md file.     │
│                                                     │
│  Would you like to create one?                      │
│                                                     │
│  [Choose Different Repo]  [Create STATUS.md]        │
└─────────────────────────────────────────────────────┘
```

**Create STATUS.md Flow:**

1. Opens drawer with template options:
   - Empty template
   - Single swimlane template
   - Multi-swimlane template

2. User selects template, edits if desired

3. Commits new file to repo:
   ```
   Commit message: "Initialize STATUS.md via MarkDeck"
   ```

4. Success toast: "STATUS.md created in username/repo"

### GitHub Rate Limits

**Scenario:** User exceeds GitHub API rate limit

**Detection:**
- HTTP 403 with `X-RateLimit-Remaining: 0`
- Header includes `X-RateLimit-Reset` timestamp

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│           GitHub API Rate Limit Exceeded            │
│                                                     │
│  ⚠️ Too many requests to GitHub API                 │
│                                                     │
│  Rate limit resets at: 3:42 PM (in 12 minutes)      │
│                                                     │
│  You can continue working on your current project.  │
│  Push changes after the rate limit resets.          │
│                                                     │
│  Remaining requests: 0 / 60 per hour                │
│                                                     │
│              [Work Offline]  [Understood]           │
└─────────────────────────────────────────────────────┘
```

**Work Offline Mode:**
- Changes saved to localStorage
- "Offline Mode" badge in header
- Push button disabled with tooltip explaining rate limit
- Auto-retry when rate limit resets

**Persistent Indicator:**

```
┌─────────────────────────────────────────────────────┐
│ MarkDeck  [username/repo ▼]      ⚠️ Rate Limited   │
│                                    Resets: 11min    │
└─────────────────────────────────────────────────────┘
```

**Auto-Retry:**
- Background timer checks rate limit every 60 seconds
- Toast when rate limit resets: "GitHub API available again"
- Push button re-enabled

### Permission Issues

**Scenario:** Token lacks required permissions

**Detection:**
- HTTP 403 on push attempt
- Token has read-only access

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│           Permission Denied                         │
│                                                     │
│  ⚠️ Unable to push changes to GitHub                │
│                                                     │
│  Your access token doesn't have write permission    │
│  for username/awesome-project.                      │
│                                                     │
│  Required permissions:                              │
│  • repo (full control) ✗                            │
│                                                     │
│  What you can do:                                   │
│  • Update your token with repo permissions          │
│  • Export changes as a file                         │
│  • Fork the repository (if you're a contributor)    │
│                                                     │
│  [Update Token]  [Export File]  [Learn More]        │
└─────────────────────────────────────────────────────┘
```

**Update Token Flow:**
1. Opens GitHub connection modal
2. Pre-fills current token (for editing)
3. Help text emphasizes required scopes
4. Re-validates on save

**Export File:**
- Downloads STATUS.md with changes
- User can manually commit via Git CLI or GitHub UI

### Network Errors

**Scenario:** Network connectivity issues

**Detection:**
- Fetch timeout (10 seconds)
- No network connection
- DNS resolution failure

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│            Connection Failed                        │
│                                                     │
│  ⚠️ Unable to reach GitHub                          │
│                                                     │
│  Please check your internet connection and try      │
│  again.                                             │
│                                                     │
│  Error: Network request failed (ERR_NETWORK)        │
│                                                     │
│              [Retry]  [Work Offline]                │
└─────────────────────────────────────────────────────┘
```

**Retry Logic:**
- Automatic retry with exponential backoff
- Max 3 retries before showing error
- User can manually trigger retry

**Offline Indicator:**

```
┌─────────────────────────────────────────────────────┐
│ MarkDeck  [username/repo ▼]      📡 Offline         │
│                                                     │
│  Changes saved locally. Will sync when online.      │
└─────────────────────────────────────────────────────┘
```

### Merge Conflicts

**Scenario:** Remote STATUS.md changed while user was editing

**Detection:**
- File SHA mismatch on push attempt
- GitHub returns 409 Conflict

**UI Response:**

```
┌─────────────────────────────────────────────────────┐
│              Merge Conflict                         │
│                                                     │
│  ⚠️ Remote file has changed                         │
│                                                     │
│  Someone else updated STATUS.md while you were      │
│  editing.                                           │
│                                                     │
│  Your changes:                                      │
│  • 3 cards moved to DONE                            │
│  • 1 card marked as blocked                         │
│                                                     │
│  Remote changes:                                    │
│  • 2 new cards added                                │
│  • 1 card description updated                       │
│                                                     │
│  Resolution options:                                │
│                                                     │
│  [Pull Latest]  [Force Push]  [Export & Merge]      │
└─────────────────────────────────────────────────────┘
```

**Pull Latest:**
1. Fetches remote STATUS.md
2. Attempts automatic merge
3. If conflicts remain, shows diff view

**Force Push:**
1. Overwrites remote with local changes
2. Requires confirmation:
   ```
   ⚠️ This will discard remote changes.
   Are you sure?
   
   [Cancel]  [Force Push]
   ```

**Export & Merge:**
1. Downloads local changes as `STATUS-local.md`
2. Loads remote version into board
3. User manually merges in editor or IDE

---

## Provider State Persistence

### What Gets Saved to localStorage

| Key                     | Value                              | Purpose                        |
|-------------------------|------------------------------------|--------------------------------|
| `markdeck-provider`     | `"file" \| "github" \| "static"`   | Active provider type           |
| `markdeck-github-token` | Encrypted token string             | GitHub authentication          |
| `markdeck-last-repo`    | `"owner/repo"`                     | Last accessed repository       |
| `markdeck-recent-repos` | JSON array of repo objects         | Recent repositories list       |
| `markdeck-offline-data` | Serialized project + changes       | Offline mode data cache        |

**Security Considerations:**
- GitHub token encrypted using Web Crypto API
- Tokens never sent to MarkDeck servers (client-side only)
- Clear token on disconnect
- Option to "Remember me" (default: off)

### Session Restoration

**On app load:**

1. Check for active provider in localStorage
2. If GitHub provider:
   - Validate token (silent auth check)
   - Load last accessed repo automatically
   - Show loading state during restoration
3. If file provider:
   - Show empty state (no auto-load)
4. If token expired:
   - Show "Session Expired" dialog
   - Offer to reconnect

**Session Expired Flow:**

```
┌─────────────────────────────────────────────────────┐
│           GitHub Session Expired                    │
│                                                     │
│  Your GitHub access token has expired or been       │
│  revoked.                                           │
│                                                     │
│  Reconnect to continue syncing with GitHub.         │
│                                                     │
│  Last connected: 2 days ago                         │
│  Repository: username/awesome-project               │
│                                                     │
│              [Work Offline]  [Reconnect]            │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility (Provider-Specific)

### Screen Reader Announcements

**File upload:**
- "Drag and drop zone. Drop STATUS.md file to upload."
- "File selected: example-status.md, 12 kilobytes"
- "Parsing file, please wait..."
- "Project loaded. 12 cards across 3 swimlanes."

**GitHub connection:**
- "GitHub connection dialog opened"
- "Token input. Paste your GitHub personal access token"
- "Validating token, please wait..."
- "Connected to GitHub as @username"
- "Repository picker. Select a repository with STATUS.md"
- "Loaded username/awesome-project. 24 cards across 5 swimlanes."

**Provider switching:**
- "Switched to GitHub mode. Changes will be pushed to GitHub."
- "Switched to file mode. Changes will be downloaded as a file."

### Keyboard Navigation

**GitHub Connection Modal:**
- `Tab` through form fields
- `Enter` to submit
- `Escape` to cancel
- Focus trap (no tabbing outside modal)

**Repository Picker:**
- `↑` / `↓` to navigate list
- `Enter` to select
- Type to filter (search)
- `Escape` to cancel

**Save/Push Dialogs:**
- `Tab` through fields
- `Cmd/Ctrl + Enter` to submit
- `Escape` to cancel

---

## Performance Targets

| Operation                    | Target Time | Notes                           |
|------------------------------|-------------|---------------------------------|
| File upload + parse          | <500ms      | For files up to 1 MB            |
| GitHub token validation      | <2s         | Network-dependent               |
| Repository list fetch        | <3s         | Shows skeleton during load      |
| STATUS.md fetch from GitHub  | <2s         | Shows progress bar              |
| Push to GitHub               | <3s         | Includes commit + verification  |
| Provider switch (no network) | <100ms      | UI state change only            |
| Offline mode activation      | <50ms       | Immediate UI update             |

---

## Future Enhancements (Not in v0.2)

1. **Multiple GitHub Accounts:** Switch between different tokens
2. **Organization Repos:** Special UI for org repositories
3. **Branch Protection:** Warn before pushing to protected branches
4. **Pull Request Mode:** Create PR instead of direct push
5. **Webhooks:** Real-time sync when remote changes
6. **OAuth Flow:** More secure than PAT (requires backend)
7. **GitLab / Bitbucket:** Support additional Git platforms
8. **Cloudflare D1/R2:** Integrate with Cloudflare storage

---

**Approved by:** UX Lead  
**Date:** 2025-11-20  
**Version:** 1.0
