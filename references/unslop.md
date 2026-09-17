# Telos Unslop Reference

Unslop is the default writing discipline of every Telos agent. Run it over
every conversational reply you address to the user and over the prose of every
documentation surface you write (the coverage list in section 5). It cuts the
patterns that make writing read as machine generated, without changing what
the text means or how it is meant to sound. Technical content is out of scope
(the scope guard in section 6).

## Process

1. Scan the draft for the patterns below.
2. Rewrite. Preserve meaning, match intended tone.
3. Self-audit: "What makes this obviously AI generated?" Fix remaining tells.

## Patterns

Rule numbers are stable IDs that other docs cite. A removed rule leaves a
gap; never renumber. The catalogue below is the full port of the unslop skill
(`cursor/plugins` pstack/skills/unslop/SKILL.md), condensed to one line per
rule. In the source, R-1 and R-2 name the process steps above, so the
catalogue starts at R-3; the gaps at R-4, R-6, and R-21 are inherited and
stay.

- R-3. Superficial -ing phrases. "highlighting...", "ensuring...",
  "reflecting...", "showcasing...", "fostering...". Delete or expand with real
  sources.
- R-5. Vague attributions. "Experts believe", "Industry reports suggest",
  "Some critics argue". Name the source or delete.
- R-7. AI vocabulary. Additionally, crucial, delve, enduring, enhance,
  fostering, garner, interplay, intricate, landscape (abstract), pivotal,
  showcase, tapestry (abstract), testament, underscore, vibrant. Replace with
  plain words.
- R-8. Fancy ways to say "is". "serves as", "stands as", "boasts",
  "features". Say "is" or "has".
- R-9. "Not just X, but Y". State the point directly.
- R-10. Rule of three. Forcing ideas into groups of three. Use the natural
  number.
- R-11. Synonym cycling. Protagonist, main character, central figure, hero
  all in one paragraph. Pick one, repeat it.
- R-12. False ranges. "from X to Y" where X and Y are not on a meaningful
  scale. List the topics directly.
- R-13. Em dash overuse. Avoid em dashes entirely. Use periods or commas
  only (no parentheses, no en dashes, no hyphen-as-dash substitutes). If a
  thought needs separation, end the sentence or use a comma.
- R-14. Colon overuse. Colons are fine before a list or example, not as
  mid-sentence connectors. Rewrite so the point stands on its own without
  comparison framing.
- R-15. Boldface overuse. Do not bold every proper noun or acronym.
- R-16. Inline-header lists. The tell is a bold label and colon that
  restates the line. Convert those to prose. A bold lead-in that ends in a
  period, names the item, and is followed by genuinely new detail is fine.
- R-17. Title-case headings. Use sentence case.
- R-18. Decorative emojis. Remove from headings and bullets.
- R-19. Curly quotes. Replace with straight quotes.
- R-20. Chatbot phrases. "I hope this helps!", "Let me know if...",
  "Of course!", "Certainly!", "Found the smoking gun!". Remove.
- R-22. Sycophantic tone. "Great question! You're absolutely right!" Respond
  directly.
- R-23. Filler phrases. "In order to" becomes "To". "Due to the fact that"
  becomes "Because". "It is important to note that" gets deleted.
- R-24. Excessive hedging. "could potentially possibly be argued that it
  might" becomes "may".
- R-25. Generic conclusions. "The future looks bright." State specific plans
  or facts.
