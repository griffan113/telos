import fs from "node:fs/promises";
import path from "node:path";

const HEADING_RE = /^## Telos Framework\s*$/;
const NEXT_SECTION_RE = /^#{1,2} /;

const BLOCKS = {
  en: [
    "## Telos Framework",
    "",
    "This project uses the [Telos Framework](https://www.npmjs.com/package/use-telos) (spec-driven, orchestrator-driven).",
    "",
    "Route every task through the Telos orchestrator: say \"start telos\" in your AI harness. Do not implement features or fixes outside its pipeline.",
  ],
  pt: [
    "## Telos Framework",
    "",
    "Este projeto usa o [Telos Framework](https://www.npmjs.com/package/use-telos) (spec-driven, orchestrator-driven).",
    "",
    "Encaminhe toda tarefa ao orquestrador Telos: diga \"start telos\" no seu harness de IA. Não implemente features ou correções fora do pipeline.",
  ],
};

export function frameworkBlock(language) {
  const lang = (language ?? "").toLowerCase();
  return (/^(pt\b|portugu)/.test(lang) ? BLOCKS.pt : BLOCKS.en).join("\n");
}

export function upsertBlock(content, block) {
  const lines = content.split("\n");
  const start = lines.findIndex((line) => HEADING_RE.test(line));

  if (start === -1) {
    const trimmed = content.replace(/\s+$/, "");
    return (trimmed ? trimmed + "\n\n" : "") + block + "\n";
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (NEXT_SECTION_RE.test(lines[i])) {
      end = i;
      break;
    }
  }

  const before = lines.slice(0, start);
  while (before.length > 0 && before[before.length - 1].trim() === "") before.pop();

  const after = lines.slice(end);
  while (after.length > 0 && after[0].trim() === "") after.shift();

  const out = [...before, ...(before.length > 0 ? [""] : []), ...block.split("\n")];
  if (after.length > 0) out.push("", ...after);
  else out.push("");
  return out.join("\n");
}

export async function upsertAgentsMd(cwd, language) {
  const claudePath = path.join(cwd, "CLAUDE.md");
  const agentsPath = path.join(cwd, "AGENTS.md");

  let target;
  let created = false;
  if (await exists(claudePath)) {
    target = claudePath;
  } else if (await exists(agentsPath)) {
    target = agentsPath;
  } else {
    target = agentsPath;
    created = true;
  }

  const content = created ? "" : await fs.readFile(target, "utf8");
  const updated = upsertBlock(content, frameworkBlock(language));
  await fs.writeFile(target, updated);

  return {
    file: path.basename(target),
    created,
    changed: updated !== content,
  };
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}
