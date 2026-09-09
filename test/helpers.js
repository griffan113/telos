import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const bin = path.join(repoRoot, "bin", "telos.js");

export async function makeTempRepo() {
  return fs.mkdtemp(path.join(os.tmpdir(), "telos-init-"));
}

export async function removeTemp(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

export function runTelos(args, cwd, input) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [bin, ...args], { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => resolve({ code, out, err }));
    child.stdin.end(input ?? "");
  });
}

export async function gitInitWithRemote(dir, url) {
  await run("git", ["init", "-q"], dir);
  await run("git", ["remote", "add", "origin", url], dir);
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}
