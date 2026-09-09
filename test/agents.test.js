import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { makeTempRepo, removeTemp, repoRoot, runTelos } from "./helpers.js";

const packageVersion = JSON.parse(
  await fs.readFile(path.join(repoRoot, "package.json"), "utf8")
).version;

const MARKER = `<!-- telos:generated v${packageVersion} -->`;

const AGENT_NAMES = [
  "telos-orchestrator",
  "telos-specify",
  "telos-contracts",
  "telos-design",
  "telos-tasks",
  "telos-implement",
];

const HARNESS_PATHS = {
  "opencode": (name) => `.opencode/agent/${name}.md`,
  "claude-code": (name) => `.claude/agents/${name}.md`,
  "copilot": (name) => `.github/chatmodes/${name}.chatmode.md`,
  "codex": (name) => `.codex/skills/${name}/SKILL.md`,
};

async function init(dir, harnesses) {
  const result = await runTelos(["init", "--harness", harnesses.join(",")], dir);
  assert.equal(result.code, 0, `${result.out}\n${result.err}`);
  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MARKER_RE = new RegExp(escapeRegExp(MARKER));

test("init renders all six agents with the generated marker, for every harness", async () => {
  for (const harness of Object.keys(HARNESS_PATHS)) {
    const dir = await makeTempRepo();
    try {
      await init(dir, [harness]);
      for (const name of AGENT_NAMES) {
        const relPath = HARNESS_PATHS[harness](name);
        const text = await fs.readFile(path.join(dir, relPath), "utf8");
        assert.match(text, MARKER_RE, `${relPath} lacks the marker`);
        assert.match(text, /You are (the|a)/, `${relPath} has no prompt body`);
      }
    } finally {
      await removeTemp(dir);
    }
  }
});

test("each harness render carries its native frontmatter", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode", "claude-code", "copilot", "codex"]);
    const read = (harness, name) =>
      fs.readFile(path.join(dir, HARNESS_PATHS[harness](name)), "utf8");

    assert.match(await read("opencode", "telos-specify"), /mode: subagent/);
    assert.match(await read("opencode", "telos-orchestrator"), /mode: all/);
    assert.match(await read("claude-code", "telos-orchestrator"), /name: telos-orchestrator/);
    assert.match(await read("copilot", "telos-tasks"), /description:/);
    assert.match(await read("codex", "telos-implement"), /name: telos-implement/);

    const copilotOrchestrator = await read("copilot", "telos-orchestrator");
    assert.match(copilotOrchestrator, /Harness note \(VS Code Copilot\)/);
    assert.match(copilotOrchestrator, /single-context/);
    const codexOrchestrator = await read("codex", "telos-orchestrator");
    assert.match(codexOrchestrator, /Harness note \(Codex\)/);
  } finally {
    await removeTemp(dir);
  }
});

test("rendered agents can resolve their required references from the body", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const text = await fs.readFile(
      path.join(dir, ".opencode", "agent", "telos-specify.md"),
      "utf8"
    );
    assert.match(text, /## Required references/);
    assert.match(text, /- \.telos\/references\/pipeline\.md/);
  } finally {
    await removeTemp(dir);
  }
});

test("rendered pipeline v1 carries gates, hard-stops, and traceability", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const read = (name) =>
      fs.readFile(path.join(dir, ".opencode", "agent", name), "utf8");
    const ref = await fs.readFile(
      path.join(dir, ".telos", "references", "pipeline.md"),
      "utf8"
    );

    const orchestrator = await read("telos-orchestrator.md");
    assert.match(orchestrator, /## "start telos"/);
    assert.match(orchestrator, /hard-stop until this flow has run/);
    assert.match(orchestrator, /only `\{feature, phase\}`/);
    assert.match(orchestrator, /identical code path/);
    assert.match(orchestrator, /never approve on the user's behalf/);
    assert.match(orchestrator, /Rewrite `\.telos\/project\/STATE\.md` wholesale/);

    const specify = await read("telos-specify.md");
    assert.match(specify, /Run 'start telos' first — PROJECT\.md does not exist\./);
    assert.match(specify, /not `status: approved`, hard-stop/);
    assert.match(specify, /never renumbered once written/);
    assert.match(specify, /read from `\.telos\/telos\.json`/);
    assert.match(specify, /AGENTS\.md, CLAUDE\.md/);

    const contracts = await read("telos-contracts.md");
    assert.match(contracts, /depends_on: \[spec\]/);
    assert.match(contracts, /Serves: REQ-3/);
    assert.match(contracts, /stub spec never feeds a Contracts phase/);
    assert.match(contracts, /not `status: approved`, hard-stop/);

    assert.match(ref, /never renumbered once/);
    assert.match(ref, /recorded by the phase at gate approval/);
    assert.match(ref, /never\s+hand-edited/);
  } finally {
    await removeTemp(dir);
  }
});

