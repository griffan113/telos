import fs from "node:fs/promises";
import path from "node:path";
import { upsertAgentsMd } from "./agents-md.js";
import { HARNESS_LABELS, validatedHarnesses, validatedLanguage, validatedTracker } from "./detect.js";
import { CliError } from "./errors.js";
import { writeRendered } from "./render.js";
import { version } from "./version.js";

const ADDITIVE_DEFAULTS = {
  tracker: "local",
  language: "English",
  harnesses: [],
};

export async function update(flags = {}) {
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

  // Flag overrides are validated before anything is touched so bad input
  // never leaves a half-updated telos.json behind.
  if (flags.harness?.length) {
    const next = validatedHarnesses(flags.harness);
    if (!arrayEquals(next, config.harnesses)) {
      changelog.push(
        `telos.json: harnesses [${formatList(config.harnesses)}] → [${formatList(next)}]`
      );
    }
    config.harnesses = next;
  }
  if (flags.tracker !== undefined) {
    const tracker = validatedTracker(flags.tracker);
    if (config.tracker !== tracker) {
      changelog.push(`telos.json: tracker ${config.tracker ?? "(none)"} → ${tracker}`);
      config.tracker = tracker;
    }
  }
  if (flags.lang !== undefined) {
    const lang = validatedLanguage(flags.lang);
    if (config.language !== lang) {
      changelog.push(`telos.json: language ${config.language ?? "(none)"} → ${lang}`);
      config.language = lang;
    }
  }

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
    console.log("Applied changes:");
    for (const line of changelog) console.log(`  - ${line}`);
  } else {
    console.log("No changes needed.");
  }

  if (!Array.isArray(config.harnesses) || config.harnesses.length === 0) {
    console.warn("telos: no harnesses configured in telos.json — nothing to re-render.");
    return;
  }

  const rendered = await writeRendered(cwd, config.harnesses, version);
  const marked = await upsertAgentsMd(cwd, config.language);
  console.log(`
Re-rendered agent files for: ${formatList(config.harnesses)}
  overwritten: ${rendered.written.length}
  skipped:     ${rendered.skipped.length} (user-owned, no generated marker)
  marked:      ${marked.file} (${marked.changed ? "## Telos Framework block reconciled" : "block already current"})
`);
}

function formatList(ids) {
  const labels = (ids ?? []).map((h) => HARNESS_LABELS[h] ?? h);
  return labels.length > 0 ? labels.join(", ") : "(none)";
}

function arrayEquals(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);
}
