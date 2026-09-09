# Greenfield Bootstrap

**Trigger:** "Bootstrap greenfield docs", "Document architecture decisions", "Seed codebase docs", "Set up architecture documentation" — for a **new project that has no existing code to analyze**.

**Purpose:** Seed the `.specs/codebase/` docs for a greenfield project so that architectural decisions have a living home from day one — instead of only being reconstructed later via [brownfield-mapping.md](brownfield-mapping.md).

## Brownfield vs. Greenfield: The Core Difference

Brownfield mapping is **descriptive** — it documents what the code *already does* by sampling existing files. Greenfield bootstrap is **prescriptive** — it documents what the project has *decided to do* before (or as) the code is written.

| Dimension       | Brownfield mapping                | Greenfield bootstrap                                 |
| --------------- | --------------------------------- | ---------------------------------------------------- |
| Evidence source | Existing code, dependency manifests | PROJECT.md, ROADMAP.md, ADRs, design docs, decisions |
| Framing         | "This is how it works"            | "This is how it will work / is intended to work"     |
| Trigger         | Once, before adding features      | After project-init, then **updated as decisions land** |
| Risk            | Misreading existing patterns      | Fabricating decisions that were never made           |

**The cardinal rule: never fabricate.** Document only decisions that have actually been made (found in PROJECT.md, ROADMAP.md, `docs/adr/`, or explicitly stated by the user). For anything undecided, write `TBD — not yet decided` or omit the section entirely. An empty-but-honest doc is correct; an invented architecture is a cascading failure. Follow the **Knowledge Verification Chain** (see SKILL.md) and flag uncertainty rather than guessing.

## When to Run

- **Initial seed:** Right after project-init (PROJECT.md + ROADMAP.md exist), when at least the tech stack or a first architectural decision is known. If nothing is decided yet, skip — there is nothing to document.
- **Progressive updates:** This is living documentation. Update the relevant `.specs/codebase/` doc whenever:
  - A new ADR is created in `docs/adr/` (sync ARCHITECTURE.md / STACK.md / CONCERNS.md)
  - A `design.md` promotes a Tech Decision (sync ARCHITECTURE.md / STRUCTURE.md)
  - A stack, convention, or integration choice is made or changed
  - A known risk, assumption, or constraint is identified (sync CONCERNS.md)

## Process

1. **Read the decision sources first:** `.specs/project/PROJECT.md`, `.specs/project/ROADMAP.md`, every file in `docs/adr/`, and any existing `.specs/features/*/design.md`. These are the ONLY sources of truth for what has been decided.
2. **Create only the docs that have real content.** Do not create empty stubs for the sake of completeness. It is normal for a greenfield project to start with just STACK.md, ARCHITECTURE.md, and CONCERNS.md and grow the rest as the project matures.
3. **Mark maturity explicitly.** Every greenfield doc carries a `**Status:** Planned | Partially implemented | Implemented` line so readers know how much is intent vs. reality.
4. **Cross-link ADRs.** Wherever a doc records a decision that came from an ADR, cite `ADR-NNNN`. This keeps the architecture docs and `docs/adr/` in sync.
5. **Once real code exists,** transition maintenance to [brownfield-mapping.md](brownfield-mapping.md) conventions — the same 7 files keep their identity, but their framing shifts from "planned" to "observed".

## Output: `.specs/codebase/` (same 7 files as brownfield)

The greenfield bootstrap produces the **same file set** as brownfield mapping so there is no migration cost later. Reuse the templates in [brownfield-mapping.md](brownfield-mapping.md) and [concerns.md](concerns.md), with the greenfield adaptations below. Each file gets a `**Status:**` line and a `**Sources:**` line listing the decision documents it was derived from.

| File            | Greenfield content (derive from)                                                                   | Create initially? |
| --------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| STACK.md        | Chosen framework/language/DB/deps from PROJECT.md + ADRs. Mark undecided rows `TBD`.               | Yes, if stack chosen |
| ARCHITECTURE.md | Intended patterns, data flow, and boundaries from ADRs + design decisions.                          | Yes, if any decision made |
| CONVENTIONS.md  | Chosen naming/style/error-handling standards (from user or a linter/formatter choice).             | When conventions decided |
| STRUCTURE.md    | Planned directory layout and where things will live.                                               | When layout decided |
| TESTING.md      | Chosen test strategy, frameworks, and target gates. Drives task test-type assignment later.        | When testing decided |
| INTEGRATIONS.md | Planned external services, APIs, and auth approaches (e.g. this repo's storage/VLM provider ADRs). | When integrations chosen |
| CONCERNS.md     | Known risks, assumptions, open questions, and constraints — the greenfield equivalent of tech debt. | Yes — greenfield always has open risks |

### Greenfield framing adaptations

- **STACK.md / INTEGRATIONS.md:** Replace "detected from manifest" language with "chosen in ADR-NNNN / PROJECT.md". Rows with no decision yet are `TBD`, not guessed.
- **ARCHITECTURE.md:** The "Identified Patterns" section becomes "Intended Patterns". Each pattern cites the ADR or design decision that mandates it, and `**Example:**` may read `to be implemented in [feature]` until code exists.
- **CONVENTIONS.md:** Document the *target* conventions (from a chosen style guide, formatter, or user preference). Note "no code yet — conventions are prescriptive" until enforced by real files.
- **TESTING.md:** Fill the Test Coverage Matrix and Gate Check Commands with the *planned* strategy. Mark commands `TBD` until the toolchain is installed; do not invent commands that do not run.
- **CONCERNS.md:** Instead of observed bugs/bottlenecks, capture **assumptions to validate, open technical questions, and constraints** (e.g. auditability requirements, scale targets, deviations documented in ADRs). Use the [concerns.md](concerns.md) template; a `## Open Questions` / `## Assumptions` framing fits greenfield better than `## Known Bugs`.

## Guardrails

- **Do not** treat PROJECT.md scope or roadmap wishes as architectural decisions — only decisions actually made (ADRs, design docs, explicit user statements) belong here.
- **Do not** duplicate ADR prose. The docs *summarize and cross-link* ADRs; `docs/adr/` remains the source of truth for the decision itself.
- **Do not** create all 7 files by default. Create what is decided; grow the rest.
- **Respect existing repo docs.** If the project already keeps domain/architecture context elsewhere (e.g. `docs/`, an `AGENTS.md` hierarchy of sources of truth), reference it rather than restating it, and never contradict a higher-priority source (ADR > spec > domain model).

## Total Context Budget

Same per-file limits as [brownfield-mapping.md](brownfield-mapping.md). Greenfield docs typically start much smaller and grow as decisions accumulate.
