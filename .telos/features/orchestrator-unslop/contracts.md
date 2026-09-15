---
phase: contracts
status: approved
approved_at: 2026-09-15T01:43:04Z
depends_on: [spec]
content_hash: bb9382b36ddfdc9083a55563bf9b49b7
---

# contracts.md — orchestrator-unslop

This feature touches files and their observable shape, not code APIs. The
live code already provides every seam it needs (`src/scaffold.js`,
`src/render.js`, `src/update.js`, the four adapters); the contracts below pin
the file shapes, the eight source files that may change (seven agents + one
reference), and the render/test invariants design and tasks must validate
against. All code seams were analyzed live at telos v0.0.3, after the spec's
revision widened unslop from an orchestrator-only conversational discipline
to a default behavior of all seven agents, covering conversation **and**
documentation.

## C-1 — Shipped reference file `references/unslop.md` (package root)

Serves: REQ-1, REQ-4, REQ-7

A new file at the package root, sibling of the existing `references/pipeline.md`
and `references/diagnosis.md`. It ships with the package (`copyReferences`
reads from this tree at runtime) and is authored in the same register as those
two references: imperative, discipline-first, English instruction text.

```text
path: references/unslop.md          # package root (shipped)
register: same as references/pipeline.md and references/diagnosis.md
language of instructions: English    # pipeline.md convention; patterns apply in any language

required sections (observable shape):
  1. Purpose statement: unslop = the default writing discipline of every
     Telos agent — applied to conversational replies to the user and to the
     prose of the documentation the agent writes (coverage list, section 4).
  2. Three-step process:
     (1) scan the draft for known AI-writing patterns;
     (2) rewrite, preserving meaning and intended tone;
     (3) self-audit — "what makes this obviously AI-generated?" — and fix
         what remains.
  3. Pattern catalogue with stable rule IDs (see C-1a).
  4. Language-independence statement + non-English examples (see C-1b).
  5. Documentation coverage list (see C-1c) — pinned content of this file.
  6. Scope guard (see C-5) — stated in this file explicitly.
```

### C-1a — Stable rule IDs

Serves: REQ-1

```text
rule id grammar:  R-<n>        # n carried over from the source skill:
                               # cursor/plugins pstack/skills/unslop/SKILL.md
gap policy:       dropping or merging a rule leaves its number unused;
                  numbering is never shifted or renumbered — other docs may
                  cite any R-<n> at any time.
catalogue coverage (each entry has an R-<n> id):
  AI vocabulary; "not just X but Y"; rule-of-three; synonym cycling;
  em dash / colon / boldface overuse; inline-header lists; title-case
  headings; decorative emoji; curly quotes; chatbot phrases; sycophancy;
  filler and hedging; generic conclusions; abstract metaphor nouns;
  mannered prose; over-compression; "say what it does, not how it feels";
  plain-word / active-voice disciplines.
```

The exact `R-<n>` → category mapping is inherited from the source skill, not
invented here; the contract pins the scheme (stable IDs, gaps preserved) and
the required coverage above.

### C-1b — Language independence

Serves: REQ-4

```text
required statement: the patterns are detected in whatever language the text
  is written in — a conversational reply or a documentation file — not only
  in English; scan/rewrite/self-audit run without translating first.
required example set (Portuguese, at minimum):
  filler/hedging:        "É importante notar que…", "além disso"
  sycophantic openers:   (a concrete Portuguese example)
  chatbot phrases:       "Espero que isso ajude!", "Ficarei à disposição"
  false-contrast:        "não apenas X, mas sim Y"
  inflated vocabulary:   "crucial" / "fundamental" / "robusto"
  em dash overuse, passive voice   (concrete Portuguese examples)
```

### C-1c — Documentation coverage list (pinned content)

Serves: REQ-7

The reference file carries the spec's five-surface coverage list verbatim in
substance, so every agent consuming the reference resolves the same set
without reading the spec:

