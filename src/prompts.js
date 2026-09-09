import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { CliError } from "./errors.js";
import { HARNESS_IDS, HARNESS_LABELS, TRACKER_IDS } from "./detect.js";

const TRACKER_DESCRIPTIONS = {
  local: "markdown task files, zero setup",
  github: "GitHub Issues via the gh CLI",
  azure: "Azure DevOps via the az CLI",
};

const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Japanese",
  "Korean",
  "Simplified Chinese",
  "Russian",
  "Polish",
  "Turkish",
];

let rl = null;

export function isTTY() {
  return Boolean(stdin.isTTY && stdout.isTTY);
}

function getRl() {
  if (!isTTY()) {
    throw new CliError(
      "telos needs an interactive terminal to ask questions. " +
        "Re-run with flags (--tracker, --lang, --harness) to skip prompts."
    );
  }
  if (!rl) rl = readline.createInterface({ input: stdin, output: stdout });
  return rl;
}

export function closePrompts() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

export async function promptTracker(def) {
  const lines = ["Task tracker — where should task status live?"];
  TRACKER_IDS.forEach((id, i) => {
    lines.push(`  ${i + 1}) ${id}${id === def ? " (default)" : ""} — ${TRACKER_DESCRIPTIONS[id]}`);
  });
  lines.push("> ");
  const answer = await ask(getRl(), lines.join("\n"));
  const map = Object.fromEntries(TRACKER_IDS.map((id, i) => [String(i + 1), id]));
  if (answer in map) return map[answer];
  return def;
}

export async function promptLanguage() {
  const lines = ["Artifact language for all generated content (Enter = English):"];
  COMMON_LANGUAGES.forEach((lang, i) => lines.push(`  ${i + 1}) ${lang}${i === 0 ? " (default)" : ""}`));
  lines.push("Or type any language name. > ");
  const answer = await ask(getRl(), lines.join("\n"));
  if (answer === "") return "English";
  const index = Number.parseInt(answer, 10);
  if (Number.isInteger(index) && index >= 1 && index <= COMMON_LANGUAGES.length) {
    return COMMON_LANGUAGES[index - 1];
  }
  return answer.trim();
}

export async function promptHarnesses(detected) {
  const lines = ["AI harness — select one or more (comma-separated numbers, or 'a' for all):"];
  HARNESS_IDS.forEach((id, i) => {
    const mark = detected.includes(id) ? " (detected)" : "";
    lines.push(`  ${i + 1}) ${HARNESS_LABELS[id]}${mark}`);
  });
  lines.push("> ");
  const answer = await ask(getRl(), lines.join("\n"));
  const picks = parsePick(answer, HARNESS_IDS.length);
  if (!picks) {
    console.error("telos: enter numbers separated by commas, or 'a' for all.");
    return promptHarnesses(detected);
  }
  return picks.map((i) => HARNESS_IDS[i - 1]);
}

function parsePick(answer, count) {
  const trimmed = answer.trim().toLowerCase();
  if (trimmed === "a" || trimmed === "all") {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  if (trimmed === "") return null;
  const nums = trimmed
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((s) => Number.parseInt(s, 10));
  if (nums.length === 0 || nums.some((n) => !Number.isInteger(n) || n < 1 || n > count)) return null;
  return [...new Set(nums)].sort((a, b) => a - b);
}

async function ask(rli, question) {
  const answer = await rli.question(question);
  return answer.trim();
}
