import fs from "node:fs";
import path from "node:path";
import { CliError } from "./errors.js";

export const HARNESS_IDS = ["opencode", "claude-code", "copilot", "codex"];

export const HARNESS_LABELS = {
  "opencode": "OpenCode",
  "claude-code": "Claude Code",
  "copilot": "VS Code Copilot",
  "codex": "Codex",
};

export const TRACKER_IDS = ["local", "github", "azure"];

// Shared with init and update so both accept the same values and normalize
// them the same way (validation never changes stored data).
export function validatedHarnesses(ids) {
  for (const id of ids) {
    if (!HARNESS_IDS.includes(id)) {
      throw new CliError(`unknown harness: ${id}\nValid: ${HARNESS_IDS.join(", ")}`);
    }
  }
  return [...new Set(ids)];
}

export function validatedTracker(tracker) {
  if (!TRACKER_IDS.includes(tracker)) {
    throw new CliError(`unknown tracker: ${tracker}\nValid: ${TRACKER_IDS.join(", ")}`);
  }
  return tracker;
}

export function validatedLanguage(lang) {
  const trimmed = (lang ?? "").trim();
  if (!trimmed) throw new CliError("--lang needs a non-empty value");
  return trimmed;
}

function exists(target) {
  try {
    fs.statSync(target);
    return true;
  } catch {
    return false;
  }
}

export function detectHarnesses(dir) {
  const found = [];
  if (exists(path.join(dir, ".opencode")) || exists(path.join(dir, "opencode.json"))) {
    found.push("opencode");
  }
  if (exists(path.join(dir, ".claude"))) {
    found.push("claude-code");
  }
  if (exists(path.join(dir, ".github", "chatmodes"))) {
    found.push("copilot");
  }
  if (exists(path.join(dir, ".codex"))) {
    found.push("codex");
  }
  return found;
}

// Reads .git/config directly so we never need to spawn git.
export function detectRemote(dir) {
  const config = path.join(dir, ".git", "config");
  if (!exists(config)) return null;
  let text;
  try {
    text = fs.readFileSync(config, "utf8");
  } catch {
    return null;
  }
  const urls = [...text.matchAll(/^\s*url\s*=\s*(\S+)\s*$/gm)].map((m) => m[1]);
  for (const url of urls) {
    if (/github\.com[:/]/.test(url)) return "github";
    if (/dev\.azure\.com|visualstudio\.com/.test(url)) return "azure";
  }
  return null;
}
