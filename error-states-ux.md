# Error States UX Specification

**Author:** UX Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0

---

## Executive Summary

This document defines the comprehensive error handling and recovery user experience for MarkDeck. Every error state provides clear feedback, actionable recovery paths, and maintains user trust through transparency and data preservation.

**Core Principles:**
1. **Clear Communication** - Users understand what went wrong and why
2. **Actionable Guidance** - Every error offers concrete next steps
3. **Data Preservation** - Changes never lost, even during errors
4. **Contextual Help** - Errors provide relevant documentation links
5. **Progressive Severity** - Visual hierarchy matches error criticality

---

## Error Hierarchy

### Severity Levels

| Level       | Description                              | Visual Treatment           | Example                        |
|-------------|------------------------------------------|----------------------------|--------------------------------|
| **Info**    | FYI, no action required                  | Blue icon, auto-dismiss    | "Demo mode active"             |
| **Warning** | Attention needed, not blocking           | Amber icon, dismissible    | "Unsaved changes"              |
| **Error**   | Operation failed, recovery available     | Red icon, persistent       | "Failed to push to GitHub"     |
| **Critical**| App unusable, requires immediate action  | Red modal, blocking        | "Parser crashed"               |

---

## Toast Components

### Toast Design System

**Position:** Bottom-right corner (desktop), Top-center (mobile)  
**Width:** `360px` max, `90vw` on mobile  
**Stacking:** Newest on top, max 3 visible, queue others  
**Animation:** Slide in from right (150ms), fade out (200ms)

```
┌──────────────────────────────────────┐
│ ✅ Success Message                   │
│ Additional context or details        │
│                          [Dismiss ×] │
└──────────────────────────────────────┘
  ↑           ↑                ↑
Icon      Message           Action
```

### Success Toasts

**Project Loaded:**
```
┌──────────────────────────────────────┐
│ ✅ Project loaded                    │
│ 24 cards • 5 swimlanes               │
└──────────────────────────────────────┘
Duration: 3 seconds, auto-dismiss
```

**Changes Saved:**
```
┌──────────────────────────────────────┐
│ ✅ Changes saved                     │
│ STATUS.md downloaded                 │
└──────────────────────────────────────┘
Duration: 2 seconds, auto-dismiss
```

**GitHub Push:**
```
┌──────────────────────────────────────┐
│ ✅ Pushed to GitHub                  │
│ Commit: abc1234                      │
│                    [View on GitHub →]│
└──────────────────────────────────────┘
Duration: 5 seconds, action-dismissible
Action: Opens commit on GitHub
```

### Info Toasts

**Demo Mode:**
```
┌──────────────────────────────────────┐
│ ℹ️ Demo mode active                  │
│ Changes won't be saved automatically │
│                          [Export →]  │
└──────────────────────────────────────┘
Duration: 5 seconds, action-dismissible
```

**Offline Mode:**
```
┌──────────────────────────────────────┐
│ 📡 Working offline                   │
│ Changes saved locally                │
└──────────────────────────────────────┘
Duration: 4 seconds, auto-dismiss
```

**Rate Limit Reset:**
```
┌──────────────────────────────────────┐
│ ✅ GitHub API available              │
│ Rate limit has reset                 │
└──────────────────────────────────────┘
Duration: 3 seconds, auto-dismiss
```

### Warning Toasts

**Unsaved Changes:**
```
┌──────────────────────────────────────┐
│ ⚠️ Unsaved changes                   │
│ Don't forget to save before closing  │
│                   [Save] [Dismiss ×] │
└──────────────────────────────────────┘
Duration: Persistent until action
Triggers: Before page close, provider switch
```

**Large File:**
```
┌──────────────────────────────────────┐
│ ⚠️ Large file detected               │
│ 500+ cards may impact performance    │
│              [Enable Virtualization] │
└──────────────────────────────────────┘
Duration: 8 seconds, action-dismissible
```

**Partial Parse:**
```
┌──────────────────────────────────────┐
│ ⚠️ Partial parse                     │
│ Loaded 18 of 22 cards                │
│                     [View Details →] │
└──────────────────────────────────────┘
Duration: Persistent until action
```

