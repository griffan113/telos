# Specify: Discuss Gray Areas (Hybrid Grilling Mode)

**Goal:** Resolve ambiguity in the spec by interrogating every branch of the design tree, one question at a time, challenging against domain docs, and crystallizing decisions into `context.md` — with CONTEXT.md/ADR updates inline when terminology or architectural decisions shift.

**Trigger:** Automatically when gray areas are detected during spec creation, or explicitly via "discuss feature", "how should this work?", "capture context"

**When to trigger (auto-detect):** The spec contains user-facing behavior that could go multiple ways AND the user hasn't expressed a preference. If the spec is clear and unambiguous, skip this entirely.

**When NOT to trigger:** Infrastructure work, CRUD operations, well-defined API contracts, anything where the "how" is obvious from the "what".

## Why This Phase Exists (Now With Grilling)

Specifications capture WHAT to build. Design captures the architecture. But neither captures the user's vision for ambiguous areas — layout preferences, interaction patterns, error handling style, content tone. Without this, the agent guesses. With this, the agent builds what the user actually imagined.

**The grilling upgrade:** Instead of presenting gray areas in batches and asking surface-level questions, this phase now uses **relentless one-question-at-a-time interrogation**. Each question walks down one branch of the design tree, resolving dependencies between decisions one-by-one. The agent provides a **recommended answer** for every question. Beyond user-facing ambiguity, the grilling also **challenges the plan against the domain model** — sharpening terminology (against `docs/CONTEXT.md`), surfacing conflicts with existing ADRs, and updating documentation inline as decisions crystallize.

The output — `context.md` — feeds directly into Design and Tasks:

- **Design reads it** to know what decisions are locked vs. flexible
- **Tasks reads it** to include specific behaviors in task definitions

## Process (Hybrid Grilling)

### Phase A — Load Domain Arsenal

Before presenting any questions, load and internalize:

