---
phase: specification
status: approved
approved_at: 2026-09-15T01:39:59Z
content_hash: 706c938f221eae5e6ae74ae4a64538b0
depends_on: []
---

# spec.md — orchestrator-unslop

Source: GitHub issue #2 (griffan113/telos) — "Orquestrador: aplicar a skill
unslop às respostas conversacionais (facilitador de comunicação)". Revised at
the Specification gate (user feedback, verbatim): "Percebi que o escopo tanto
da spec quanto dos contratos contemplam apenas o uso do unslop como um proxy
para a conversação humano-agente, mas eu gostaria que fosse um comportamento
padrão do agente, seja para documentações ou a própria conversação, vamos
aplicar essas mudanças tanto na spec quanto nos contratos."

## Goal

The framework's agents currently write with an "AI accent": inflated phrasing,
generic vocabulary, excessive hedging, and chatbot catchphrases — in their
conversational replies to the user (gates, phase summaries, state reports,
proposals) and in the documentation they author and maintain (artifact prose,
task ledgers, tracker issue bodies, reference and instruction docs). The user
wants unslop to be a **default behavior of every Telos agent**, not an
orchestrator-only nicety: every reply the user reads and every piece of
documentation an agent writes should pass through the **unslop** discipline
(scan → rewrite → self-audit) so the framework reads like a competent human
colleague wrote it — direct, natural, in the configured artifact language —
not like generated text.

## Scope

- A new shipped reference file, `references/unslop.md`, distilled from the
  unslop skill (source: cursor/plugins `pstack/skills/unslop/SKILL.md`) into
  the same register as `pipeline.md` and `diagnosis.md`, copied into every
  initialized repo by the existing init reference-copy mechanism.
- **All seven agent sources** — `agents/orchestrator.md`,
  `agents/specify.md`, `agents/contracts.md`, `agents/design.md`,
  `agents/tasks.md`, `agents/implement.md`, `agents/diagnosis.md` — gain
  `.telos/references/unslop.md` in their `required-references` and a section
  instructing unslop as default behavior for their conversational replies and
  the documentation prose they author (coverage list in REQ-7).
- Coverage: the prose of everything Telos agents write — orchestrator-to-user
  conversation, phase-agent conversation, and the documentation surfaces
  defined in REQ-7 — with the prose/technical boundary of REQ-3.

## Non-goals

- No changes to gate mechanics, dispatch contract, staleness/cascade logic,
  tracker ops, or the five-phase pipeline itself.
- No code changes in `src/` or `adapters/`: the renderer already reads
  `required-references` generically and `copyReferences` copies the whole
  references tree, so seven agent edits plus one reference file need zero
  logic changes.
- No retroactive rewriting of already-approved artifacts in existing repos:
  unslop applies going forward, to prose written or revised from this feature
  on; a cascade re-run naturally re-exposes an artifact's prose to it.