### Error Toasts

**Network Failure:**
```
┌──────────────────────────────────────┐
│ ❌ Network error                     │
│ Unable to reach GitHub               │
│                   [Retry] [Offline]  │
└──────────────────────────────────────┘
Duration: Persistent until action
```

**Push Failed:**
```
┌──────────────────────────────────────┐
│ ❌ Push failed                       │
│ Merge conflict detected              │
│                    [Resolve] [Help]  │
└──────────────────────────────────────┘
Duration: Persistent until action
```

**Token Invalid:**
```
┌──────────────────────────────────────┐
│ ❌ Authentication failed             │
│ GitHub token expired or invalid      │
│                          [Reconnect] │
└──────────────────────────────────────┘
Duration: Persistent until action
```

### Toast Interaction Patterns

**Dismiss Behaviors:**
- Click `×` button → Immediate dismiss
- Click action button → Dismiss after action
- Auto-dismiss → Fade out after duration
- Swipe right (mobile) → Slide out dismiss

**Stacking Rules:**
- Max 3 toasts visible simultaneously
- Oldest auto-dismissed when new arrives
- Critical errors remain on top
- Success toasts at bottom of stack

**Accessibility:**
- `role="status"` for info/success
- `role="alert"` for warnings/errors
- Screen reader announces immediately
- Focus trap on action buttons
- Keyboard: `Escape` dismisses top toast

---

## Persistent Error Areas

### Inline Error Messages

**Form Field Errors:**
```
┌───────────────────────────────────────┐
│ Card Title                            │
│ ┌───────────────────────────────────┐ │
│ │ My Card                           │ │
│ └───────────────────────────────────┘ │
│ ✓ Valid                               │
└───────────────────────────────────────┘

vs.

┌───────────────────────────────────────┐
│ GitHub Token                          │
│ ┌───────────────────────────────────┐ │
│ │ ghp_invalid                       │ │ ← Red border
│ └───────────────────────────────────┘ │
│ ❌ Token must start with ghp_ or gho_ │ ← Error text
└───────────────────────────────────────┘
```

**Styling:**
- Error text: `text-red-600`, Inter Regular 12px
- Icon: Red XCircle, 14px
- Input border: `border-red-500`, 2px
- Background: `bg-red-50` (subtle tint)

### Banner Notifications

**Persistent Top Banner:**
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Changes not saved to GitHub                     │
│  Rate limit exceeded. Try again in 12 minutes.      │
│                                   [Dismiss]  [Help] │
└─────────────────────────────────────────────────────┘
```

**Use Cases:**
- Long-term degraded states (offline, rate limited)
- Multi-step recovery processes
- Important ongoing notifications

**Styling:**
- Background: Status color (amber for warning, red for error)
- Text: White or high-contrast foreground
- Full width, sticks to top of viewport
- Icon: 20px, left-aligned
- Actions: Right-aligned buttons

### Error Panels (Drawer/Modal Content)

**Parse Error Details:**
```
┌─────────────────────────────────────────────────────┐
│              Parsing Issues Found                   │
│                                                     │
│  ⚠️ 4 issues detected in STATUS.md                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │  Line 24: Unknown status emoji                │ │
│  │  "🔥 Fix critical bug"                        │ │
│  │                                               │ │
│  │  Expected: ✅ ⚠️ ❗                            │ │
│  │  Fix: Replace 🔥 with ❗ for TODO status      │ │
│  │                                               │ │
│  │  ────────────────────────────────────────     │ │
│  │                                               │ │
│  │  Line 38: Missing swimlane header             │ │
│  │  "- ✅ Card without parent"                   │ │
│  │                                               │ │
│  │  Fix: Add H2 or H3 heading above this card    │ │
│  │  Example: ## Bug Fixes                        │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [View Raw Markdown]  [See Example]  [Dismiss]     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Line number references
- Code snippets with syntax highlighting
- Specific fix suggestions
- Examples of correct format
- Actions to resolve

### Empty State Error

