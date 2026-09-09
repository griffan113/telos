// Harness-neutral → VS Code Copilot renderer.
// Targets .github/chatmodes/<name>.chatmode.md. Copilot runs single-context:
// it cannot spawn subagents, so the orchestrator emulates dispatch by loading
// each phase's chat mode file by path in one session.

const ORCHESTRATOR_ADDENDUM = `
## Harness note (VS Code Copilot)

This harness is single-context and cannot spawn subagents. Emulate dispatch by
loading each phase's prompt file by path in this same session, in orchestrator
order (e.g. \`.github/chatmodes/telos-specify.chatmode.md\`), and adopt that
file's instructions for the duration of the phase. Tasks execute sequentially,
not in parallel. Pipeline semantics, gates, and cascade are file-based and
therefore identical everywhere.
`;

export function render(agents, version) {
  return agents.map((agent) => {
    const frontmatter = [
      "---",
      `description: ${JSON.stringify(agent.description)}`,
      "---",
    ].join("\n");
    const body = agent.phase === "orchestrator" ? agent.body + ORCHESTRATOR_ADDENDUM : agent.body;
    return {
      path: `.github/chatmodes/${agent.name}.chatmode.md`,
      content: `${frontmatter}\n\n<!-- telos:generated v${version} -->\n\n${body}`,
    };
  });
}
