---
feature: orchestrator-unslop
task: 1
title: Author references/unslop.md and land the in-repo copies
status: pending
issue: 23
depends_on: []
requirements: [REQ-1, REQ-3, REQ-4, REQ-7]
---

## Implementation notes

Create `references/unslop.md` at the package root (sibling of
`references/pipeline.md` and `references/diagnosis.md`), in their register:
imperative, discipline-first, English instruction text. Sections, in order
(C-1):

1. Purpose — unslop is the default writing discipline of every Telos agent,
   applied to conversational replies to the user and to the prose of the
   documentation surfaces (point at section 5).
2. Three-step process, verbatim mechanics: scan the draft for the patterns
   below → rewrite, preserving meaning and intended tone → self-audit
   ("what makes this obviously AI-generated?") and fix what remains.
3. Pattern catalogue with `R-<n>` rule IDs — the **full port** from the
   source skill (`cursor/plugins pstack/skills/unslop/SKILL.md`), one line
   per rule, IDs inherited verbatim including the gaps at 1, 2, 4, 6, 21.
   Never renumber (C-1a). The catalogue's one-line fixes are condensed, not
   dropped.
4. Language statement: the patterns are detected in whatever language the
   text is written in, not only in English; scan/rewrite/self-audit run
   without translating first. Plus the Portuguese example set (C-1b):
   "É importante notar que…", "além disso"; a sycophantic opener;
   "Espero que isso ajude!", "Ficarei à disposição"; "não apenas X, mas sim
   Y"; inflated vocabulary "crucial"/"fundamental"/"robusto" with plain
   substitutions; passive voice and em-dash overuse shown rewritten.
5. Documentation coverage list — the five numbered surfaces of C-1c
   (project files, phase artifact prose, TASK.md bodies, tracker issue
   bodies/comments, reference and doc files agents ship or edit), carried
   in substance so agents resolve the set without reading the spec.
6. Scope guard — the prose/technical boundary of C-5, stated explicitly:
   unslop edits prose only; technical content (code, commands, paths,
   REQ-NN / R-<n> / issue numbers / task NNs, the fixed-ASCII `telos:`
   title convention, frontmatter and mechanical table cells, quoted
   verbatim text, Conventional Commits type/scope and `fix:`/`superseded:`
   prefixes and issue references) stays exactly as the mechanics require;
   meaning, tone, and mechanical obligations (gate semantics, ≤10-line
   summaries, hard-stop wording) preserved.

Then land the in-repo copies per design D-3 (idempotent manual step, no
`src/` change):

```sh
cp references/unslop.md references/diagnosis.md .telos/references/
```

`unslop.md` is this feature's new reference; `diagnosis.md` is already
shipped (commit `b6a5fe6`, issue #11) and merely missing from this repo's
derived `.telos/references/` copy — the copy repairs it so the diagnosis
agent's required reference resolves at runtime here.

Constraint: `src/*`, `adapters/*`, `references/pipeline.md`, and
`references/diagnosis.md` (the shipped source) are untouched (C-5 diff
surface).

## Verification plan

1. `grep -c 'R-[0-9]' references/unslop.md` — the catalogue carries the
   source's rule IDs, with gaps at 1, 2, 4, 6, 21 (absent by design).
2. `grep -E 'scan|rewrite|self-audit' references/unslop.md` — all three
   steps present.
3. `grep -E 'Espero que isso ajude|É importante notar que|não apenas'`
   references/unslop.md — Portuguese example set present.
4. Coverage list present: grep for PROJECT.md, TASK.md, tracker, AGENTS.md
   mentions in the file.
5. Scope guard present: the prose/technical boundary is stated in the file.
6. `.telos/references/unslop.md` and `.telos/references/diagnosis.md` both
   exist and the latter matches its shipped source.
7. `git diff --stat` shows only `references/unslop.md` (new) plus the
   derived copies outside the diff surface — no `src/` or `adapters/`
   changes.