test("rendered planning phases carry sizing, graphs, and local-tracker semantics", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const read = (name) =>
      fs.readFile(path.join(dir, ".opencode", "agent", name), "utf8");
    const ref = await fs.readFile(
      path.join(dir, ".telos", "references", "pipeline.md"),
      "utf8"
    );

    const design = await read("telos-design.md");
    assert.match(design, /depends_on: \[spec,\s*contracts\]/);
    assert.match(design, /not `status: approved`,\s*hard-stop/);
    assert.match(design, /sized to the feature's complexity/);

    const tasks = await read("telos-tasks.md");
    assert.match(tasks, /depends_on: \[design\]/);    assert.match(tasks, /not `status: approved`,\s*hard-stop/);
    assert.match(tasks, /per-task verification plan/);
    assert.match(tasks, /traced to spec REQ IDs/);
    assert.match(tasks, /Create no\s+duplicate issue store anywhere/);
    assert.match(tasks, /issue numbers in the\s+tasks table/);

    assert.match(ref, /\| NN \| slug \| title \| depends_on \| status \| tracker \|/);
    assert.match(ref, /task lifecycle\s*\(`pending \| in-progress \| done`\) rather than the artifact statuses/);
    assert.match(ref, /STATE\.md's task mirror is a generated view of them/);
    assert.match(ref, /`create_task` on approval is a\s+no-op/);
  } finally {
    await removeTemp(dir);
  }
});

test("rendered execution carries ready sets, close-on-verify, and the closing gate", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode", "copilot"]);
    const read = (harness, name) =>
      fs.readFile(path.join(dir, HARNESS_PATHS[harness](name)), "utf8");
    const ref = await fs.readFile(
      path.join(dir, ".telos", "references", "pipeline.md"),
      "utf8"
    );

    const orchestrator = await read("opencode", "telos-orchestrator");
    assert.match(orchestrator, /a task is ready when every task in its\s+`depends_on` is done/);
    assert.match(orchestrator, /fan out parallel Implementation subagents/);
    assert.match(orchestrator, /loading the Implementation prompt by path/);
    assert.match(orchestrator, /nothing to close — the task file\s+is the tracker/);
    assert.match(orchestrator, /closing\s+gate/);
    assert.match(orchestrator, /request changes re-opens the named\s+tasks/);

    const implement = await read("opencode", "telos-implement");
    assert.match(implement, /hard-stop naming the blocking tasks/);
    assert.match(implement, /never re-executed\s+silently/);
    assert.match(implement, /Record the evidence in the task's TASK\.md\s+body/);
    assert.match(implement, /verification plan to completion/);
    assert.match(implement, /tracker's\s+`close_task` op per `\.telos\/tracker\.md`/);

    const copilot = await read("copilot", "telos-orchestrator");
    assert.match(copilot, /Tasks execute sequentially,\s*not in parallel/);

    assert.match(ref, /evidence \(commands run, results observed\)/);
    assert.match(ref, /closes the tracker issue\s+via the tracker's `close_task` op/);
    assert.match(ref, /Feature closing gate/);
  } finally {
    await removeTemp(dir);
  }
});

test("rendered cascade carries hash detection, chains, and re-plan diffing", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const orchestrator = await fs.readFile(
      path.join(dir, ".opencode", "agent", "telos-orchestrator.md"),
      "utf8"
    );
    const ref = await fs.readFile(
      path.join(dir, ".telos", "references", "pipeline.md"),
      "utf8"
    );

    assert.match(orchestrator, /walk every `status: approved` artifact under/);
    assert.match(orchestrator, /PROJECT\.md\/ROADMAP\.md →\s*spec → contracts → design → tasks \(tasks\.md\)/);
    assert.match(orchestrator, /TASK\.md execution ledgers are\s*not hash-checked/);
    assert.match(orchestrator, /a project-file edit stales\s+all existing feature artifacts too/);
    assert.match(orchestrator, /never manually re-invokes a phase/);
    assert.match(orchestrator, /never auto-approved by a\s+cascade/);
    assert.match(orchestrator, /task identity is `NN` \+ `slug`/);
    assert.match(orchestrator, /changed tasks are closed superseded and\s+recreated as new issues/);

    assert.match(ref, /Drafts are never hash-checked/);
    assert.match(ref, /beginning `superseded:`/);
    assert.match(ref, /never silently reused or deleted/);
    assert.match(ref, /`create_task` never updates\s+an existing issue's blocking edges in place/);
    assert.match(ref, /with the discovery report\s+as revision feedback/);
    assert.match(ref, /reconciled by re-plan diffing when tasks\.md is re-approved/);
  } finally {
    await removeTemp(dir);
  }
});

