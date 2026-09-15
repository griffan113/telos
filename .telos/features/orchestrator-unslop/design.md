---
phase: design
status: draft
depends_on: [spec, contracts]
---

# design.md — orchestrator-unslop

Docs-only feature: eight source files change (seven agents + one reference) plus
test assertions. Every seam it needs already exists in the live code; verified
at v0.0.3: `copyReferenceTree` copies the whole `references/` tree
(`src/scaffold.js:31-56`), `withRequiredReferences` injects the reference block
generically (`src/render.js:29-40`), `loadAgents()` reads every
`agents/*.md` (`src/agents.js:7-15`), and `update()` re-renders from
`telos.json.harnesses` (`src/update.js:62`). Zero `src/`/`adapters/` changes —
that boundary is pinned by C-2 and C-5 and design adds nothing to it.

## D-1 — `references/unslop.md`: shape, rule IDs, examples

Serves C-1, C-1a, C-1b, C-1c. Authored in the register of
`references/pipeline.md` / `references/diagnosis.md`: imperative,
discipline-first, English instruction text (patterns apply in any language).

**Section outline** (matches C-1's required sections, in order):

1. `# Telos Unslop Reference` — purpose: the default writing discipline of
   every Telos agent, applied to conversational replies to the user and to
   the prose of documentation surfaces (points at section 5's list).
2. `## Process` — the three steps verbatim from the source skill: scan the
   draft for the patterns below → rewrite, preserving meaning and intended
   tone → self-audit ("what makes this obviously AI-generated?") and fix what
   remains.
3. `## Patterns` — the catalogue with `R-<n>` rule IDs.
4. `## Language` — the applies-in-any-language statement + Portuguese
   example set.
5. `## Coverage` — the five documentation surfaces (REQ-7 list).
6. `## Scope guard` — the prose/technical boundary (C-5 text).

**Rule-ID scheme (C-1a):** the numbering is inherited verbatim from the source
skill (`cursor/plugins/pstack/skills/unslop/SKILL.md`, fetched live during
design). The source's own preamble states rule numbers are stable ids other
skills cite and removals leave gaps — this feature re-states that guarantee
and never renumbers. The source numbering already has gaps at 1, 2, 4, 6, 21;
the port preserves them.

**Catalogue decision: full port, not the contract's minimum.** C-1a pins a
minimum coverage list; design decides the catalogue carries **every** numbered
rule of the source, condensed to one line each:

| Rule | Category |
|---|---|
| R-3 | Superficial -ing phrases |
| R-5 | Vague attributions |
| R-7 | AI vocabulary (delve, crucial, landscape, tapestry, …) |
| R-8 | Fancy "is" (serves as, stands as, boasts) |
| R-9 | "Not just X, but Y" |
| R-10 | Rule of three |
| R-11 | Synonym cycling |
| R-12 | False ranges ("from X to Y") |
| R-13/R-14/R-15 | Em dash / colon / boldface overuse |
| R-16 | Inline-header lists (bold label + colon) |
| R-17 | Title-case headings |
| R-18 | Decorative emoji |
| R-19 | Curly quotes |
| R-20 | Chatbot phrases |
| R-22 | Sycophancy |
| R-23/R-24 | Filler and hedging |
| R-25 | Generic conclusions |
| R-26 | Abstract metaphor nouns (substrate, north star, flywheel, …) |
| R-27 | Say what it does, not how it feels |
| R-28 | Split dense sentences |
| R-29 | Active voice |
| R-30 | Cut adverbs / stronger verb |
| R-31 | Prefer the plain word |
| R-32 | Mannered prose (aphorisms, personified code) |
| R-33 | Over-compression (verbless fragments, symbol-speak) |

Reasoning: the contract's list is a minimum ("each entry has an R-<n> id"); a
partial port would invent a different gap pattern than the source's, breaking
the exact property (stable ids, inherited gaps) C-1a pins. The full port keeps
every `R-<n>` citable with its source meaning and satisfies the minimum as a
superset. The source's own one-line fixes are condensed, not dropped.

**Portuguese example set (C-1b)** — at least: filler "É importante notar
que…", "além disso"; sycophancy "Ótima pergunta! Você tem toda razão!";
chatbot "Espero que isso ajude!", "Ficarei à disposição"; false contrast
"não apenas X, mas sim Y"; inflated vocabulary "crucial" / "fundamental" /
"robusto" → plain substitutions; passive voice "o arquivo é processado pelo
carregador" → "o carregador processa o arquivo"; em dash overuse shown as a
Portuguese sentence rewritten with periods/commas.

## D-2 — The seven agent sources: one shared section shape

Serves C-3a, C-3b, REQ-6. Two mechanical edits per file, nothing else moves.

**Frontmatter (C-3a):** one added `- .telos/references/unslop.md` line under
`required-references`, formatted exactly like the existing entries (the
minimal list parser in `src/agents.js:17-35` requires `- ` lines). Pipeline
agents keep `pipeline.md` first; diagnosis keeps `diagnosis.md` first.

**Body section (C-3b):** heading decided as `## Unslop` — two words, greppable,
sits naturally next to the existing `## Language` markers. Placement: right
after the agent's language statement (the intro sentence in
specify/contracts/design/tasks/implement, the line 17-18 statement in
orchestrator, the `## Language` section in diagnosis). One shared paragraph
template, identical mechanics in all seven, then a per-agent surface list.
The template states: unslop is a default behavior — run the three-step
process (scan → rewrite → self-audit, per `.telos/references/unslop.md`) over
every conversational reply addressed to the user and over the prose of every
documentation surface listed below, under the scope guard (prose/technical
boundary, C-5), in the artifact language from `telos.json`.

Per-agent surface lists are **pinned already** by C-3b's block (derived from
the live agent sources at Contracts time) — design does not re-derive them;
tasks copy them verbatim into each section. The per-agent placements:

