import fs from "node:fs/promises";
import path from "node:path";
import { upsertAgentsMd } from "./agents-md.js";
import { HARNESS_LABELS } from "./detect.js";
import { CliError } from "./errors.js";
import { writeRendered } from "./render.js";
import { version } from "./version.js";

const ADDITIVE_DEFAULTS = {
  tracker: "local",
  language: "English",
  harnesses: [],
};

export async function update() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, ".telos", "telos.json");

  let raw;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new CliError("Telos is not initialized in this repo. Run `telos init` first.");
    }
    throw err;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    throw new CliError(
      ".telos/telos.json is not valid JSON — restore or remove it, then re-run `telos init`."
    );
  }

  const changelog = [];
  for (const [key, fallback] of Object.entries(ADDITIVE_DEFAULTS)) {
    if (!(key in config)) {
      config[key] = fallback;
      changelog.push(`telos.json: added missing key "${key}" (default: ${JSON.stringify(fallback)})`);
    }
  }
  if (config.telos_version !== version) {
    changelog.push(`telos.json: telos_version ${config.telos_version ?? "(none)"} → ${version}`);
    config.telos_version = version;
  }
  if (changelog.length > 0) {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    console.log("Additive migrations applied:");
    for (const line of changelog) console.log(`  - ${line}`);
  } else {
    console.log("No migrations needed.");
  }

  if (!Array.isArray(config.harnesses) || config.harnesses.length === 0) {
    console.warn("telos: no harnesses configured in telos.json — nothing to re-render.");
    return;
  }

  const rendered = await writeRendered(cwd, config.harnesses, version);
  const marked = await upsertAgentsMd(cwd, config.language);
  console.log(`
Re-rendered agent files for: ${config.harnesses.map((h) => HARNESS_LABELS[h] ?? h).join(", ")}
  overwritten: ${rendered.written.length}
  skipped:     ${rendered.skipped.length} (user-owned, no generated marker)
  marked:      ${marked.file} (${marked.changed ? "## Telos Framework block reconciled" : "block already current"})
`);
}
