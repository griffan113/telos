---
feature: orchestrator-unslop
task: 3
title: Add the unslop section to the six remaining agent sources
status: pending
depends_on: []
requirements: [REQ-3, REQ-6]
---

## Implementation notes

Edit six files: `agents/specify.md`, `agents/contracts.md`,
`agents/design.md`, `agents/tasks.md`, `agents/implement.md`,
`agents/diagnosis.md`. Per file, the same two mechanical changes (C-3a,
C-3b); nothing else moves.

1. Frontmatter: add `- .telos/references/unslop.md` under
   `required-references` after the existing entry (`pipeline.md` for the
   five pipeline agents, `diagnosis.md` for the diagnosis agent). One
   `- ` list line per entry (parser constraint, `src/agents.js:17-35`).

2. Body: the shared `## Unslop` section template (same mechanics as task 2,
   without the orchestrator-specific carve-out), placed:

   - `specify.md`, `contracts.md`, `design.md`, `tasks.md`: after the intro
     language sentence, before `## Context reconstruction`.
   - `implement.md`: after the language sentence (~line 44), before
     `## Gate`.
   - `diagnosis.md`: inside/after `## Language`, before `## Commit`.

   Each section states: unslop is a default behavior — run the three-step
   process (scan → rewrite → self-audit, per
   `.telos/references/unslop.md`) over every conversational reply addressed
   to the user and over the prose of every documentation surface listed
   below, under the scope guard (C-5), in the artifact language from
   `telos.json`. Then that agent's own covered surfaces, per C-3b's pinned
   list:

   - specify: gate presentations and re-presentations; clarifying replies;
     prose of spec.md (surface 2).
   - contracts: gate presentations and re-presentations; clarifying
     replies; prose of contracts.md — interface definitions stay in code
     syntax (surface 2).
   - design: gate presentations and re-presentations; clarifying replies;
     prose of design.md (surface 2).
   - tasks: gate presentations and re-presentations; clarifying replies;
     prose of tasks.md (table mechanical cells stay) and TASK.md bodies;
     tracker issue bodies and comments written at approval sync, including
     `superseded:` comments — title convention and `Blocked by:` format
     fixed (surfaces 2, 3, 4).
   - implement: the return summary (≤10 lines); questions and blockers
     raised mid-task; TASK.md body notes and evidence narration (commands
     and literal output verbatim); tracker comments via `close_task`;
     commit message prose (type/scope and issue references fixed);
     README/docs or AGENTS.md/CLAUDE.md guidance sections the work touches
     (surfaces 3, 4, 5).
   - diagnosis: the ranked-hypotheses message; the pre-fix gate summary
     (confirmed symptoms, winning hypothesis, planned fix — quoted
     unchanged when relayed); the post-fix report; commit message prose
     (`fix:` prefix fixed, `[DEBUG-…]` log tags stay fixed). No REQ-7 doc
     surfaces beyond that.

Mechanics untouched everywhere (C-3 closing constraint).

## Verification plan

1. `grep -l 'unslop.md' agents/*.md` — all seven agent sources match
   (including orchestrator, edited by task 2).
2. For each of the six files: `grep -nE 'scan|rewrite|self-audit'
   agents/<file>.md` — the three-step process named.
3. `grep -n '## Context reconstruction\|## Gate\|## Language\|## Commit'
   agents/*.md` — the sections sit at their pinned placements, and the
   surrounding mechanics are unchanged.
4. `git diff --stat agents/` — exactly six files modified, each only
   frontmatter plus the new section.
