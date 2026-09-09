---
id: 002
title: "002: Package skeleton + telos init core"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: []
---

# 002: Package skeleton + telos init core

**What to build:** Running `npx telos init` in an empty repository scaffolds the complete `.telos/` tree (telos.json, references, project, features, tracker.md), interactively asks for the tracker (local markdown as default), the artifact language (common languages + free text, English when skipped), and the harness (auto-detect, prompt on zero/ambiguous, flag override always wins), then prints the "now say **start telos**" instruction to the user. This ticket also establishes the founding test suite pattern: the CLI executed against disposable temp directories, asserting the generated output tree — the only automated seam in the project.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] `npx telos init` produces the full `.telos/` tree with a valid telos.json recording framework version, tracker choice, artifact language, and harness list
- [x] Language prompt offers common languages plus free text, defaulting to English when skipped
- [x] Tracker prompt offers github / azure / local, local defaulting when no remote exists
- [x] Harness detection recognizes all four harnesses; zero or multiple detections prompt the user; the harness flag overrides detection
- [x] Re-running init on an initialized repo is non-destructive and reports current state
- [x] The temp-directory CLI test suite exists and is the project's only automated test pattern
