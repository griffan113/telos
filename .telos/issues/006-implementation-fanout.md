---
id: 006
title: "006: Implementation phase + parallel fan-out + close-on-verify"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["005: Design + Tasks phases + local tracker semantics"]
---

# 006: Implementation phase + parallel fan-out + close-on-verify

**What to build:** Execution. The orchestrator computes the ready set of tasks from the dependency graph and fans out parallel implementation subagents where the harness supports it (OpenCode/Claude Code dispatch true subagents; Copilot/Codex emulate dispatch by swapping loaded prompts in a single session). Each task is implemented and verified before being marked done; verification evidence lives with the task. On verification the corresponding tracker issue is closed, the STATE.md mirror updates, and when every task is done the orchestrator presents the feature's closing gate reviewing the completed task table.

**Blocked by:** 005: Design + Tasks phases + local tracker semantics.

**Status:** ready-for-agent

- [ ] The orchestrator computes the ready set from `depends_on` and dispatches independent tasks in parallel
- [ ] Per-task verification is enforced before a task is marked done
- [ ] Tracker issues close automatically on task verification
- [ ] Copilot/Codex run the same pipeline semantics via prompt-swap emulation
- [ ] The feature's closing gate presents the verified task table and requires explicit approval
