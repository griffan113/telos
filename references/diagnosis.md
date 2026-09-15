# Telos Diagnosis Reference

This is the discipline for diagnosing bugs, performance regressions, and
flaky behavior. Its value is a tight feedback loop, not durable artifacts: a
diagnosis produces zero artifacts under `.telos/` — the durable record of a
fixed bug is its commit message plus the regression test. Skip steps only
when explicitly justified. Ground yourself in the live code, and read the
repo's `CONTEXT.md` (if present) and ADRs around the area you are touching.

## Redact

You will show commands, outputs, and captured artifacts. **Redact every
secret first**: write `<REDACTED>` in its place, and build loops against env
vars — the credential stays in the environment, not in what you show.
Captured artifacts (HAR files, headers, dumps) carry auth material: quote
only the lines that carry the signal. If redacted output is not enough to
diagnose, say so and ask the user for more.

## Step 1: Build a feedback loop

**This is the discipline.** Everything else is mechanical. With a tight
pass/fail signal for the bug (one that goes red on _this_ bug), you will find
the cause; hypothesis-testing, instrumentation, and bisection all just
consume it. Spend disproportionate effort here. Be aggressive, be creative,
refuse to give up.

Ways to construct a loop, in roughly this order:

1. **Failing test** at whatever seam reaches the bug: unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a
   known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) driving the UI,
   asserting on DOM/console/network.
5. **Replay a captured trace**: save a real payload / request / event log to
   disk and replay it through the code path in isolation.
6. **Throwaway harness**: a minimal subset of the system (one service, mocked
   deps) exercising the bug code path with a single call.
7. **Property / fuzz loop**: for "sometimes wrong output", run many random
   inputs and look for the failure mode.
8. **Bisection harness** for regressions between two known states: automate
   "boot at state X, check, repeat" so `git bisect run` can drive it.
9. **Differential loop**: run the same input through two versions or two
   configs and diff the outputs.
10. **Human-in-the-loop bash script**, last resort: what cannot be automated
    end-to-end is driven by a small loop script with captured output that
    feeds back to you.

### Tighten it

Treat the loop as a product. Once you have _a_ loop, tighten it:

- **Faster** — cache setup, skip unrelated init, narrow the test scope.
- **Sharper signal** — assert on the specific symptom, not "didn't crash".
- **Deterministic** — pin time, seed RNG, isolate filesystem, freeze network.

A 30-second flaky loop is barely a loop; a 2-second deterministic one is a
debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**: loop the
trigger many times, parallelise, add stress, narrow timing windows, inject
sleeps. A bug that flakes 50% is debuggable; 1% is not.

### If you truly cannot build a loop

Stop and say so. List what you tried. Ask the user for: (a) access to the
reproducing environment, (b) a redacted captured artifact, or (c) permission
for temporary instrumentation. **Never theorize without a loop.**

### Completion criterion

Phase 1 is done when you can name **one command** (script path, test
invocation, curl) that you have **already run at least once** (show the
invocation and redacted output) and that is:

- [ ] **Red-capable** — drives the actual bug code path and asserts the
      user's exact symptom, so it flips green once fixed.
- [ ] **Deterministic** — same verdict every run (non-deterministic bugs: a
      pinned, high reproduction rate).
- [ ] **Fast** — seconds, not minutes.
- [ ] **Agent-runnable** — you can run it unattended.

If you catch yourself reading code to build a theory before this command
exists, **stop: jumping to a hypothesis is the exact failure this discipline
prevents. No red-capable command, no Step 2.**

## Step 2: Reproduce + minimise

Run the loop; watch it go red. Confirm:

- [ ] The failure is the **user's** symptom, not a nearby different failure
      (wrong bug = wrong fix).
- [ ] It reproduces across multiple runs (non-deterministic: at the pinned
      rate).
- [ ] You captured the exact symptom (message, output, slow timing) for
      later verification.

Then **minimise**: shrink the repro to the smallest scenario that still goes
red — cut inputs, callers, config, data, steps **one at a time**, re-running
the loop after each cut. Done when every remaining element is load-bearing
(removing any one of them turns the loop green). A minimal repro shrinks the
hypothesis space and becomes the regression test at Step 5.

Do not proceed until you have reproduced **and** minimised.

## Step 3: Hypothesise

Generate **3–5 ranked hypotheses** before testing any. Single-hypothesis
generation anchors on the first plausible idea. Each must be **falsifiable**
— state the prediction: "If ⟨X⟩ is the cause, then ⟨changing Y⟩ makes the bug
disappear / ⟨changing Z⟩ makes it worse." No prediction = vibe: discard or
sharpen.

Show the ranked list to the user before testing (plain message, no blocking
prompt): domain knowledge re-ranks it cheaply, and known-ruled-out hypotheses
save hours. Do not block on the reply — proceed with your own ranking.

## Step 4: Instrument

Each probe maps to one prediction from Step 3. **Change one variable at a
time.** Preference order:

1. **Debugger / REPL inspection** — one breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

Tag every debug log with a unique prefix, e.g. `[DEBUG-a4f2]`: cleanup
becomes a single grep, untagged logs survive, tagged logs die.

**Performance branch**: for slow regressions, logs are usually wrong.
Establish a baseline measurement first (timing harness, profiler, query
plan, `git bisect` on load time), then bisect. Measure first, fix second.

## Step 5: Fix + regression test

Write the regression test **before the fix**, but only if a **correct seam**
exists: one where the test exercises the real bug pattern as it occurs at
the call site. If the only seam is too shallow (cannot replicate the chain
that triggered the bug), a test there gives false confidence — and **no
correct seam is itself a finding**: the architecture is preventing the bug
from being locked down. Record the finding for the orchestrator's decisions
& blockers.

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Step 1 loop against the original (un-minimised) scenario.

## Step 6: Cleanup

Required before declaring done — this checklist is the done criteria:

- [ ] The original repro no longer reproduces (re-run the Step 1 loop).
- [ ] The regression test passes (or the seam-absence finding is recorded).
- [ ] All `[DEBUG-…]` instrumentation removed (grep the tag).
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug
      location).
- [ ] The confirmed hypothesis stated in the commit / PR message, so the
      next debugger learns from it — the durable record of the fix.