**No Project Loaded (Error State):**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               ⚠️ Failed to Load Project             │
│                                                     │
│  The STATUS.md file couldn't be loaded.             │
│                                                     │
│  Possible reasons:                                  │
│  • File is corrupted or unreadable                  │
│  • Network connection lost                          │
│  • GitHub repository access denied                  │
│                                                     │
│  What you can do:                                   │
│                                                     │
│      [Try Different File]   [Reconnect GitHub]     │
│                                                     │
│                  [View Error Log]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Error Categories and Recovery

### 1. Parser Errors

#### Unknown Status Emoji

**Error:**
```
Line 24: Unknown status emoji "🔥"
Expected: ✅ (DONE), ⚠️ (IN PROGRESS), ❗ (TODO)
```

**Recovery UX:**

```
┌─────────────────────────────────────────────────────┐
│  Auto-Fix Available                                 │
│                                                     │
│  MarkDeck detected an unknown emoji and can         │
│  automatically fix it.                              │
│                                                     │
│  Change: "🔥 Fix bug" → "❗ Fix bug" (TODO)         │
│                                                     │
│  Or manually select status:                         │
│  ○ TODO (❗)  ○ IN PROGRESS (⚠️)  ○ DONE (✅)       │
│                                                     │
│  [ ] Remember this choice for future 🔥 emojis      │
│                                                     │
│              [Auto-Fix]  [Manual Edit]              │
└─────────────────────────────────────────────────────┘
```

#### Missing Metadata

**Error:**
```
No H1 title found in STATUS.md
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Missing Project Title                              │
│                                                     │
│  STATUS.md should start with an H1 title:           │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ # My Project Name                             │ │
│  │                                               │ │
│  │ **Last Updated:** 2025-11-20                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Default title: "Untitled Project"                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Project Title                                 │ │
│  │ ┌───────────────────────────────────────────┐ │ │
│  │ │ Untitled Project                          │ │ │
│  │ └───────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│              [Use Default]  [Customize]             │
└─────────────────────────────────────────────────────┘
```

#### Orphaned Cards

**Error:**
```
Line 15: Card found without swimlane header
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Orphaned Cards Detected                            │
│                                                     │
│  3 cards found without H2/H3 swimlane headers.      │
│                                                     │
│  Move these cards to:                               │
│                                                     │
│  ○ Create new swimlane: "Uncategorized"             │
│  ○ Add to existing swimlane:                        │
│    ┌─────────────────────────────────────────────┐ │
│    │ Select swimlane...                   ▼      │ │
│    └─────────────────────────────────────────────┘ │
│  ○ Skip these cards (won't be displayed)            │
│                                                     │
│              [Apply Fix]  [Edit Manually]           │
└─────────────────────────────────────────────────────┘
```

### 2. GitHub Errors

#### Authentication Failure

**Error:**
```
HTTP 401: Bad credentials
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  GitHub Authentication Failed                       │
│                                                     │
│  Your access token is invalid or has been revoked.  │
│                                                     │
│  Common causes:                                     │
│  • Token expired (check expiration date)            │
│  • Token revoked on GitHub                          │
│  • Token has typo or formatting error               │
│                                                     │
│  Your local changes are safe.                       │
│                                                     │
│  Next steps:                                        │
│                                                     │
│      [Create New Token on GitHub →]                 │
│                                                     │
│      [Enter Different Token]                        │
│                                                     │
│      [Work Offline (Export Changes)]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Permission Denied

**Error:**
```
HTTP 403: Resource not accessible by token
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Insufficient Permissions                           │
│                                                     │
│  Your token doesn't have permission to access       │
│  username/awesome-project.                          │
│                                                     │
│  Required permissions:                              │
│  ✅ repo (read)   ← You have this                   │
│  ❌ repo (write)  ← Missing                         │
│                                                     │
│  To fix:                                            │
│  1. Go to GitHub Settings → Developer Settings      │
│  2. Edit your personal access token                 │
│  3. Enable "repo" (full control)                    │
│  4. Update token in MarkDeck                        │
│                                                     │
│      [GitHub Token Settings →]                      │
│                                                     │
│      [Update Token]  [Choose Different Repo]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Rate Limit Exceeded

