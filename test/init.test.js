import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { bin, gitInitWithRemote, makeTempRepo, removeTemp, repoRoot, runTelos } from "./helpers.js";

const packageVersion = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8")).version;

async function readConfig(dir) {
  return JSON.parse(await fs.readFile(path.join(dir, ".telos", "telos.json"), "utf8"));
}

test("init scaffolds the full .telos tree and records the config", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(
      ["init", "--tracker", "local", "--lang", "English", "--harness", "opencode"],
      dir
    );
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /start telos/);

    const tree = await fs.readdir(path.join(dir, ".telos"));
    for (const entry of ["telos.json", "tracker.md", "references", "project", "features"]) {
      assert.ok(tree.includes(entry), `.telos/${entry} missing`);
    }

    const config = await readConfig(dir);
    assert.equal(config.telos_version, packageVersion);
    assert.equal(config.tracker, "local");
    assert.equal(config.language, "English");
    assert.deepEqual(config.harnesses, ["opencode"]);
    assert.ok(config.created_at);

    const tracker = await fs.readFile(path.join(dir, ".telos", "tracker.md"), "utf8");
    assert.match(tracker, /Local Markdown/);

    const pipeline = await fs.readFile(path.join(dir, ".telos", "references", "pipeline.md"), "utf8");
    assert.match(pipeline, /Telos Pipeline Reference/);
  } finally {
    await removeTemp(dir);
  }
});

test("init copies the unslop reference with the three steps, rule IDs, PT examples, coverage, and scope guard", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(
      ["init", "--tracker", "local", "--lang", "English", "--harness", "opencode"],
      dir
    );
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);

    const unslop = await fs.readFile(path.join(dir, ".telos", "references", "unslop.md"), "utf8");
    assert.match(unslop, /scan/i, "missing step 1 (scan)");
    assert.match(unslop, /rewrite/i, "missing step 2 (rewrite)");
    assert.match(unslop, /self-audit/i, "missing step 3 (self-audit)");
    assert.match(unslop, /R-\d+/, "missing stable rule IDs");
    assert.match(
      unslop,
      /any language|não apenas|Espero que isso ajude/,
      "missing language independence or Portuguese examples"
    );
    assert.match(unslop, /PROJECT\.md/, "coverage list missing project files");
    assert.match(unslop, /TASK\.md/, "coverage list missing TASK.md bodies");
    assert.match(unslop, /tracker/, "coverage list missing tracker issues");
    assert.match(unslop, /AGENTS\.md/, "coverage list missing AGENTS.md/CLAUDE.md");
    assert.match(unslop, /prose/i, "scope guard missing prose side");
    assert.match(unslop, /technical/i, "scope guard missing technical side");
  } finally {
    await removeTemp(dir);
  }
});

test("init accepts multiple harnesses via flag", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(
      ["init", "--harness", "opencode,codex"],
      dir
    );
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["opencode", "codex"]);
  } finally {
    await removeTemp(dir);
  }
});

test("init with no flags in a plain dir defaults tracker and language, but requires a harness", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /--harness/);
    await assert.rejects(fs.access(path.join(dir, ".telos")));
  } finally {
    await removeTemp(dir);
  }
});

test("init defaults the tracker to local without a remote", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--harness", "claude-code"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.equal(config.tracker, "local");
    assert.equal(config.language, "English");
  } finally {
    await removeTemp(dir);
  }
});

test("init defaults the tracker to github when the origin remote is on GitHub", async () => {
  const dir = await makeTempRepo();
  try {
    await gitInitWithRemote(dir, "https://github.com/foo/bar.git");
    const result = await runTelos(["init", "--harness", "claude-code"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.equal(config.tracker, "github");
  } finally {
    await removeTemp(dir);
  }
});

test("init detects a single harness and auto-selects it", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.mkdir(path.join(dir, ".codex"));
    const result = await runTelos(["init"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /Codex/);
    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["codex"]);
  } finally {
    await removeTemp(dir);
  }
});

test("the harness flag overrides detection", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.mkdir(path.join(dir, ".opencode"));
    await fs.mkdir(path.join(dir, ".claude"));
    const result = await runTelos(["init", "--harness", "claude-code"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.deepEqual(config.harnesses, ["claude-code"]);
  } finally {
    await removeTemp(dir);
  }
});

test("an unknown --harness value fails with the valid list", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--harness", "cursor"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /cursor/);
    assert.match(result.err, /opencode, claude-code, copilot, codex/);
  } finally {
    await removeTemp(dir);
  }
});

test("an unknown tracker value fails with the valid list", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--tracker", "jira", "--harness", "opencode"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /jira/);
    assert.match(result.err, /local, github, azure/);
  } finally {
    await removeTemp(dir);
  }
});

test("an unknown flag exits with a usage error", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--wat"], dir);
    assert.equal(result.code, 2);
    assert.match(result.err, /--wat/);
  } finally {
    await removeTemp(dir);
  }
});

test("init --help prints help and scaffolds nothing", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["init", "--help"], dir);
    assert.equal(result.code, 0);
    assert.match(result.out, /Usage:/);
    await assert.rejects(fs.access(path.join(dir, ".telos")));
  } finally {
    await removeTemp(dir);
  }
});

test("a repo with only copilot-instructions.md does not auto-select copilot", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.mkdir(path.join(dir, ".github"));
    await fs.writeFile(path.join(dir, ".github", "copilot-instructions.md"), "# conventions");
    const result = await runTelos(["init"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /--harness/);
  } finally {
    await removeTemp(dir);
  }
});

test("a partially initialized .telos tree is refused, not overwritten", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.mkdir(path.join(dir, ".telos"), { recursive: true });
    await fs.writeFile(path.join(dir, ".telos", "tracker.md"), "user edits");
    const result = await runTelos(["init", "--harness", "opencode"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /partially initialized/);
    assert.equal(await fs.readFile(path.join(dir, ".telos", "tracker.md"), "utf8"), "user edits");
  } finally {
    await removeTemp(dir);
  }
});

test("the language flag accepts free text verbatim", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(
      ["init", "--lang", "Português (BR)", "--harness", "opencode"],
      dir
    );
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const config = await readConfig(dir);
    assert.equal(config.language, "Português (BR)");
  } finally {
    await removeTemp(dir);
  }
});

test("re-running init is non-destructive and reports current state", async () => {
  const dir = await makeTempRepo();
  try {
    const first = await runTelos(["init", "--tracker", "github", "--harness", "opencode"], dir);
    assert.equal(first.code, 0, `${first.out}\n${first.err}`);

    const marker = path.join(dir, ".telos", "project", "hand-written.md");
    await fs.writeFile(marker, "user content");

    const second = await runTelos(["init"], dir);
    assert.equal(second.code, 0, `${second.out}\n${second.err}`);
    assert.match(second.out, /already initialized/);
    assert.match(second.out, /nothing was modified/i);

    assert.equal(await fs.readFile(marker, "utf8"), "user content");
  } finally {
    await removeTemp(dir);
  }
});
