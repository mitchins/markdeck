# Invalid STATUS.md Examples

This file intentionally contains various malformed markdown scenarios for error handling tests.

## Lane without cards

(This lane has no cards)

Random text without structure

- Bullet without emoji
    This should be handled gracefully

- 🔥 Unknown emoji that's not in our status mapping
    What should we do with this?

Orphan card not in any lane:
- ✅ This card appears before any H2 header

## Another Lane

- ⚡ Another unknown emoji
- Multiple emojis: ✅ ⚠️ ❗ (too many!)

<!-- Unclosed HTML comment

## Missing title H1

(This file has no H1 title at the top)