test("github tracker sheet documents the uniform ops as exact gh commands", async () => {
  const dir = await makeTempRepo();
  try {
    await runTelos(["init", "--harness", "opencode", "--tracker", "github"], dir);
    const sheet = await fs.readFile(path.join(dir, ".telos", "tracker.md"), "utf8");

    assert.match(sheet, /## Operations/);
    assert.match(sheet, /\*\*create_task\*\*/);
    assert.match(sheet, /\*\*set_blocked_by\*\*/);
    assert.match(sheet, /\*\*close_task\*\*/);
    assert.match(sheet, /\*\*comment\*\*/);
    assert.match(sheet, /\*\*assign\*\*/);
    assert.match(sheet, /\*\*list_open\(feature\)\*\*/);
    assert.match(sheet, /\*\*fetch_status\*\*/);
    assert.match(sheet, /gh issue create/);
    assert.match(sheet, /Blocked by: #3, #7/);
    assert.match(sheet, /gh label create "telos:<feature>"/);
    assert.match(sheet, /close\s*superseded, create fresh/);
    assert.match(sheet, /generated from `list_open\(feature\)`/);
    assert.match(sheet, /topological\s*dependency order/);
    assert.match(sheet, /issue numbers of the blocking tasks/);
    assert.match(sheet, /mirrors as done when closed/);

    const orchestrator = await fs.readFile(
      path.join(dir, ".opencode", "agent", "telos-orchestrator.md"),
      "utf8"
    );
    assert.match(orchestrator, /use `fetch_status` \/ `list_open\(feature\)`/);
    assert.match(orchestrator, /generated from `list_open\(feature\)` plus the tasks table/);
    assert.match(orchestrator, /`assign` op per `\.telos\/tracker\.md`/);

    const tasksAgent = await fs.readFile(
      path.join(dir, ".opencode", "agent", "telos-tasks.md"),
      "utf8"
    );
    assert.match(tasksAgent, /topological dependency\s*order/);
    assert.match(tasksAgent, /`superseded:` comment via the `comment` op/);
  } finally {
    await removeTemp(dir);
  }
});

test("azure tracker sheet documents the uniform ops as exact az commands", async () => {
  const dir = await makeTempRepo();
  try {
    await runTelos(["init", "--harness", "opencode", "--tracker", "azure"], dir);
    const sheet = await fs.readFile(path.join(dir, ".telos", "tracker.md"), "utf8");

    assert.match(sheet, /## Operations/);
    for (const op of ["create_task", "set_blocked_by", "close_task", "comment", "assign", "list_open\\(feature\\)", "fetch_status"]) {
      assert.match(sheet, new RegExp(`\\*\\*${op}\\*\\*`), op);
    }
    assert.match(sheet, /az boards work-item create/);
    assert.match(sheet, /--relation-type "Predecessor"/);
    assert.match(sheet, /az boards work-item update --id <item-id> --state Done/);
    assert.match(sheet, /--discussion "superseded: <reason>"/);
    assert.match(sheet, /--assigned-to/);
    assert.match(sheet, /az boards query --wiql/);
    assert.match(sheet, /System\.Title\] STARTS WITH 'telos: <feature> '/);
    assert.match(sheet, /System\.State\] NOT IN \('Done', 'Closed'\)/);
    assert.match(sheet, /a work item in state Done mirrors as done/);
    assert.match(sheet, /az devops configure -d organization/);
    assert.match(sheet, /topological\s*dependency order/);
    assert.match(sheet, /Agile\s*template uses `Closed`/);
  } finally {
    await removeTemp(dir);
  }
});

test("codex renders only into .codex/skills, never .agents/skills", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["codex"]);
    await assert.rejects(fs.access(path.join(dir, ".agents")));
    await assert.rejects(fs.access(path.join(dir, "AGENTS.md")));
  } finally {
    await removeTemp(dir);
  }
});

