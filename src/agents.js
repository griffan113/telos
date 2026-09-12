import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function loadAgents() {
  const agentsDir = path.join(packageRoot, "agents");
  const files = (await fs.readdir(agentsDir)).filter((f) => f.endsWith(".md")).sort();
  return Promise.all(files.map(async (file) => {
    const text = await fs.readFile(path.join(agentsDir, file), "utf8");
    const { frontmatter, body } = parseFrontmatter(text);
    return { ...frontmatter, body };
  }));
}

export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, body: text };
  const frontmatter = {};
  let currentKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listEntry = line.match(/^\s*-\s+(.*)$/);
    if (listEntry && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) frontmatter[currentKey] = [];
      frontmatter[currentKey].push(listEntry[1].trim());
      continue;
    }
    const pair = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (pair) {
      currentKey = pair[1];
      frontmatter[currentKey] = pair[2].trim() || null;
    }
  }
  return { frontmatter, body: text.slice(match[0].length) };
}
