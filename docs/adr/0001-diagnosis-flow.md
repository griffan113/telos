---
status: accepted
---

# 0001: Diagnosis flow lives outside the feature pipeline, artifact-free, single-gate

Telos's feature pipeline is artifact-heavy and gate-heavy (five phases, five
gates, tracker sync), which is the right shape for feature work but wrong for
bug fixing: diagnosis is a single-agent discipline whose value is a tight
feedback loop, not durable artifacts. We decided that bug reports route to a
separate **Diagnosis agent** (the 7th agent), dispatched by the same
orchestrator with only `{bug, report}`, that reproduces, isolates, and fixes
the bug end-to-end in one run. It produces **no artifacts** — the durable
record of a fixed bug is its commit/PR message (Conventional Commits `fix:`
carrying the confirmed hypothesis) plus the Diagnosis section in `STATE.md`
while the bug is open; `fixed` rows are removed because `STATE.md` is live
state, not history. It has a **single conversational gate before the fix is
applied** (symptoms confirmed + winning hypothesis + planned fix; request
changes loops at the same gate) and no closing gate — the Phase-6 cleanup
checklist is the internal done criteria. It runs **before "start telos" init
exists** (language from `telos.json`, fallback English) and does **not** touch
the tracker: a bug is typically one fix, and issue-graph machinery there is
token cost without return.

The discipline itself (feedback loop → repro + minimisation → ranked
falsifiable hypotheses → instrument one variable at a time → fix + regression
test → cleanup) lives in a rendered reference file,
`.telos/references/diagnosis.md`, listed in the agent's `required-references`
— the same pattern as `pipeline.md` — because target repos on other harnesses
have no skills mechanism.

The only bridge between the flows is intentional: if Diagnosis reveals an
approved upstream artifact (spec/design) was wrong, the agent reports it in
its ≤10-line summary and the orchestrator treats it as a discovery report —
marks the artifact and its downstream chain stale and re-runs them through
their gates. If no correct seam exists for the regression test, that finding
is recorded in `STATE.md`'s decisions & blockers instead of being lost.

## Considered options

- **Route bugs through the feature pipeline** (spec → contracts → … → fix):
  rejected — five gates and a dependency graph for a one-fix unit of work is
  the exact token cost Telos is built to avoid, and the phases have no
  semantics for "hypothesis failed, go back to instrumentation".
- **Zero gates (run unattended to the fix)**: rejected — an agent editing
  production code without approval breaks Telos's core premise that nothing
  advances unapproved; one gate at the highest-leverage point preserves the
  philosophy at one round-trip.
- **Durable `diagnosis.md` artifact per bug**: rejected — the hypothesis and
  evidence are captured by the commit and the regression test; a per-bug
  artifact duplicates them and grows `.telos/` forever.

## Consequences

- `STATE.md` grows a Diagnosis section; the orchestrator's resume flow reads
  open bugs alongside feature state.
- The orchestrator's routing rule (semantic trigger + explicit "diagnose"
  shortcut, one clarifying question when ambiguous) is part of its contract.
- Regression tests from Diagnosis land at the correct seam or the absence of
  a seam becomes an architectural finding, not a skipped step.
