# Telos

Telos ("coding with purpose") is a harness-agnostic, orchestrator-driven,
spec-driven framework. One orchestrator routes work into two flows: the
feature pipeline (five gated phases) and the Diagnosis flow (bug fixing,
outside the pipeline).

## Language

### Pipeline

**Phase**:
A stage of the feature pipeline with its own agent and approval gate
(Specification, Contracts, Design, Tasks, Implementation).
_Avoid_: step (of the pipeline)

**Gate**:
An explicit user approval point; nothing advances unapproved. Phase gates are
conversational, never popups.
_Avoid_: checkpoint, sign-off

**Feature**:
A unit of work that flows through the five phases and lives under
`.telos/features/<slug>/`.
_Avoid_: ticket, story

### Diagnosis

**Diagnosis**:
The end-to-end process of reproducing, isolating, and fixing a reported bug
in one agent run, with a single gate before the fix is applied — deliberately
outside the feature pipeline.
_Avoid_: bug flow, debugging session, defect pipeline

**Bug**:
A report that the software is broken, throwing, failing, or slow; the input
to Diagnosis.
_Avoid_: defect, incident, issue

**Diagnosis agent**:
The agent that runs Diagnosis; dispatched by the orchestrator with only
`{bug, report}`, reconstructing everything else from disk.
_Avoid_: bug agent, fixer

**Diagnosis section**:
The table in `STATE.md` where open bugs live between sessions (bug slug,
symptom, status, confirmed hypothesis). The durable record of a fixed bug is
its commit/PR message, not this section.
_Avoid_: bug log, bug tracker

**Bug slug**:
A bug's identity: ASCII, lowercase, hyphenated, same derivation rule as a
feature slug, without `NN` numbering.
_Avoid_: BUG-NN, bug ID