- `agents/orchestrator.md`: after the language statement (line ~18), before
  `## Routing`. Includes the diagnosis-relay carve-out (symptoms, hypothesis,
  planned fix quoted unchanged) from C-3b.
- `agents/specify.md`, `agents/contracts.md`, `agents/design.md`: after the
  intro language sentence, before `## Context reconstruction`.
- `agents/tasks.md`: same placement, before `## Context reconstruction`.
- `agents/implement.md`: after the language sentence (~line 44), before
  `## Gate`.
- `agents/diagnosis.md`: inside/after `## Language`, before `## Commit`.

Mechanics untouched everywhere (C-3's closing constraint): gate semantics,
10-line summaries, hard-stop wording, dispatch, tracker ops.

## D-3 — C-4a seam: how the in-repo copies land

**Decision: a manual copy executed by this feature's Implementation task, not
a mechanism change and not `telos init`.**

Reasoning, from live code:

- `telos init` is not an option here: `src/init.js:16-19` — when
  `.telos/telos.json` exists (it does in this repo), init reports state and
  modifies nothing. There is no init-repair path.
- Giving `update` reference-copying would touch `src/update.js` — prohibited
  by the spec's non-goal and C-2's constraint. It is also a larger decision
  (copy-vs-merge semantics for user-owned edits under `.telos/references/`)
  that this docs-only feature should not make.
- A one-line `cp` (or equal shell command) run after the references ship
  makes every rendered agent's required reference resolve at runtime in this
  repo. It is exactly the "bookkeeping decision" C-4a calls it.

**Copy scope: two files.** The shipped package tree already contains both
`pipeline.md` and `diagnosis.md` — `references/diagnosis.md` exists (shipped
in commit `b6a5fe6`, issue #11; it is the register model D-1 cites), so the
only reference this feature adds to the shipped tree is `unslop.md`. What is
stale is this repo's derived copy: `.telos/references/` was populated at this
repo's init (before `b6a5fe6` shipped the diagnosis reference, verified: the
directory holds only `pipeline.md`) and `update` never copies references
(C-4a), with no init-repair path. Restricting the step to `unslop.md` alone
would leave the diagnosis agent's existing required reference
(`.telos/references/diagnosis.md`, `agents/diagnosis.md:6`) unresolved at
runtime here. The step therefore syncs both, and is idempotent — a file
already present locally is just overwritten with its identical shipped copy:

```sh
cp references/unslop.md references/diagnosis.md .telos/references/
```

`unslop.md` is this feature's new reference; `diagnosis.md` is already
shipped and merely missing from the local derived copy. C-4a's rationale
("so every agent's required reference resolves at runtime in this repo")
covers both. The copies are derived files, not pipeline sources — C-5
already places in-repo `.telos/references/` copies outside the diff-surface
constraint, and the shipped source `references/diagnosis.md` is untouched
(it stays in C-5's "no changes" list).

Placement: as a verification step in the task that writes
`references/unslop.md` (the copy lands the moment the new reference exists;
the render step's grep-able proof then resolves for all seven agents).

## D-4 — Test decisions

Serves the Test contracts block. Extend `test/init.test.js` with the C-2
init assertion (temp-repo init → unslop copy exists, matches the three-step
/ `R-\d+` / PT-examples / coverage / scope-guard patterns). Extend
`test/agents.test.js`'s per-agent loop (`AGENT_NAMES`, all four harnesses) to
assert every rendered file carries the unslop required reference and the
three-step process wording (REQ-5/REQ-6 shared test). The source grep over
`agents/*.md` lives in the TASK.md verification plan, not the suite.

## Non-decisions and deferrals

- **No `src/`/`adapters/` changes** — pinned by C-2/C-5; the generic seams
  already do everything (verified live).
- **No `update` reference-copying** — deferred: it is a mechanism change with
  real semantics questions (user-owned files under `.telos/references/`) that
  belongs in its own feature if ever wanted.
- **No retroactive rewrites** of approved artifacts (spec non-goal); a
  cascade re-run re-exposes prose naturally.
- **No translation of agent instructions** — agent sources stay English per
  pipeline.md; only artifact prose and replies carry the artifact language.
- **No rule renumbering ever** — gaps (1, 2, 4, 6, 21 inherited; any future
  removal) stay gaps per C-1a.
- **`references/diagnosis.md` untouched** — the diagnosis reference already
  ships in the package tree (commit `b6a5fe6`, issue #11); only its stale
  in-repo copy lands, via the D-3 copy step.
