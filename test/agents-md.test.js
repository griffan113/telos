import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { frameworkBlock, upsertBlock, upsertAgentsMd } from "../src/agents-md.js";
import { makeTempRepo, removeTemp, runTelos } from "./helpers.js";

const BLOCK_EN = frameworkBlock("English");
const BLOCK_PT = frameworkBlock("Português (BR)");

test("frameworkBlock follows the configured language", () => {
  assert.match(BLOCK_EN, /This project uses the \[Telos Framework\]/);
  assert.match(BLOCK_PT, /Este projeto usa o \[Telos Framework\]/);
  assert.match(frameworkBlock("pt-BR"), /Este projeto usa/);
  assert.match(frameworkBlock("pt"), /Este projeto usa/);
  assert.match(frameworkBlock(), /This project uses/);
});

test("upsertBlock appends to empty and non-empty content without duplicating", () => {
  assert.equal(upsertBlock("", BLOCK_EN), BLOCK_EN + "\n");
  assert.equal(
    upsertBlock("# My repo\n\nSome conventions.\n", BLOCK_EN),
    "# My repo\n\nSome conventions.\n\n" + BLOCK_EN + "\n"
  );
});

test("upsertBlock replaces an existing block in place, preserving other sections", () => {
  const before = `# My repo\n\n## Setup\n\nnpm install\n\n${BLOCK_EN}\n\n## License\n\nMIT\n`;
  const after = upsertBlock(before, BLOCK_PT);
  assert.match(after, /Este projeto usa/);
  assert.doesNotMatch(after, /This project uses/);
  assert.match(after, /# My repo/);
  assert.match(after, /## Setup\n\nnpm install/);
  assert.match(after, /## License\n\nMIT/);
  assert.equal((after.match(/## Telos Framework/g) ?? []).length, 1);
});

test("upsertBlock is idempotent", () => {
  const once = upsertBlock("# Repo\n", BLOCK_EN);
  assert.equal(upsertBlock(once, BLOCK_EN), once);
});

async function readAgents(dir, file = "AGENTS.md") {
  return fs.readFile(path.join(dir, file), "utf8");
}

test("telos init writes the block into a new AGENTS.md", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--harness", "opencode"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /marked:\s+AGENTS\.md/);
    const content = await readAgents(dir);
    assert.match(content, /## Telos Framework/);
    assert.match(content, /This project uses the \[Telos Framework\]/);
    assert.match(content, /Route every task through the Telos orchestrator/);
  } finally {
    await removeTemp(dir);
  }
});

test("telos init prefers CLAUDE.md when it exists and never creates AGENTS.md", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.writeFile(path.join(dir, "CLAUDE.md"), "# Conventions\n");
    const result = await runTelos(["init", "--harness", "opencode"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /marked:\s+CLAUDE\.md/);
    assert.match(await readAgents(dir, "CLAUDE.md"), /## Telos Framework/);
    await assert.rejects(fs.access(path.join(dir, "AGENTS.md")));
  } finally {
    await removeTemp(dir);
  }
});

test("telos init respects --lang for the block text", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--harness", "opencode", "--lang", "Português (BR)"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const content = await readAgents(dir);
    assert.match(content, /Este projeto usa o \[Telos Framework\]/);
  } finally {
    await removeTemp(dir);
  }
});

test("telos update reconciles the block without duplicating user content", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.writeFile(path.join(dir, "AGENTS.md"), "# Conventions\n");
    const first = await runTelos(["init", "--harness", "opencode"], dir);
    assert.equal(first.code, 0, `${first.out}\n${first.err}`);

    await fs.writeFile(path.join(dir, ".telos", "telos.json"), JSON.stringify({
      telos_version: "0.0.3",
      tracker: "local",
      language: "Português (BR)",
      harnesses: ["opencode"],
    }, null, 2) + "\n");

    const second = await runTelos(["update"], dir);
    assert.equal(second.code, 0, `${second.out}\n${second.err}`);
    assert.match(second.out, /reconciled/);

    const content = await readAgents(dir);
    assert.match(content, /# Conventions/);
    assert.match(content, /Este projeto usa o \[Telos Framework\]/);
    assert.match(content, /Encaminhe toda tarefa ao orquestrador Telos/);
    assert.doesNotMatch(content, /Route every task/);
    assert.equal((content.match(/## Telos Framework/g) ?? []).length, 1);
  } finally {
    await removeTemp(dir);
  }
});

test("telos update reports the block as current when nothing changed", async () => {
  const dir = await makeTempRepo();
  try {
    const first = await runTelos(["init", "--harness", "opencode"], dir);
    assert.equal(first.code, 0, `${first.out}\n${first.err}`);
    const second = await runTelos(["update"], dir);
    assert.equal(second.code, 0, `${second.out}\n${second.err}`);
    assert.match(second.out, /block already current/);
  } finally {
    await removeTemp(dir);
  }
});
