// Harness-neutral → Codex renderer.
// Targets .codex/skills/<name>/SKILL.md — ONLY the Codex skills dir, never
// .agents/skills/ (Codex reads both; writing to both would register each
// skill twice).
//
// Codex runs single-context: the orchestrator emulates dispatch by loading
// each phase's SKILL.md by path in one session.

const ORCHESTRATOR_ADDENDUM = `
## Harness note (Codex)

This harness is single-context and cannot spawn subagents. Emulate dispatch by
loading each phase's prompt file by path in this same session (e.g.
\`.codex/skills/telos-specify/SKILL.md\`), and adopt that file's instructions
for the duration of the phase. Tasks run sequentially, not in parallel.
Pipeline semantics, gates, and cascade are file-based and therefore identical
everywhere.
`;

export function render(agents, version) {
  return agents.map((agent) => {
    const frontmatter = [
      "---",
      `name: ${agent.name}`,
      `description: ${JSON.stringify(agent.description)}`,
      "---",
    ].join("\n");
    const body = agent.phase === "orchestrator" ? agent.body + ORCHESTRATOR_ADDENDUM : agent.body;
    return {
      path: `.codex/skills/${agent.name}/SKILL.md`,
      content: `${frontmatter}\n\n<!-- telos:generated v${version} -->\n\n${body}`,
    };
  });
}