**Error:**
```
HTTP 403: API rate limit exceeded
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1637251200
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  GitHub Rate Limit Exceeded                         │
│                                                     │
│  You've used all 60 API requests for this hour.     │
│                                                     │
│  Rate limit resets: 3:42 PM (in 12 minutes)         │
│                                                     │
│  What you can do now:                               │
│  • Continue editing your current project            │
│  • Changes will be saved locally                    │
│  • Push to GitHub after limit resets                │
│                                                     │
│  ⏱️ Auto-retry in: 12:34                            │ ← Live countdown
│                                                     │
│  Want more requests?                                │
│  [Learn about authenticated rate limits →]          │
│                                                     │
│              [Dismiss]  [Set Reminder]              │
└─────────────────────────────────────────────────────┘
```

**Live Countdown:**
- Updates every second
- Shows hours:minutes
- Changes to "Ready!" when reset
- Auto-dismisses and shows success toast

#### Merge Conflict

**Error:**
```
HTTP 409: Conflict
Remote file has been modified
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Merge Conflict                                     │
│                                                     │
│  The remote STATUS.md was changed while you were    │
│  editing. MarkDeck needs your help to resolve.      │
│                                                     │
│  Your local changes:                                │
│  • Moved "Fix auth bug" to DONE                     │
│  • Marked "Add API docs" as blocked                 │
│                                                     │
│  Remote changes (by @teammate):                     │
│  • Added new card "Implement search"                │
│  • Updated "Fix auth bug" description               │
│                                                     │
│  Conflict: Same card modified differently           │
│                                                     │
│  Resolution options:                                │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ ○ Keep my changes (discard remote)             ││
│  │ ○ Use remote version (discard mine)            ││
│  │ ○ Merge both (manual resolution)               ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  [Show Diff View]  [Cancel]  [Resolve Conflict]    │
└─────────────────────────────────────────────────────┘
```

**Diff View (Advanced):**
```
┌─────────────────────────────────────────────────────┐
│  Merge Conflict: Fix auth bug                       │
│                                                     │
│  Local Version (You)          Remote (teammate)     │
│  ┌─────────────────────┐     ┌─────────────────┐   │
│  │ Status: DONE        │     │ Status: TODO    │   │
│  │ Blocked: No         │     │ Blocked: No     │   │
│  │ Description:        │     │ Description:    │   │
│  │ Fixed JWT refresh   │     │ Fixed JWT       │   │
│  │ token handling      │     │ refresh tokens  │   │
│  │                     │     │ Need to test on │   │
│  │                     │     │ staging         │   │
│  └─────────────────────┘     └─────────────────┘   │
│         ↓                             ↓             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Merged Version (edit if needed)              │ │
│  │                                               │ │
│  │ Status: [DONE ▼]                              │ │
│  │ Blocked: [ ] Yes                              │ │
│  │ Description:                                  │ │
│  │ ┌───────────────────────────────────────────┐ │ │
│  │ │ Fixed JWT refresh token handling          │ │ │
│  │ │ Tested on staging successfully            │ │ │
│  │ └───────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│              [Cancel]  [Accept Merge]               │
└─────────────────────────────────────────────────────┘
```

### 3. Network Errors

#### Connection Timeout

**Error:**
```
Network request timeout after 10 seconds
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Connection Timeout                                 │
│                                                     │
│  The request to GitHub took too long.               │
│                                                     │
│  This might be due to:                              │
│  • Slow internet connection                         │
│  • GitHub API issues                                │
│  • Large repository taking time to load             │
│                                                     │
│  Suggestions:                                       │
│  • Check your internet connection                   │
│  • Try again in a few moments                       │
│  • Check GitHub Status: status.github.com           │
│                                                     │
│  Retrying... [████░░░░░░] Attempt 2/3               │ ← Auto-retry
│                                                     │
│              [Retry Now]  [Work Offline]            │
└─────────────────────────────────────────────────────┘
```

**Auto-Retry Logic:**
- Attempt 1: Immediate
- Attempt 2: 2 seconds later
- Attempt 3: 5 seconds later
- Show error if all fail
- Progress bar shows retry countdown

