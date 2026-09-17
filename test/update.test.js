import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { makeTempRepo, removeTemp, runTelos } from "./helpers.js";

async function readConfig(dir) {
  return JSON.parse(await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8"));
}

async function initTelos(dir, args) {
  const result = await runTelos(["init", ...args], dir);
  assert.equal(result.code, 0, `${result.out}\n${result.err}`);
}

test("update --harness replaces the configured harnesses and re-renders them", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--tracker", "local", "--lang", "English", "--harness", "opencode"]);

    const result = await runTelos(["update", "--harness", "claude-code,codex"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /harnesses \[OpenCode\] → \[Claude Code, Codex\]/);
    assert.match(result.out, /Claude Code, Codex/);

    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["claude-code", "codex"]);

    await fs.access(path.join(dir, ".claude", "agents"));
    await fs.access(path.join(dir, ".codex", "skills"));
  } finally {
    await removeTemp(dir);
  }
});

test("update --tracker and --lang replace the configured values", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);

    const result = await runTelos(
      ["update", "--tracker", "github", "--lang", "Português (BR)"],
      dir
    );
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /tracker local → github/);
    assert.match(result.out, /language English → Português \(BR\)/);

    const config = await readConfig(dir);
    assert.equal(config.tracker, "github");
    assert.equal(config.language, "Português (BR)");
    assert.deepEqual(config.harnesses, ["opencode"]);
  } finally {
    await removeTemp(dir);
  }
});

test("update with unchanged option values still re-renders without a changelog entry", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);

    const result = await runTelos(["update", "--harness", "opencode", "--tracker", "local"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /No changes needed./);
    assert.match(result.out, /Re-rendered agent files/);

    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["opencode"]);
    assert.equal(config.tracker, "local");
  } finally {
    await removeTemp(dir);
  }
});

test("update --harness accepts duplicated ids and dedupes them", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);

    const result = await runTelos(["update", "--harness", "opencode,codex,opencode"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["opencode", "codex"]);
  } finally {
    await removeTemp(dir);
  }
});

test("update --harness works on a config with no harnesses configured", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);
    const configPath = path.join(dir, ".telos", "telos.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf8"));
    delete config.harnesses;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");

    const result = await runTelos(["update", "--harness", "codex"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /harnesses \[\(none\)\] → \[Codex\]/);
    await fs.access(path.join(dir, ".codex", "skills"));
  } finally {
    await removeTemp(dir);
  }
});

test("update rejects an unknown harness without touching telos.json", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);
    const before = await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8");

    const result = await runTelos(["update", "--harness", "cursor"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /cursor/);
    assert.match(result.err, /opencode, claude-code, copilot, codex/);

    assert.equal(await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8"), before);
  } finally {
    await removeTemp(dir);
  }
});

test("update rejects an unknown tracker without touching telos.json", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);
    const before = await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8");

    const result = await runTelos(["update", "--tracker", "jira"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /jira/);
    assert.match(result.err, /local, github, azure/);

    assert.equal(await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8"), before);
  } finally {
    await removeTemp(dir);
  }
});

test("update rejects an empty --lang", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--harness", "opencode"]);

    const result = await runTelos(["update", "--lang", "   "], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /--lang needs a non-empty value/);
  } finally {
    await removeTemp(dir);
  }
});

test("update without flags keeps the configured options untouched", async () => {
  const dir = await makeTempRepo();
  try {
    await initTelos(dir, ["--tracker", "github", "--lang", "French", "--harness", "codex"]);

    const result = await runTelos(["update"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /No changes needed./);
    assert.match(result.out, /Re-rendered agent files for: Codex/);

    const config = await readConfig(dir);
    assert.equal(config.tracker, "github");
    assert.equal(config.language, "French");
    assert.deepEqual(config.harnesses, ["codex"]);
  } finally {
    await removeTemp(dir);
  }
});