```text
required coverage list (five numbered surfaces, as in REQ-7):
  1. orchestrator-authored project files:
       prose of PROJECT.md, ROADMAP.md, and the decisions & blockers
       prose of STATE.md (tables stay structural)
  2. phase artifact prose:
       spec.md, contracts.md (interface definitions stay in code syntax),
       design.md, tasks.md (table structural/mechanical cells stay)
  3. TASK.md bodies:
       implementation notes, verification-plan prose, evidence narration
       (commands and their literal output stay verbatim)
  4. tracker issue bodies and comments (github/azure):
       body prose and comments; excluded: the fixed `telos:` title
       convention and the `Blocked by:` line format
  5. reference and doc files agents ship or edit as feature work:
       prose in `.telos/references/*` files an agent authors or revises,
       guidance sections in the consumer repo's AGENTS.md / CLAUDE.md,
       README/docs files tasks touch — in the language each file is
       maintained in
```

## C-2 — Init reference-copy mechanism (zero code change)

Serves: REQ-1

Live behavior, verified at `src/scaffold.js:31-56`: `scaffold()` calls
`copyReferences()` → `copyReferenceTree(packageRoot/references, .telos/references)`,
which copies **every** file in the package-root `references/` tree recursively
(`missingOk: true`). Adding `references/unslop.md` therefore lands
`.telos/references/unslop.md` in every initialized repo with **no code
change**:

```text
telos init  ⇒  .telos/references/unslop.md exists   # via copyReferenceTree
constraint: src/scaffold.js, src/init.js unchanged by this feature
test contract (new, extends test/init.test.js):
  after `telos init` in a temp repo:
    assert .telos/references/unslop.md exists and matches:
      /scan/ + /rewrite/ + /self-audit|self-auditing/    # three steps
      /R-\d+/                                            # stable rule IDs
      /any language|não apenas|Espero que isso ajude/    # scope + PT examples
      coverage list present  (≥ PROJECT.md, TASK.md, tracker, AGENTS.md)
      scope guard present    (prose/technical boundary, C-5)
```

## C-3 — The seven agent sources

Serves: REQ-6, REQ-3, REQ-2

Every one of `agents/orchestrator.md`, `agents/specify.md`,
`agents/contracts.md`, `agents/design.md`, `agents/tasks.md`,
`agents/implement.md`, `agents/diagnosis.md` gets the same two-part change.
Nothing else in any file's mechanics moves.

### C-3a — Frontmatter: required-references gains unslop (all seven)

```yaml
# six pipeline agents (orchestrator, specify, contracts, design, tasks,
# implement), after the change:
required-references:
  - .telos/references/pipeline.md      # existing, unchanged
  - .telos/references/unslop.md        # added

# diagnosis agent, after the change:
required-references:
  - .telos/references/diagnosis.md     # existing, unchanged
  - .telos/references/unslop.md        # added
```

Parser constraint (live code, `src/agents.js:17-35`): `parseFrontmatter` uses
a minimal `key:` / `- list entry` parser; each entry must be a `- ` list line
under `required-references` (exactly as the existing entries are formatted).
One line per entry, no inline arrays.

### C-3b — Body: unslop instruction section per agent (all seven)

Each agent source gains a short instruction section. The heading text is a
design choice; presence and content are the contract. Every section must
state: unslop is a **default behavior** — run the three-step process (scan →
rewrite → self-audit) over every conversational reply addressed to the user
and over the prose of every documentation surface the agent authors or edits,
under the C-5 boundary, in the artifact language from `telos.json`. Each
section then names that agent's own covered surfaces, so a reader of the
agent source alone can enumerate them (REQ-6 acceptance criterion).

Per-agent surface lists, derived from the live agent sources:

```text
orchestrator (agents/orchestrator.md):
  conversational: approval-gate presentations; relays of phase-agent
    summaries (≤10 lines, technical content intact); "start telos"
    initialization and state reports; resume/STATE.md reports; next-step
    proposals; routing/clarifying questions.
  diagnosis-relay carve-out: framing may be unslopped, but confirmed
    symptoms, winning hypothesis, and planned fix are quoted unchanged (REQ-2).
  documentation: prose of PROJECT.md, ROADMAP.md; decisions & blockers prose
    of STATE.md (tables structural)              # REQ-7 surface 1

specify (agents/specify.md):
  conversational: elicitation interview questions; gate presentations and
    re-presentation on revision feedback; clarifying replies.
  documentation: prose of spec.md               # REQ-7 surface 2

contracts (agents/contracts.md):
  conversational: gate presentations and re-presentations; clarifying replies.
  documentation: prose of contracts.md — interface definitions stay in code
    syntax per pipeline.md                       # REQ-7 surface 2

design (agents/design.md):
  conversational: gate presentations and re-presentations; clarifying replies.
  documentation: prose of design.md             # REQ-7 surface 2

tasks (agents/tasks.md):
  conversational: gate presentations and re-presentations; clarifying replies.
  documentation: prose of tasks.md (table structural/mechanical cells stay);
    TASK.md bodies — implementation notes and verification-plan prose;
    tracker issue bodies and comments written at approval sync, including
    `superseded:` comments (title convention and `Blocked by:` format fixed)
                                                # REQ-7 surfaces 2, 3, 4

implement (agents/implement.md):
  conversational: the return summary (≤10 lines); questions/blockers raised
    mid-task.
  documentation: TASK.md body — implementation notes, verification-plan
    prose, evidence narration (commands and literal output verbatim);
    tracker comments via `close_task`; commit message prose (Conventional
    Commits type/scope and issue references fixed); any README/docs or
    AGENTS.md/CLAUDE.md guidance sections the task's feature work touches
                                                # REQ-7 surfaces 3, 4, 5

diagnosis (agents/diagnosis.md):
  conversational: the ranked-hypotheses message; the pre-fix gate summary
    (confirmed symptoms, winning hypothesis, planned fix — quoted unchanged
    when relayed by the orchestrator); the post-fix report.
  documentation: commit message prose (`fix:` prefix fixed, hypothesis body
    may be unslopped). Diagnosis produces zero artifacts — it has no REQ-7
    doc surfaces beyond this. `[DEBUG-…]` log tags stay fixed (technical).
```

Mechanics untouched everywhere: gate semantics, the at-most-10-line summary
limit, hard-stop message wording, dispatch contract, tracker ops — the
sections add a style discipline only.

## C-4 — Rendered harness outputs

Serves: REQ-2, REQ-5, REQ-6

Live render pipeline, verified in code:

- `src/render.js:13-24` (`renderFor`) loads agents via `loadAgents()`
  (`src/agents.js:7-15`, reads every `agents/*.md`) and calls each adapter.
  All seven agents flow through the same path; nothing is orchestrator-only.
- `src/render.js:29-40` (`withRequiredReferences`) injects the block
  `## Required references` into the **body** of every agent that has
  `required-references`, one `- <path>` line per entry. After C-3a, every
  rendered agent lists both its existing reference and unslop:

```text
## Required references

Read these before acting:
- .telos/references/pipeline.md        # or diagnosis.md for telos-diagnosis
- .telos/references/unslop.md
```

- Adapter output paths (all four harnesses render all seven updated agents;
  verified at `adapters/*/index.js`):

```text
opencode:     .opencode/agent/telos-<name>.md
claude-code:  .claude/agents/telos-<name>.md
copilot:      .github/chatmodes/telos-<name>.chatmode.md   (+ orchestrator Harness note addendum)
codex:        .codex/skills/telos-<name>/SKILL.md          (+ orchestrator Harness note addendum)
every render carries the marker:  <!-- telos:generated v<version> -->   (src/render.js:42)
```

  `<name>` ∈ orchestrator, specify, contracts, design, tasks, implement,
  diagnosis (from each agent's frontmatter `name:`; confirmed in
  test/agents.test.js `AGENT_NAMES`).
- User-owned skip (live, `src/render.js:48-69`): files lacking the
  `telos:generated` marker are never overwritten — invariant preserved; all
  rendered agent files carry the marker, so they regenerate.
- Re-render command (REQ-5): `node bin/telos.js update` in this repo —
  `src/update.js:62` re-renders from `telos.json.harnesses` (here:
  `["opencode"]`), so only `.opencode/agent/*` regenerate locally; the other
  three harness paths are exercised by the test suite via `telos init`.

### C-4a — Open seam for Design (widened)

`telos update` does **not** copy references (`copyReferences` runs only inside
`scaffold()` during `telos init`, `src/scaffold.js:14`). So after re-render,
this repo's **seven** rendered agents will name `.telos/references/unslop.md`
while that file does not yet exist locally (this repo's `.telos/references/`
currently holds only `pipeline.md` — diagnosis.md is absent here too,
pre-existing state). Design must decide how the in-repo copy lands (e.g. a
manual copy of the shipped reference) so every agent's required reference
resolves at runtime in this repo. No mechanism change is required by the
spec; this is a bookkeeping decision, not a code contract.

## C-5 — Prose/technical boundary and diff surface

Serves: REQ-3

The guard, stated explicitly in **both** `references/unslop.md` (C-1 section
6) and **every** one of the seven agent instruction sections (C-3b), in the
revised (prose/technical) form the amended REQ-3 defines:

```text
scope guard (prose/technical boundary):
  unslop edits the PROSE of what agents write — conversation and
  documentation. it never rewrites technical content, which stays exactly
  as the mechanics require:
    - code and code blocks, commands, file paths, directory names
    - REQ-NN ids, unslop R-<n> rule ids, tracker issue numbers, task NNs,
      the fixed-ASCII `telos:` tracker title convention
    - artifact frontmatter and structural/mechanical table cells
      (statuses, dependency lists, hash columns)
    - quoted verbatim text: user feedback, confirmed symptoms, quoted
      artifact passages, hard-stop messages (fixed strings)
    - mechanical parts of commit messages: Conventional Commits type/scope,
      fix:/superseded: prefixes, issue references (prose bodies may be
      unslopped)
  preserved: meaning, tone, and every mechanical obligation — gate
  semantics ("approve advances / request changes loops"), the
  at-most-10-line summary limit, hard-stop message wording, and the exact
  technical strings above. only prose style changes.
```

Diff surface — the pipeline source files this feature's diff may touch
(verify with `git diff --stat` against the feature base):

```text
new:      references/unslop.md
modified: agents/orchestrator.md
          agents/specify.md
          agents/contracts.md
          agents/design.md
          agents/tasks.md
          agents/implement.md
          agents/diagnosis.md          # seven agent sources, all
modified: test/init.test.js and/or test/agents.test.js
          # new assertions per C-2 / REQ-4 / REQ-5 / REQ-6
no changes: src/*, adapters/*, references/pipeline.md, references/diagnosis.md
```

The spec's REQ-3 acceptance criterion ("only `agents/*.md` (seven files) and
`references/unslop.md` change") is read as its non-goal states it — the hard
prohibition is **no `src/` or `adapters/` changes**; the test assertions the
spec itself requires (REQ-1, REQ-4, REQ-5) are part of this feature's diff.

Rendered outputs are excluded from this constraint: `.opencode/`, `.claude/`,
`.codex/`, and `.github/chatmodes/` are gitignored in this repo (verified in
`.gitignore`), and `.telos/references/unslop.md` is a derived in-repo copy
(see C-4a), not a pipeline source file.

## Test contracts

Serves: REQ-1, REQ-4, REQ-5, REQ-6

```text
1. init test (test/init.test.js):  temp-repo `telos init` ⇒
   .telos/references/unslop.md exists with the three steps, R-<n> IDs,
   scope guard, the Portuguese example set, and the five-surface coverage
   list (REQ-1, REQ-4, REQ-7).
2. render test (test/agents.test.js):  `telos init` renders all seven agents
   with the unslop instruction and required reference for all four harnesses
   (opencode, claude-code, copilot, codex) — every rendered file matches:
     /## Required references/ + /- \.telos\/references\/unslop\.md/
     /scan|scan the draft/ + /self-audit/            # three-step process
   per REQ-5/REQ-6 (shared test).
3. source grep (verification plan, REQ-6):  grep over agents/*.md finds
   unslop.md in all seven required-references blocks.
4. whole suite: `npm test` passes.
```
