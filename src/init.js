import fs from "node:fs/promises";
import path from "node:path";
import { CliError } from "./cli.js";
import { upsertAgentsMd } from "./agents-md.js";
import { HARNESS_IDS, HARNESS_LABELS, TRACKER_IDS, detectHarnesses, detectRemote } from "./detect.js";
import { version } from "./version.js";
import { closePrompts, isTTY, promptHarnesses, promptLanguage, promptTracker } from "./prompts.js";
import { writeRendered } from "./render.js";
import { scaffold } from "./scaffold.js";

export async function init(flags) {
  try {
    const cwd = process.cwd();
    const configPath = path.join(cwd, ".telos", "telos.json");

    if (await exists(configPath)) {
      await reportState(configPath);
      return;
    }

    const trackerMd = path.join(cwd, ".telos", "tracker.md");
    if (await exists(trackerMd)) {
      throw new CliError(
        ".telos/ contains Telos artifacts (tracker.md) but no telos.json — " +
          "the tree looks partially initialized. Remove or restore .telos/ and re-run."
      );
    }

    const harnesses = await resolveHarnesses(cwd, flags);
    const tracker = await resolveTracker(cwd, flags);
    const language = await resolveLanguage(flags);

    await scaffold(cwd, {
      telos_version: version,
      created_at: new Date().toISOString(),
      tracker,
      language,
      harnesses,
    });

    const rendered = await writeRendered(cwd, harnesses, version);
    const marked = await upsertAgentsMd(cwd, language);

    console.log(`
Telos ${version} initialized in .telos/
  tracker:   ${tracker}
  language:  ${language}
  harnesses: ${harnesses.map((h) => HARNESS_LABELS[h]).join(", ")}
  agents:    ${rendered.written.length} rendered${rendered.skipped.length ? `, ${rendered.skipped.length} skipped (user-owned)` : ""}
  marked:    ${marked.file}${marked.created ? " (created)" : " (## Telos Framework block)"}

Next: open your AI harness and say: start telos
`);
  } finally {
    closePrompts();
  }
}

async function resolveHarnesses(cwd, flags) {
  if (flags.harness?.length) {
    for (const id of flags.harness) {
      if (!HARNESS_IDS.includes(id)) {
        throw new CliError(`unknown harness: ${id}\nValid: ${HARNESS_IDS.join(", ")}`);
      }
    }
    return [...new Set(flags.harness)];
  }

  const detected = detectHarnesses(cwd);
  if (detected.length === 1) {
    console.log(`Detected ${HARNESS_LABELS[detected[0]]} as the target harness.`);
    return detected;
  }

  if (isTTY()) {
    return promptHarnesses(detected);
  }

  const seen = detected.length
    ? `detected ${detected.join(", ")}`
    : "detected none";
  throw new CliError(
    `could not determine which AI harness to target (${seen}). ` +
      `Pass --harness <id[,id...]> (valid: ${HARNESS_IDS.join(", ")}).`
  );
}

async function resolveTracker(cwd, flags) {
  if (flags.tracker) {
    if (!TRACKER_IDS.includes(flags.tracker)) {
      throw new CliError(`unknown tracker: ${flags.tracker}\nValid: ${TRACKER_IDS.join(", ")}`);
    }
    return flags.tracker;
  }
  if (isTTY()) {
    return promptTracker(detectRemote(cwd) ?? "local");
  }
  return detectRemote(cwd) ?? "local";
}

async function resolveLanguage(flags) {
  if (flags.lang !== undefined) {
    const lang = flags.lang.trim();
    if (!lang) throw new CliError("--lang needs a non-empty value");
    return lang;
  }
  if (isTTY()) {
    return promptLanguage();
  }
  return "English";
}

async function reportState(configPath) {
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  console.log(`
Telos is already initialized in this repo — nothing was modified.
  version:    ${config.telos_version}
  tracker:    ${config.tracker}
  language:   ${config.language}
  harnesses:  ${(config.harnesses ?? []).map((h) => HARNESS_LABELS[h] ?? h).join(", ")}

To refresh agent files after upgrading, run: telos update
`);
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}