test("init copies the pipeline reference into .telos/references", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const text = await fs.readFile(path.join(dir, ".telos", "references", "pipeline.md"), "utf8");
    assert.match(text, /five phases/);
  } finally {
    await removeTemp(dir);
  }
});

test("update refuses to run on an uninitialized repo", async () => {
  const dir = await makeTempRepo();
  try {
    const result = await runTelos(["update"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /not initialized/);
  } finally {
    await removeTemp(dir);
  }
});

test("update reports a corrupt telos.json as corrupt, not uninitialized", async () => {
  const dir = await makeTempRepo();
  try {
    await fs.mkdir(path.join(dir, ".telos"), { recursive: true });
    await fs.writeFile(path.join(dir, ".telos", "telos.json"), "{ not json");
    const result = await runTelos(["update"], dir);
    assert.notEqual(result.code, 0);
    assert.match(result.err, /not valid JSON/);
  } finally {
    await removeTemp(dir);
  }
});

test("update overwrites marker-carrying files unconditionally", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const target = path.join(dir, ".opencode", "agent", "telos-specify.md");
    await fs.writeFile(target, "<!-- telos:generated v0.0.1 -->\n\nmy hand edit\n");
    const result = await runTelos(["update"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    const text = await fs.readFile(target, "utf8");
    assert.doesNotMatch(text, /my hand edit/);
    assert.match(text, MARKER_RE);
  } finally {
    await removeTemp(dir);
  }
});

test("update warns and skips user-owned files (no marker)", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const target = path.join(dir, ".opencode", "agent", "telos-specify.md");
    const userContent = "---\nname: telos-specify\n---\n\nmy own agent\n";
    await fs.writeFile(target, userContent);

    const marked = path.join(dir, ".opencode", "agent", "telos-design.md");
    await fs.writeFile(marked, `${MARKER}\n\nmutated\n`);

    const result = await runTelos(["update"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.err, /telos-specify\.md/);
    assert.match(result.err, /user-owned/);
    assert.equal(await fs.readFile(target, "utf8"), userContent);
    assert.doesNotMatch(await fs.readFile(marked, "utf8"), /mutated/);
  } finally {
    await removeTemp(dir);
  }
});

test("update migrates telos.json additively and prints the changelog", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const configPath = path.join(dir, ".telos", "telos.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf8"));
    delete config.language;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");

    const result = await runTelos(["update"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /Additive migrations applied/);
    assert.match(result.out, /added missing key "language"/);

    const migrated = JSON.parse(await fs.readFile(configPath, "utf8"));
    assert.equal(migrated.language, "English");
    assert.equal(migrated.tracker, "local");
    assert.deepEqual(migrated.harnesses, ["opencode"]);
    assert.equal(migrated.telos_version, packageVersion);
  } finally {
    await removeTemp(dir);
  }
});

test("update re-renders only the harnesses configured in telos.json", async () => {
  const dir = await makeTempRepo();
  try {
    await init(dir, ["opencode"]);
    const result = await runTelos(["update"], dir);
    assert.equal(result.code, 0, `${result.out}\n${result.err}`);
    assert.match(result.out, /OpenCode/);
    assert.doesNotMatch(result.out, /Claude Code|Copilot|Codex/);
    await assert.rejects(fs.access(path.join(dir, ".claude")));
    await assert.rejects(fs.access(path.join(dir, ".codex")));
    await assert.rejects(fs.access(path.join(dir, ".github")));
  } finally {
    await removeTemp(dir);
  }
});
