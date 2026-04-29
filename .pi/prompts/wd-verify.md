---
description: Determine the right validation scope, run it, and confirm docs and TODOs are synchronized
argument-hint: "[scope]"
---

Determine the affected scope for: $@.

Then:

1. choose the smallest sufficient validation set
2. run the relevant commands
3. summarize pass/fail status
4. list anything intentionally not run
5. confirm whether `AGENTS.md`, `.github/copilot-instructions.md`, `.pi/skills/`, `.pi/prompts/`, and `TODO.md` need updates based on the changes

Prefer targeted validation first, then broaden only when the change spans multiple packages or boundaries.