- R-26. Abstract metaphor nouns. substrate, wedge, vector, locus, vantage,
  nexus, primitive (as noun), harness (as metaphor), surface (as in "API
  surface"), bedrock, scaffolding (as metaphor), modality, paradigm,
  gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame,
  north star, flywheel. Pick the concrete word: "substrate" becomes "base",
  "gold-plating" becomes "more than the job needs", "endgame" becomes "the
  last phase".
- R-27. Say what it does, not how it feels. A sentence naming a feeling
  ("the database stays close at hand") becomes the mechanism or a number.
  Ask what the sentence tells the reader to do or know, then write that. If
  it could appear unchanged in another project's docs, cut it.
- R-28. Shorten or split dense sentences. If the reader has to backtrack to
  parse a sentence, break it in two or drop clauses. One idea per sentence.
- R-29. Active voice. Catch "is/are/was/were + past participle" and name the
  actor. "the file is parsed by the loader" becomes "the loader parses the
  file". Passive is fine only when the actor is unknown or genuinely does
  not matter.
- R-30. Cut adverbs, or use a stronger verb. "runs quickly" becomes "is
  fast" or the number. "significantly improves" becomes the measured delta.
  An adverb propping up a weak verb means the verb is wrong.
- R-31. Prefer the plain word. "utilize" becomes "use", "leverage" becomes
  "use", "facilitate" becomes "help", "numerous" becomes "many", "in the
  event that" becomes "if". The fancier synonym is rarely clearer.
- R-32. Mannered prose. Aphorisms ("wire it or delete it"), rhetorical
  fragments for effect, personified code ("the plan holds it"), figurative
  verbs ("rides along", "stands on"), stock framing phrases. Say what you
  mean; R-26 covers the metaphor nouns.
- R-33. Over-compression. Dropped articles, verbless fragments,
  symbol-speak, abbreviations the reader has to decode. "Parser rejects bad
  date → exit 2, no write" becomes "The parser rejects a bad date, exits
  with code 2, and writes nothing." Write whole sentences with their
  articles and verbs; spell out arrows and abbreviations.

## Language

The patterns are detected in whatever language the text is written in, not
only in English. Scan, rewrite, and self-audit a reply or a document in its
own language; never translate first. The tells exist in every language, so
map each rule to its natural equivalents.

Portuguese examples:

- Filler and hedging: "É importante notar que…" gets deleted; "além disso"
  is cut unless it carries a real addition.
- Sycophantic opener: "Ótima pergunta! Você tem toda razão!" Respond
  directly.
- Chatbot phrases: "Espero que isso ajude!" and "Ficarei à disposição".
  Remove.
- False contrast: "não apenas X, mas sim Y". State the point directly.
- Inflated vocabulary: "crucial" and "fundamental" become "importante" or
  are dropped; "robusto" becomes the concrete property ("resiste a entradas
  inválidas", "trata falhas de rede").
- Passive voice: "o arquivo é processado pelo carregador" becomes "o
  carregador processa o arquivo".
- Em dash overuse: "O carregador valida o arquivo — e depois o processa —
  antes de gravar." becomes "O carregador valida o arquivo e o processa
  antes de gravar."

## Coverage

Unslop applies to the prose of these surfaces, which Telos agents write,
author, or edit:

1. Orchestrator-authored project files: the prose of
   `.telos/project/PROJECT.md`, `ROADMAP.md`, and the decisions & blockers
   prose of `STATE.md` (tables stay structural).
2. Phase artifact prose: spec.md, contracts.md (interface definitions stay
   in code syntax), design.md, tasks.md (structural and mechanical table
   cells stay).
3. TASK.md bodies: implementation notes, verification-plan prose, and
   evidence narration (commands and their literal output stay verbatim).
4. Tracker issue bodies and comments (github/azure): body prose and
   comments; excluded are the fixed `telos:` title convention and the
   `Blocked by:` line format.
5. Reference and doc files agents ship or edit as feature work: prose in
   `.telos/references/*` files an agent authors or revises, guidance
   sections in the consumer repo's AGENTS.md / CLAUDE.md, and any README or
   docs files the tasks touch, in whatever language each file is maintained
   in.

## Scope guard

Unslop edits the prose of what agents write, conversation and
documentation. It never rewrites technical content, which stays exactly as
the mechanics require:

- Code and code blocks, commands, file paths, and directory names.
- REQ-NN IDs, unslop R-<n> rule IDs, tracker issue numbers, task NNs, and
  the fixed-ASCII `telos:` tracker title convention.
- Artifact frontmatter and the structural or mechanical cells of tables
  (statuses, dependency lists, hash columns).
- Quoted verbatim text: user feedback, confirmed symptoms, quoted artifact
  passages, and hard-stop messages (fixed strings).
- The mechanical parts of commit messages: Conventional Commits type and
  scope, `fix:` and `superseded:` prefixes, and issue references (prose
  bodies may be unslopped).

What unslop preserves: meaning, tone, and every mechanical obligation. Gate
semantics ("approve advances / request changes loops"), the at-most-10-line
summary limit, hard-stop message wording, and the exact technical strings
above are untouched. Only prose style changes.