#### DNS/Network Failure

**Error:**
```
Failed to fetch: Network request failed
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  No Internet Connection                             │
│                                                     │
│  MarkDeck can't reach GitHub right now.             │
│                                                     │
│  Please check:                                      │
│  ✓ WiFi or ethernet connection                      │
│  ✓ Firewall settings                                │
│  ✓ VPN configuration                                │
│                                                     │
│  Don't worry—your changes are safe!                 │
│  They're saved locally and will sync when you're    │
│  back online.                                       │
│                                                     │
│  Offline Mode Active                                │
│  • All edits saved locally                          │
│  • Push when connection restored                    │
│  • Export changes as file anytime                   │
│                                                     │
│              [Retry]  [Export Changes]              │
└─────────────────────────────────────────────────────┘
```

### 4. File System Errors

#### File Too Large

**Error:**
```
File exceeds 5 MB limit
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  File Too Large                                     │
│                                                     │
│  STATUS.md is 8.2 MB (limit: 5 MB)                  │
│                                                     │
│  Large files may cause performance issues:          │
│  • Slow parsing and rendering                       │
│  • Browser memory problems                          │
│  • GitHub API restrictions                          │
│                                                     │
│  Recommendations:                                   │
│  • Split into multiple STATUS.md files              │
│  • Archive completed items                          │
│  • Remove large embedded content                    │
│                                                     │
│  Try anyway? (Performance not guaranteed)           │
│                                                     │
│  [Learn More]  [Cancel]  [Load Anyway]              │
└─────────────────────────────────────────────────────┘
```

#### Corrupted File

**Error:**
```
Invalid UTF-8 encoding detected
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  File Encoding Error                                │
│                                                     │
│  STATUS.md contains invalid characters or encoding. │
│                                                     │
│  This file might be:                                │
│  • Corrupted during download/upload                 │
│  • Saved with incorrect encoding                    │
│  • Contains binary data                             │
│                                                     │
│  To fix:                                            │
│  1. Open file in text editor (VS Code, Sublime)     │
│  2. Save with UTF-8 encoding                        │
│  3. Try uploading again                             │
│                                                     │
│  Need help?                                         │
│  [View Troubleshooting Guide →]                     │
│                                                     │
│              [Try Different File]  [Get Help]       │
└─────────────────────────────────────────────────────┘
```

### 5. Application Errors

#### Unhandled Exception

