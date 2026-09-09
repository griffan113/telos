---
id: 011
title: "011: Publish to npm + README"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["010: Dogfood the pipeline on this repo"]
---

# 011: Publish to npm + README

**What to build:** The framework ships: publish to npm so `npx telos init` works for anyone (the package name was verified unregistered at spec time — claim it early if a hold is wanted), plus a README telling the story: what Telos is, the `npx telos init` entry point, the harness matrix with the single-context note for Copilot/Codex, and the three tracker options. The TLC source material copied into this repo remains history, not shipped content.

**Blocked by:** 010: Dogfood the pipeline on this repo.

**Status:** ready-for-agent

- [ ] Package published; `npx telos init` works on a clean machine in an empty repo
- [ ] README covers the pipeline, the five phases and gates, the four harnesses, and the three trackers
- [ ] The four-harness render outputs are all produced by the published package
- [ ] TLC's copied root files are superseded and not shipped in the package
