import fs from "node:fs/promises";
import path from "node:path";
import { CliError } from "./errors.js";
import { loadAgents } from "./agents.js";

const adapters = {
  "opencode": () => import("../adapters/opencode/index.js"),
  "claude-code": () => import("../adapters/claude-code/index.js"),
  "copilot": () => import("../adapters/copilot/index.js"),
  "codex": () => import("../adapters/codex/index.js"),
};

export async function renderFor(harnesses, version) {
  const agents = (await loadAgents()).map(withRequiredReferences);
  const files = [];
  for (const harness of harnesses) {
    if (!adapters[harness]) {
      throw new CliError(`unknown harness in telos.json: ${harness}. Valid: ${Object.keys(adapters).join(", ")}`);
    }
    const { render } = await adapters[harness]();
    files.push(...render(agents, version));
  }
  return files;
}

// The neutral frontmatter carries required-references, but adapters render
// harness-native frontmatter; inject the list into the body so every rendered
// agent can resolve "read your required references" on any harness.
function withRequiredReferences(agent) {
  const refs = agent["required-references"];
  if (!Array.isArray(refs) || refs.length === 0) return agent;
  const block = [
    "## Required references",
    "",
    "Read these before acting:",
    ...refs.map((r) => `- ${r}`),
    "",
  ].join("\n");
  return { ...agent, body: agent.body.trimEnd() + "\n\n" + block };
}

const MARKER_RE = /<!--\s*telos:generated\s+v?\d+\.\d+\.\d+\s*-->/;

export function hasGeneratedMarker(text) {
  return MARKER_RE.test(text);
}

export async function writeRendered(cwd, harnesses, version) {
  const files = await renderFor(harnesses, version);
  const result = { written: [], skipped: [] };
  for (const file of files) {
    const target = path.join(cwd, file.path);
    let existing;
    try {
      existing = await fs.readFile(target, "utf8");
    } catch {
      existing = null;
    }
    if (existing !== null && !hasGeneratedMarker(existing)) {
      console.warn(`telos: skipping user-owned file (no generated marker): ${file.path}`);
      result.skipped.push(file.path);
      continue;
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.content);
    result.written.push(file.path);
  }
  return result;
}