**Error:**
```
Uncaught TypeError: Cannot read property 'cards' of undefined
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Something Went Wrong                               │
│                                                     │
│  MarkDeck encountered an unexpected error.          │
│                                                     │
│  Your work is safe. Changes have been auto-saved    │
│  to your browser's storage.                         │
│                                                     │
│  Error ID: err_2025_1120_1523                       │
│                                                     │
│  What you can do:                                   │
│                                                     │
│  [Reload Page]     ← Restart the app                │
│  [Export Changes]  ← Download your work             │
│  [Report Bug]      ← Help us fix this               │
│                                                     │
│  Technical details (for developers):                │
│  ┌───────────────────────────────────────────────┐ │
│  │ TypeError: Cannot read property 'cards'       │ │
│  │ at parseStatusMarkdown (parser.ts:42)         │ │
│  │ Stack trace... [Expand ▼]                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Report Bug Flow:**
1. Opens GitHub issue template
2. Pre-fills error details, user agent, stack trace
3. User adds reproduction steps
4. Submits to MarkDeck repo

#### Out of Memory

**Error:**
```
JavaScript heap out of memory
```

**Recovery:**
```
┌─────────────────────────────────────────────────────┐
│  Browser Memory Limit Reached                       │
│                                                     │
│  MarkDeck is using too much memory.                 │
│                                                     │
│  This can happen with:                              │
│  • Very large STATUS.md files (1000+ cards)         │
│  • Many browser tabs open                           │
│  • Low device memory                                │
│                                                     │
│  Quick fixes:                                       │
│  • Close other browser tabs                         │
│  • Enable virtualization for large boards           │
│  • Split project into smaller files                 │
│                                                     │
│  Your changes have been saved.                      │
│                                                     │
│  [Reload with Optimizations]  [Export & Close]      │
└─────────────────────────────────────────────────────┘
```

---

## Recovery Workflows

### Auto-Recovery (Silent)

**Scenarios that auto-recover without user intervention:**

1. **Transient Network Errors** - Auto-retry 3 times with exponential backoff
2. **Minor Parse Warnings** - Apply sensible defaults, continue loading
3. **Session Restoration** - Reload last project from localStorage
4. **Offline Sync Queue** - Auto-push when connection restored

**User Feedback:**
- Subtle info toast: "Reconnected to GitHub"
- No modal interruptions
- Background progress indicators

### Manual Recovery (User Choice)

**Scenarios requiring user decision:**

1. **Merge Conflicts** - User chooses which version to keep
2. **Parse Errors** - User fixes markdown or accepts auto-fixes
3. **Permission Issues** - User updates token or changes provider
4. **Data Loss Risk** - User confirms before discarding changes

**UI Patterns:**
- Modal with clear options
- Recommended action highlighted
- Secondary actions clearly labeled
- Cancel always available

### Guided Recovery (Wizard)

**Complex multi-step recovery:**

**Example: Resolve Merge Conflict Wizard**

```
Step 1: Understand Conflict
┌─────────────────────────────────────────────────────┐
│  Merge Conflict Detected (Step 1 of 3)              │
│                                                     │
│  What happened:                                     │
│  While you were editing, someone else pushed        │
│  changes to the same STATUS.md file.                │
│                                                     │
│  Cards affected: 2                                  │
│  Your changes: 3 cards modified                     │
│  Their changes: 2 cards modified, 1 added           │
│                                                     │
│                          [Next: Review Changes →]   │
└─────────────────────────────────────────────────────┘

Step 2: Review Conflicts
┌─────────────────────────────────────────────────────┐
│  Review Conflicts (Step 2 of 3)                     │
│                                                     │
│  Conflict 1 of 2: "Fix auth bug"                    │
│                                                     │
│  Your change:         Remote change:                │
│  Status: DONE         Status: IN PROGRESS           │
│                                                     │
│  Choose version:                                    │
│  ○ Keep mine (DONE)                                 │
│  ● Use theirs (IN PROGRESS)                         │
│  ○ Edit manually                                    │
│                                                     │
│  [← Back]  [Next: Conflict 2 →]                     │
└─────────────────────────────────────────────────────┘

Step 3: Confirm & Apply
┌─────────────────────────────────────────────────────┐
│  Confirm Resolution (Step 3 of 3)                   │
│                                                     │
│  Summary of resolutions:                            │
│                                                     │
│  Conflict 1: "Fix auth bug"                         │
│  → Using remote version (IN PROGRESS)               │
│                                                     │
│  Conflict 2: "Add docs"                             │
│  → Keeping your version (DONE)                      │
│                                                     │
│  Ready to merge and push?                           │
│                                                     │
│  [← Back]  [Cancel]  [Merge & Push]                 │
└─────────────────────────────────────────────────────┘
```

---

## Error Prevention

### Proactive Validation

**Real-Time Feedback:**
- Token format validation as user types
- File size check before upload
- Network status monitoring
- Unsaved changes warning before navigation

**Example: Token Validation**
```
┌───────────────────────────────────────┐
│ GitHub Token                          │
│ ┌───────────────────────────────────┐ │
│ │ ghp_                              │ │
│ └───────────────────────────────────┘ │
│ ⓘ Keep typing... (min 40 characters)  │
└───────────────────────────────────────┘

→ (User types more)

┌───────────────────────────────────────┐
│ GitHub Token                          │
│ ┌───────────────────────────────────┐ │
│ │ ghp_1234567890abcdef1234567890ab │ │
│ └───────────────────────────────────┘ │
│ ✓ Format valid                        │
└───────────────────────────────────────┘
```

### Confirmations Before Destructive Actions

**Unsaved Changes:**
```
Before navigation away:

