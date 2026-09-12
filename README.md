# Telos — coding with purpose

Telos is a harness-agnostic, orchestrator-driven, spec-driven framework for
building software with AI coding agents. One orchestrator agent drives every
feature through five phases — Specification → Contracts → Design → Tasks →
Implementation — pausing for your explicit approval at every phase transition.
Approved artifacts live as markdown your repo owns; edit one out-of-band and
the framework detects it and re-runs everything downstream, automatically.

Install it into any repo with one command:

```sh
npx use-telos init
```

## Quick start

1. Run `npx use-telos init` in your repo. The CLI scaffolds `.telos/`, asks which
   AI harness you use (or detects it), which issue tracker you want, and which
   language your artifacts should be written in.
2. Open your AI harness and say: **start telos**.
3. The orchestrator interviews you, writes PROJECT.md and ROADMAP.md, and
   gates them for your approval.
4. Describe a feature. It flows Specification → Contracts → Design → Tasks →
   Implementation, one approval gate at a time.
5. At Tasks approval, tasks sync into your tracker and independent tasks are
   implemented in parallel where your harness supports it, each verified
   before it is marked done.

## The five phases and their gates

Every phase is an agent that reads all context from disk and produces exactly
one artifact under `.telos/features/<feature>/`:

| Phase | Artifact | Produces |
|---|---|---|
| Specification | `spec.md` | Requirements with traceable `REQ-NN` IDs and acceptance criteria |
| Contracts | `contracts.md` | Machine-readable interfaces keyed to the requirement IDs |
| Design | `design.md` | Architecture decisions, depth sized to the feature's complexity |
| Tasks | `tasks.md` + `tasks/NN-slug/TASK.md` | A dependency graph of executable, verifiable tasks |
| Implementation | code + verification evidence | Tasks executed in dependency order, in parallel where possible |

Gates are explicit: you reply **approve** or **request changes** (with
feedback). A revision re-presents at the same gate; nothing advances
unapproved, and nothing is ever approved on your behalf.

Edit an approved artifact out of band and the next session detects the
content-hash mismatch, marks every downstream artifact stale, and re-runs
them through their gates in order — no manual re-invocation. If a re-plan
changes the task set, tracker issues are diffed truthfully: unchanged keep
their issues, new get issues, removed close with a superseded comment.

## Harnesses

Telos renders the same six agents into each harness's native format at init,
from one harness-neutral source:

| Harness | Where agents land | Notes |
|---|---|---|
| OpenCode | `.opencode/agent/` | Orchestrator runs in `all` mode, phases as subagents |
| Claude Code | `.claude/agents/` | Phases run as subagents |
| VS Code Copilot | `.github/chatmodes/` | Custom chat modes; single-context by design, not a bug |
| Codex | `.codex/skills/` | Native skills |

Copilot and Codex cannot spawn subagents. Telos emulates dispatch by loading
each phase's prompt by path in one session — pipeline semantics, gates, and
cascade behavior are file-based and therefore identical on every harness.
Multiple harnesses on one repo? Select more than one at init.

## Trackers

Pick your tracker at init (or let `init` detect it):

- **local** — zero config, works offline. The task files themselves are the
  tracker; there is exactly one source of truth per task.
- **github** — GitHub Issues via the `gh` CLI, one issue per task labelled
  `telos:<feature>`, blocking expressed via a `Blocked by:` body convention.
- **azure** — Azure DevOps Task work items via `az boards`, with native
  Predecessor/Successor dependency links.

The tracker is authoritative for task status in cloud modes; issues close the
moment a task's verification passes. Gate approvals stay local-only, always.

## Updating the framework

```sh
npx use-telos update
```

Re-renders generated agent files (they carry a generated marker) and applies
additive schema migrations with a printed changelog. Files you have
hand-modified are warned about and skipped, never overwritten. Your artifacts
under `.telos/` are never rewritten.

## Language

Init asks for the artifact language (free text, default English). It governs
the prose of all artifacts, tracker issue bodies, and agent replies — read at
runtime from `.telos/telos.json`, so changing it never requires re-rendering.

## What Telos does not do

No sprints, no story points, no codebase documentation — phase agents analyze
your actual code live and read your repo's own instruction files
(AGENTS.md/CLAUDE.md) for conventions. Telos maintains zero durable codebase
docs of its own.

## Releases

Versions are cut by [release-please](https://github.com/googleapis/release-please) from [Conventional Commits](https://www.conventionalcommits.org) — never bump `package.json` manually.

1. Open PRs with Conventional Commits titles (`feat:`, `fix:`, …); a CI check enforces the title, individual commits must follow the same convention (see AGENTS.md).
2. Merging a PR with a `fix:` (patch) or `feat:` (minor) commit into `main` makes release-please open a Release PR — `chore(main): release X.Y.Z` — that bumps `package.json` and updates `CHANGELOG.md`.
3. Merging that Release PR creates the `vX.Y.Z` Git tag, the GitHub Release with notes, and publishes `use-telos@X.Y.Z` to npm (requires the `NPM_TOKEN` secret).

Merges containing only `docs:`/`chore:`/`ci:` commits release nothing. `feat!:` or a `BREAKING CHANGE:` footer bumps major.

## License

MIT
