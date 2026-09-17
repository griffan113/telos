---
feature: orchestrator-unslop
task: 3
title: Add the unslop section to the six remaining agent sources
status: done
issue: 25
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

## Evidence

Task 3 executed against `.telos/features/orchestrator-unslop/tasks/3-six-agents-unslop-section/TASK.md`. All six files (agents/specify.md, agents/contracts.md, agents/design.md, agents/tasks.md, agents/implement.md, agents/diagnosis.md) received exactly two changes each: one added `- .telos/references/unslop.md` frontmatter line after the existing required-references entry, and one `## Unslop` section (three-step process + scope guard + per-agent pinned surface list) at the pinned placement. No other lines moved — the diff against agents/ contains zero deletion or modification lines (pure insertions).

Note: task 2 (agents/orchestrator.md) ran concurrently and was not edited by this task; its changes appear in the shared `git diff --stat agents/` output below but are owned by task 2.

Verification plan results, run from the repo root:

Step 1 — `grep -l 'unslop.md' agents/*.md`:

```
agents/contracts.md
agents/design.md
agents/diagnosis.md
agents/implement.md
agents/orchestrator.md
agents/specify.md
agents/tasks.md
```

All seven agent sources match (seven, including orchestrator.md edited by task 2).

Step 2 — `grep -nE 'scan|rewrite|self-audit' agents/<file>.md` for each of the six files. Representative output (identical wording in all six; line numbers vary by file):

```
--- specify
20:scan the draft for AI-writing patterns, rewrite it preserving meaning and
21:intended tone, then self-audit and fix what remains — under the scope guard
--- contracts
20:scan the draft for AI-writing patterns, rewrite it preserving meaning and
21:intended tone, then self-audit and fix what remains — under the scope guard
--- design
20:scan the draft for AI-writing patterns, rewrite it preserving meaning and
21:intended tone, then self-audit and fix what remains — under the scope guard
--- tasks
21:scan the draft for AI-writing patterns, rewrite it preserving meaning and
22:intended tone, then self-audit and fix what remains — under the scope guard
--- implement
52:scan the draft for AI-writing patterns, rewrite it preserving meaning and
53:intended tone, then self-audit and fix what remains — under the scope guard
--- diagnosis
82:scan the draft for AI-writing patterns, rewrite it preserving meaning and
83:intended tone, then self-audit and fix what remains — under the scope guard
```

Step 3 — `grep -n '## Context reconstruction\|## Gate\|## Language\|## Commit\|## Unslop' agents/*.md` (## Unslop added to the pattern for placement proof):

```
agents/contracts.md:15:## Unslop
agents/contracts.md:39:## Context reconstruction (standalone-safe)
agents/contracts.md:68:## Gate
agents/design.md:15:## Unslop
agents/design.md:38:## Context reconstruction (standalone-safe)
agents/design.md:66:## Gate
agents/diagnosis.md:16:## Context reconstruction (standalone-safe)
agents/diagnosis.md:72:## Language
agents/diagnosis.md:77:## Unslop
agents/diagnosis.md:104:## Commit
agents/implement.md:13:## Context reconstruction (standalone-safe)
agents/implement.md:47:## Unslop
agents/implement.md:75:## Gate
agents/orchestrator.md:21:## Unslop
agents/specify.md:15:## Unslop
agents/specify.md:38:## Context reconstruction (standalone-safe)
agents/specify.md:72:## Gate
agents/tasks.md:16:## Unslop
agents/tasks.md:43:## Context reconstruction (standalone-safe)
agents/tasks.md:102:## Gate
```

Placements confirmed: `## Unslop` sits after the intro language sentence and before `## Context reconstruction` in specify/contracts/design/tasks; after the language sentence and before `## Gate` in implement; after `## Language` and before `## Commit` in diagnosis. All pre-existing sections unchanged.

Step 4 — `git diff --stat agents/`:

```
 agents/contracts.md    | 25 +++++++++++++++++++++++++
 agents/design.md       | 24 ++++++++++++++++++++++++
 agents/diagnosis.md    | 28 ++++++++++++++++++++++++++++
 agents/implement.md    | 29 +++++++++++++++++++++++++++++
 agents/orchestrator.md | 31 +++++++++++++++++++++++++++++++
 agents/specify.md      | 24 ++++++++++++++++++++++++
 agents/tasks.md        | 28 ++++++++++++++++++++++++++++
 7 files changed, 189 insertions(+)
```

Six files modified by this task (orchestrator.md by task 2); every change is a pure insertion.

Extra check (not the test suite) — frontmatter still parses via the live parser (`loadAgents()` in src/agents.js):

```
telos-contracts => [".telos/references/pipeline.md",".telos/references/unslop.md"]
telos-design => [".telos/references/pipeline.md",".telos/references/unslop.md"]
telos-diagnosis => [".telos/references/diagnosis.md",".telos/references/unslop.md"]
telos-implement => [".telos/references/pipeline.md",".telos/references/unslop.md"]
telos-specify => [".telos/references/pipeline.md",".telos/references/unslop.md"]
telos-tasks => [".telos/references/pipeline.md",".telos/references/unslop.md"]
```

No blockers. Not committed; test suite untouched (task 4 owns it).
