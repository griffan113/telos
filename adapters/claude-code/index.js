// Harness-neutral → Claude Code renderer.
// Targets .claude/agents/<name>.md; frontmatter carries name + description.
// Every agent is directly invocable in Claude Code; the orchestrator spawns
// the phase agents as subagents.

export function render(agents, version) {
  return agents.map((agent) => {
    const frontmatter = [
      "---",
      `name: ${agent.name}`,
      `description: ${JSON.stringify(agent.description)}`,
      "---",
    ].join("\n");
    return {
      path: `.claude/agents/${agent.name}.md`,
      content: `${frontmatter}\n\n<!-- telos:generated v${version} -->\n\n${agent.body}`,
    };
  });
}
