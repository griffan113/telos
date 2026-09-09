import fs from "node:fs";
import path from "node:path";

export const HARNESS_IDS = ["opencode", "claude-code", "copilot", "codex"];

export const HARNESS_LABELS = {
  "opencode": "OpenCode",
  "claude-code": "Claude Code",
  "copilot": "VS Code Copilot",
  "codex": "Codex",
};

export const TRACKER_IDS = ["local", "github", "azure"];

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
