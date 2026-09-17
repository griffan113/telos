---
feature: orchestrator-unslop
task: 2
title: Add the unslop section to agents/orchestrator.md
status: pending
issue: 24
depends_on: []
requirements: [REQ-2, REQ-3, REQ-6]
---

## Implementation notes

Edit `agents/orchestrator.md` only. Two mechanical changes (C-3a, C-3b);
nothing else in the file moves.

1. Frontmatter: add one list line under `required-references`:

   ```yaml
   - .telos/references/unslop.md
   ```

   after the existing `- .telos/references/pipeline.md` entry. The minimal
   list parser in `src/agents.js:17-35` requires `- ` lines, one per entry.

2. Body: add the shared `## Unslop` section template right after the
   language statement (~line 18), before `## Routing`. The section states:
   unslop is a default behavior — run the three-step process (scan →
   rewrite → self-audit, per `.telos/references/unslop.md`) over every
   conversational reply addressed to the user and over the prose of every
   documentation surface listed below, under the scope guard (prose/
   technical boundary, C-5), in the artifact language from `telos.json`.
   Then the orchestrator's own covered surfaces, so a reader of this file
   alone can enumerate them:

   - Conversational: approval-gate presentations and re-presentations;
     relays of phase-agent summaries (≤10 lines, technical content intact);
     "start telos" initialization and state reports; resume/STATE.md
     reports; next-step proposals; routing and clarifying questions.
   - Diagnosis-relay carve-out: the framing may be unslopped, but the
     confirmed symptoms, winning hypothesis, and planned fix are quoted
     unchanged.
   - Documentation (REQ-7 surface 1): prose of PROJECT.md, ROADMAP.md, and
     the decisions & blockers prose of STATE.md (tables stay structural).

Mechanics untouched: gate semantics, the at-most-10-line summary limit,
hard-stop message wording, dispatch contract, tracker ops (C-3 closing
constraint).

## Verification plan

1. `grep -n 'unslop.md' agents/orchestrator.md` — present in the
   `required-references` block.
2. `grep -nE 'scan|rewrite|self-audit' agents/orchestrator.md` — the
   three-step process named in the section.
3. `grep -n '## Routing' agents/orchestrator.md` — the section sits before
   it and the routing logic is unchanged.
4. `git diff agents/orchestrator.md` — only the frontmatter line and the
   new section added; no gate/dispatch/tracker wording touched.