┌───────────────────────────────────────┐
│  Leave Page?                          │
│                                       │
│  You have unsaved changes.            │
│                                       │
│  [Stay]  [Leave Without Saving]       │
└───────────────────────────────────────┘
```

**Discard Changes:**
```
Before reload/reset:

┌───────────────────────────────────────┐
│  Discard Changes?                     │
│                                       │
│  This will reload the file and lose   │
│  any edits you've made.               │
│                                       │
│  [Cancel]  [Discard & Reload]         │
└───────────────────────────────────────┘
```

**Force Push:**
```
Before overwriting remote:

┌───────────────────────────────────────┐
│  ⚠️ Force Push Warning                │
│                                       │
│  This will overwrite remote changes   │
│  made by @teammate.                   │
│                                       │
│  Are you absolutely sure?             │
│                                       │
│  [Cancel]  [Yes, Force Push]          │
└───────────────────────────────────────┘
```

---

## Help and Documentation Links

### Contextual Help

**Every error includes:**
- **What happened** - Plain language explanation
- **Why it happened** - Root cause (when known)
- **How to fix** - Actionable steps
- **Learn more** - Link to docs

**Example Links:**
- GitHub token creation: `https://markdeck.dev/docs/github-setup`
- STATUS.md format: `https://markdeck.dev/docs/markdown-format`
- Troubleshooting: `https://markdeck.dev/docs/troubleshooting`
- Report bug: `https://github.com/username/markdeck/issues/new`

### Error Code Reference

**All errors have unique codes for searchability:**

| Code         | Category         | Example                          |
|--------------|------------------|----------------------------------|
| `PARSE_001`  | Parser           | Unknown status emoji             |
| `PARSE_002`  | Parser           | Missing H1 title                 |
| `PARSE_003`  | Parser           | Orphaned cards                   |
| `GH_001`     | GitHub           | Invalid token                    |
| `GH_002`     | GitHub           | Permission denied                |
| `GH_003`     | GitHub           | Rate limit exceeded              |
| `NET_001`    | Network          | Connection timeout               |
| `NET_002`    | Network          | DNS failure                      |
| `FILE_001`   | File System      | File too large                   |
| `FILE_002`   | File System      | Invalid encoding                 |
| `APP_001`    | Application      | Unhandled exception              |
| `APP_002`    | Application      | Out of memory                    |

**Error Log Export:**
- Download full error log as JSON
- Includes timestamps, stack traces, user agent
- Useful for bug reports

---

## Accessibility

### Screen Reader Announcements

**Error Appearance:**
- Immediate `role="alert"` announcement
- Specific error message read aloud
- Action buttons announced

**Example:**
```
Screen reader: "Alert. Network error. Unable to reach GitHub. Retry button. Work Offline button."
```

### Keyboard Navigation

**Error Dialogs:**
- Focus automatically moves to first action button
- `Tab` cycles through actions
- `Escape` dismisses dismissible errors
- Focus returns to trigger element on close

**Toasts:**
- Announce but don't trap focus (non-critical)
- `Escape` dismisses focused toast
- Action buttons keyboard-accessible

### Visual Indicators

**Color + Icon + Text:**
- Never rely on color alone
- Always pair with icon (✅ ℹ️ ⚠️ ❌)
- Text labels on all actions

**Contrast:**
- Error text: 7:1 (AAA level)
- Error backgrounds: Sufficient distinction from normal states
- Focus indicators: 3:1 minimum

---

## Performance Targets

| Metric                        | Target    | Notes                           |
|-------------------------------|-----------|---------------------------------|
| Toast render time             | <50ms     | Instant feedback                |
| Error modal open              | <100ms    | Smooth animation                |
| Auto-retry delay (1st)        | 0ms       | Immediate                       |
| Auto-retry delay (2nd)        | 2s        | Quick second attempt            |
| Auto-retry delay (3rd)        | 5s        | Final attempt before user error |
| Error log export              | <200ms    | JSON serialization              |
| Network timeout               | 10s       | Balance UX vs. connectivity     |

---

**Approved by:** UX Lead  
**Date:** 2025-11-20  
**Version:** 1.0