1. `docs/CONTEXT.md` — canonical glossary (terminology rules, _Avoid_ lists)
2. `docs/adr/` — all existing ADRs (scan for conflicts with the spec's decisions)
3. The feature's `spec.md` — the scope boundary being grilled

**Check for pre-existing conflicts:** Does the spec use a term that CONTEXT.md bans? Does it contradict an ADR? Flag these immediately — they are the first items to grill.

### Phase B — Identify Gray Areas (Internal)

Read the spec and identify the domain. Map every branch of the design tree where the spec is silent, ambiguous, or has multiple valid approaches. Organize as a **dependency tree** — which decisions depend on which.

Domains and their typical gray areas:

| Domain                         | Gray areas to explore                                         |
| ------------------------------ | ------------------------------------------------------------- |
| Something users **SEE**        | Layout, density, interactions, empty states, visual hierarchy |
| Something users **CALL** (API) | Response format, errors, auth, versioning, rate limiting      |
| Something users **RUN** (CLI)  | Output format, flags, modes, error handling, verbosity        |
| Something users **READ**       | Structure, tone, depth, flow, navigation                      |
| Something being **ORGANIZED**  | Grouping criteria, naming, duplicates, exceptions             |
| Domain terminology conflicts   | Mismatches between spec language and CONTEXT.md _Avoid_ lists |

### Phase C — Grill One Question at a Time

**Cardinal rule: ONE question per turn. Wait for user answer before next question.**

For each question:

1. **State the branch** — which part of the design tree we're on and why it matters
2. **Present the question** — concrete, with specific options when applicable (not vague categories)
3. **Provide your recommended answer** — with reasoning grounded in the domain docs (cite ADRs, CONTEXT.md entries)
4. **After user answers** — if the answer opens a sub-branch, follow it immediately (next question drills deeper on the same area). If the answer closes the branch, flag it as resolved and move to the next dependency in the tree. If the answer modifies domain terminology or an architectural decision, **update CONTEXT.md or create/promote an ADR inline** before moving on.
5. **Check:** "Mais sobre [área atual], ou seguimos para [próxima dependência]?"

**Question design rules:**

- Options must be concrete ("Tabela com colunas: campo, status, evidência, ação" not "Opção A")
- Each answer should inform the next question (walk the dependency tree)
- Include "Você decide" as an option when reasonable — captures agent discretion
- For domain terminology questions: "O spec usa o termo X. O CONTEXT.md recomenda Y como _Avoid_. Manter X, adotar Y, ou cunhar termo novo?"

**Dependency tree traversal:**

- Start at the root of the most impactful gray area
- For each branch, drill until you hit a leaf (no more sub-decisions)
- Then backtrack to the nearest unresolved sibling branch
- Skip branches already resolved by the spec or by an ADR — don't re-litigate settled decisions

### Phase D — Challenge Against Domain Docs (Integrated)

This is NOT a separate step — it's woven into every question. Before asking each question, ask yourself:

1. Does this decision touch a term defined in CONTEXT.md? If yes, does it use the canonical term or an _Avoid_ synonym?
2. Does this decision conflict with an existing ADR? If yes, flag it in the question — "ADR-0001 diz X, mas o spec parece implicar Y. Qual prevalece?"
3. Does this decision SHIFT terminology or an architectural contract? If yes, after the user answers, propose the CONTEXT.md edit or ADR creation inline.

**When to update CONTEXT.md:** A term is introduced, redefined, or its _Avoid_ list changes.

**When to create/promote an ADR:** The decision touches architectural patterns, contracts between systems, service topology, database, messaging, observability, or security — AND it's hard to reverse, surprising without context, and the result of a real trade-off.

### Phase E — Scope Guardrail (CRITICAL)

The feature boundary from `spec.md` is **fixed**. Discussion clarifies HOW to implement, never WHETHER to add new capabilities.

**Allowed:** "Como deve ser exibido o veredito?" (clarifying ambiguity)
**Not allowed:** "Devemos também adicionar comentários no relatório?" (new capability)

When user suggests scope creep: "Isso parece uma feature separada. Vou anotar em Deferred Ideas. Voltando para [área atual]."

### Phase F — Write context.md

After all branches are resolved:

```markdown
# [Feature] Context

**Gathered:** [date]
**Spec:** `.specs/features/[feature]/spec.md`
**Status:** Ready for design

---

## Feature Boundary

[Clear statement of what this feature delivers — the scope anchor from spec.md]

---

## Implementation Decisions

### [Area 1 that was discussed]

- [Specific decision made]
- [Another decision if applicable]

### [Area 2 that was discussed]

- [Specific decision made]

### [Area 3 that was discussed]

- [Specific decision made]

### Agent's Discretion

[Areas where user explicitly said "you decide" — agent has flexibility here during design/implementation]

---

## Domain Model Updates

[CONTEXT.md edits made during grilling — term additions, redefinitions, _Avoid_ list changes]

[ADR promotions — decisions flagged for ADR creation in Design phase]

[If none: "No domain model changes needed"]

---

## Specific References

[Any "I want it like X" moments, product references, specific behaviors, interaction patterns mentioned during discussion]

[If none: "No specific requirements — open to standard approaches"]

---

## Deferred Ideas

[Ideas that came up during discussion but belong in other features/phases. Captured here so they're not lost, but explicitly out of scope]

[If none: "None — discussion stayed within feature scope"]
```

---

## Tips

- **Decisions, not vision** — "Tabela com colunas: campo, status, evidência, ação" is a decision. "Deve parecer moderno" is not.
- **Scope is sacred** — Deferred Ideas captures scope creep without losing ideas
- **User = visionary, Agent = builder** — Ask about how they imagine it, not about technical implementation
- **Don't ask about:** Technical architecture, performance, implementation details — that's Design's job
- **Confirm before Design** — User approves context.md before moving to design phase
- **One question at a time** — Batch questions bewilders. Walk the tree.
- **Recommend, don't just ask** — Every question comes with your recommended answer, grounded in domain docs
- **Update docs inline** — If a decision shifts terminology or architecture, update CONTEXT.md or flag for ADR immediately
- **Respect settled decisions** — ADRs and spec sections marked "Decisão já alinhada" are not gray areas. Skip them.
