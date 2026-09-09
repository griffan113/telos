import { init } from "./init.js";
import { update } from "./update.js";
import { CliError } from "./errors.js";

export { CliError };

const HELP = `telos — coding with purpose

Usage:
  telos init      Set up the Telos framework in the current repository
  telos update    Re-render generated agent files after upgrading Telos
  telos help      Show this help

init flags (all optional; interactive prompts fill the rest):
  --tracker <local|github|azure>   Task tracker to sync into
  --lang <language>                Artifact language (default: English)
  --harness <id[,id...]>           Target harness(es); overrides detection
                                   Valid: opencode, claude-code, copilot, codex

After init, open your AI harness and say: start telos
`;

export function parseFlags(argv) {
  const flags = {};
  const flagDefs = [
    ["--tracker", "tracker", "single"],
    ["--lang", "lang", "single"],
    ["--language", "lang", "single"],
    ["--harness", "harness", "list"],
  ];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
      continue;
    }
    const def = flagDefs.find(([name]) => name === arg);
    if (!def) {
      throw new CliError(`unknown argument: ${arg}\n${HELP}`, 2);
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith("--")) {
      throw new CliError(`missing value for ${arg}`, 2);
    }
    const [, key, kind] = def;
    if (kind === "list") {
      const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
      flags[key] = [...(flags[key] ?? []), ...parts];
    } else {
      flags[key] = value;
    }
  }
  return flags;
}

export async function run(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }
  const flags = parseFlags(rest);
  if (flags.help) {
    console.log(HELP);
    return;
  }
  switch (command) {
    case "init":
      return init(flags);
    case "update":
      return update(flags);
    default:
      throw new CliError(`unknown command: ${command}\n${HELP}`, 2);
  }
}
