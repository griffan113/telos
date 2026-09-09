// Harness-neutral → OpenCode renderer.
// Targets .opencode/agent/<name>.md; frontmatter carries description + mode.
// The orchestrator is invocable by the user (mode: all); phase agents are
// subagents spawned by the orchestrator.

export function render(agents, version) {
  return agents.map((agent) => {
    const isOrchestrator = agent.phase === "orchestrator";
    const frontmatter = [
      "---",
      `description: ${JSON.stringify(agent.description)}`,
      `mode: ${isOrchestrator ? "all" : "subagent"}`,
      "---",
    ].join("\n");
    return {
      path: `.opencode/agent/${agent.name}.md`,
      content: `${frontmatter}\n\n<!-- telos:generated v${version} -->\n\n${agent.body}`,
    };
  });
}