- No unslop of technical content (see REQ-3's boundary) and no changes to
  pipeline mechanics that constrain what agents may say (summary limits,
  hard-stop messages, gate semantics).

## Requirements

### REQ-1 — Ship the unslop reference

A file `references/unslop.md` exists at the package root and is copied to
`.telos/references/unslop.md` by `telos init` (the existing
`copyReferences` mechanism handles this with no code change). Its content is
distilled from the unslop skill and must carry:

- The three-step process: (1) scan the draft for known AI-writing patterns;
  (2) rewrite, preserving meaning and intended tone; (3) self-audit — "what
  makes this obviously AI-generated?" — and fix what remains.
- The pattern catalogue with **stable rule IDs** (the source skill's rule
  numbering is load-bearing and other docs may cite it; removed rules leave
  numbering gaps): AI vocabulary, "not just X but Y", rule-of-three, synonym
  cycling, em dash / colon / boldface overuse, inline-header lists, title-case
  headings, decorative emoji, curly quotes, chatbot phrases, sycophancy,
  filler and hedging, generic conclusions, abstract metaphor nouns, mannered
  prose, over-compression, and the "say what it does, not how it feels" and
  plain-word/active-voice disciplines.
- The scope guard, stating the prose/technical boundary of REQ-3: unslop
  edits the **prose** of what agents write — conversation and documentation —
  and never rewrites technical content: code, commands, file paths,
  requirement and rule IDs, quoted text, or the mechanical conventions
  listed in REQ-3.

**Amended 2026-09-14 (revision feedback):** the scope guard was widened from
"conversational prose only — never artifact content" to the prose/technical
boundary above, because unslop now covers documentation too.

**Acceptance criteria (observable):**

- After running `telos init` in a temp repo, `.telos/references/unslop.md`
  exists and contains the three-step process, the stable rule IDs, and the
  scope guard stating the REQ-3 boundary.
- `npm test` passes (the existing test suite covers init copies; a test
  asserting the unslop copy lands is part of this requirement).

### REQ-2 — Orchestrator applies unslop to every conversational reply

`agents/orchestrator.md` instructs the orchestrator to run the unslop process
(scan → rewrite → self-audit) over every reply it addresses to the user,
before sending it. Coverage includes: approval-gate presentations, relays of
phase-agent summaries (≤10 lines, technical content intact), "start telos"
initialization and state reports, resume/STATE.md reports, next-step
proposals, and routing/clarifying questions. It also covers the relays of
Diagnosis gate summaries: the framing may be unslopped, but the confirmed
symptoms, winning hypothesis, and planned fix are quoted unchanged.

**Amended 2026-09-14 (revision feedback):** unchanged in substance; the
boundary it operates under is now the amended REQ-3 (prose/technical), not
the old artifact/carve-out wording, and unslop is framed as the framework's
default agent behavior rather than an orchestrator-specific rule.

**Acceptance criteria (observable):**

- The rendered `.opencode/agent/telos-orchestrator.md` (and every other
  harness render) contains the "Required references" block listing
  `.telos/references/unslop.md` and a conversational-prose instruction
  naming the three-step process and the covered reply types.
- A reader of the rendered orchestrator prompt can tell, without reading
  other files, that gates, summaries, state reports, and proposals all pass
  through unslop before reaching the user.

### REQ-3 — Prose only; nothing technical changes

**Amended 2026-09-14 (revision feedback):** the old carve-out ("unslop must
not be applied to artifact bodies, TASK.md bodies, tracker issue bodies") is
replaced by the prose/technical boundary below, which reconciles
documentation coverage with technical fidelity.

Unslop is a rewrite of style, never of content. It applies to the **prose**
of what agents write — the sentences and paragraphs of conversation and
documentation — and never to **technical content**, which stays exactly as
the mechanics require:

- Code and code blocks, commands, file paths, and directory names.
- Requirement IDs (`REQ-NN`), unslop rule IDs, tracker issue numbers, task
  NNs, and the fixed-ASCII `telos:` tracker title convention.
- Artifact frontmatter and the structural/mechanical cells of tables
  (statuses, dependency lists, hash columns).
- Quoted verbatim text: the user's own feedback, confirmed symptoms, quoted
  artifact passages, hard-stop messages (fixed strings).
- The mechanical parts of commit messages: Conventional Commits type/scope,
  `fix:`/`superseded:` prefixes, and issue references (their prose bodies may
  be unslopped).

What unslop must preserve: meaning, tone, and every mechanical obligation —
gate semantics ("approve advances / request changes loops"), the
at-most-10-line summary limit, hard-stop message wording, and the exact
technical strings above.

**Acceptance criteria (observable):**

- The unslop reference and every agent instruction section state the guard
  explicitly: prose style changes; meaning, tone, technical content, and
  mechanical obligations are preserved; the technical-content list above is
  named.
- Only `agents/*.md` (seven files) and `references/unslop.md` change in this
  feature's diff — no `src/` or `adapters/` changes (verify with
  `git diff --stat` against the base).

### REQ-4 — Language-aware: the patterns apply in the configured language, not just English

The agents write conversational replies **and** documentation prose in the
artifact language from `telos.json` (agent instructions stay in English). The
unslop reference must state that the patterns are detected in whatever
language the text is written in, not only in English, and give concrete
non-English examples — Portuguese at minimum (the user's language in issue
#2: "É importante notar que…", "além disso", "não apenas X, mas Y", passive
voice, "Espero que isso ajude!", sycophantic openers, em dash overuse,
inflated vocabulary like "crucial"/"fundamental"/"robusto") — so an agent
working in Portuguese (or any language) can apply the same scan, rewrite, and
self-audit steps to a reply or a document without translating first.

**Amended 2026-09-14 (revision feedback):** wording widened from
conversational replies to replies and documentation prose, since both now
consume the reference in the artifact language.

**Acceptance criteria (observable):**

- `.telos/references/unslop.md` contains, besides the English patterns, an
  explicit "applies in any language" statement and a Portuguese example set
  covering at least: filler/hedging ("é importante notar que"), sycophancy,
  chatbot phrases ("espero que isso ajude", "ficarei à disposição"), the
  "não apenas… mas sim…" construction, and inflated-vocabulary substitutions.
- A test (or grep assertion in the verification plan) confirms the Portuguese
  examples exist in the shipped reference copy.

### REQ-5 — Re-render and verify across harnesses

**Amended 2026-09-14 (revision feedback):** coverage widened from the
orchestrator to all seven agent sources, which all gain the required
reference.

After the seven `agents/*.md` files and `references/unslop.md` change, run
`node bin/telos.js update` (or `npm run telos -- update`) in this repo to
re-render every agent for the configured harnesses (opencode), and rely on
the test suite to verify that init copies the new reference and renders all
seven agents with the unslop instruction and required reference for all four
harnesses.

**Acceptance criteria (observable):**

- In this repo, `.opencode/agent/telos-orchestrator.md` and the other
  rendered agent files are regenerated with the current `telos:generated`
  marker and each carries the unslop required reference (the phase agents
  also their new instruction section).
- `npm test` passes, including a test that `telos init` renders every agent
  with the unslop instruction and required reference for all four harnesses
  (opencode, claude-code, copilot, codex).

### REQ-6 — Unslop is default behavior for every Telos agent

**Added 2026-09-14 (revision feedback):** unslop as default agent behavior,
not an orchestrator-only rule.

Each of the seven agent sources (`agents/orchestrator.md`,
`agents/specify.md`, `agents/contracts.md`, `agents/design.md`,
`agents/tasks.md`, `agents/implement.md`, `agents/diagnosis.md`) gains:

- `.telos/references/unslop.md` in its `required-references` (alongside the
  existing `pipeline.md` entry, or `diagnosis.md` entry where present).
- A short instruction section: unslop is a default behavior — apply the
  three-step process to every conversational reply addressed to the user and
  to the prose of every documentation surface from REQ-7 that the agent
  authors or edits, under the REQ-3 boundary. The section names the agent's
  own covered surfaces (e.g. for the Implementation agent: its return
  summary, TASK.md body notes, tracker comments, commit message prose).

**Acceptance criteria (observable):**

- Every one of the seven agent source files lists the unslop reference in
  `required-references` and contains an unslop section naming the three-step
  process, its conversational surfaces, and its documentation surfaces.
- A grep over `agents/*.md` finds `unslop.md` in all seven
  `required-references` blocks; the test suite asserts the rendered agent
  files carry it for all four harnesses (shared with REQ-5's test).

### REQ-7 — Documentation coverage list: which surfaces unslop applies to

**Added 2026-09-14 (revision feedback):** defines "documentações" explicitly
and observably, so acceptance is testable.

Unslop applies to the prose of the following surfaces that Telos agents
write, author, or edit:

1. **Orchestrator-authored project files** — the prose of
   `.telos/project/PROJECT.md`, `ROADMAP.md`, and the decisions & blockers
   prose in `STATE.md` (tables stay structural).
2. **Phase artifact prose** — the prose of `spec.md`, `contracts.md`
   (prose parts; interface definitions stay in code syntax per pipeline.md),
   `design.md`, and `tasks.md`.
3. **TASK.md bodies** — implementation notes, verification-plan prose, and
   recorded evidence narration (commands and their literal output stay
   verbatim).
4. **Tracker issue bodies** in cloud modes (github/azure) — body prose and
   comments, excluding the fixed `telos:` title convention and the
   `Blocked by:` line format.
5. **Reference and doc files agents ship or edit as feature work** — prose
   in `.telos/references/*` files an agent authors or revises, guidance
   sections in the consumer repo's `AGENTS.md` / `CLAUDE.md`, and any
   README/docs files the tasks touch — in whatever language the file is
   maintained in.

**Acceptance criteria (observable):**

- The unslop reference contains this coverage list (the five numbered
  surfaces) so every agent consuming the reference resolves the same set.
- Each agent instruction section from REQ-6 names which of the five surfaces
  that agent touches (observable by reading the agent source alone).
- A reader can decide for any text a Telos agent writes whether it is in
  scope, using only REQ-3's technical-content exclusion and this list.

## Traceability

- REQ-1, REQ-4 → the shipped reference (`references/unslop.md` →
  `.telos/references/unslop.md`).
- REQ-2, REQ-5, REQ-6 → the seven agent sources and their harness renders.
- REQ-3, REQ-7 → the boundary and coverage stated in the reference and in
  every agent section.
- Contracts for this feature will be re-run at the Contracts gate with this
  revision feedback; the expanded agent coverage (REQ-6) and coverage list
  (REQ-7) are the deltas it must pin.
