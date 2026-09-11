import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CliError } from "./errors.js";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function scaffold(cwd, config) {
  const telosDir = path.join(cwd, ".telos");
  await fs.mkdir(path.join(telosDir, "references"), { recursive: true });
  await fs.mkdir(path.join(telosDir, "project"), { recursive: true });
  await fs.mkdir(path.join(telosDir, "features"), { recursive: true });

  const copiedReferences = await copyReferences(path.join(telosDir, "references"));
  if (copiedReferences.length === 0) {
    throw new CliError(
      "Telos reference files were not found in the installed package; cannot initialize .telos/references."
    );
  }

  const trackerTemplate = path.join(packageRoot, "src", "templates", `tracker-${config.tracker}.md`);
  await fs.copyFile(trackerTemplate, path.join(telosDir, "tracker.md"));

  await fs.writeFile(path.join(telosDir, "telos.json"), JSON.stringify(config, null, 2) + "\n");

  for (const dir of ["references", "project", "features"]) {
    await keep(path.join(telosDir, dir));
  }
}

async function copyReferences(destDir) {
  return copyReferenceTree(path.join(packageRoot, "references"), destDir, { missingOk: true });
}

async function copyReferenceTree(sourceDir, destDir, options = {}) {
  try {
    await fs.mkdir(destDir, { recursive: true });
    const copied = [];
    for (const entry of await fs.readdir(sourceDir, { withFileTypes: true })) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        const nested = await copyReferenceTree(sourcePath, destPath);
        copied.push(...nested.map((name) => path.join(entry.name, name)));
        continue;
      }
      if (!entry.isFile()) continue;
      await fs.copyFile(sourcePath, destPath);
      copied.push(entry.name);
    }
    return copied;
  } catch (err) {
    if (options.missingOk && err.code === "ENOENT") return [];
    throw err;
  }
}

async function keep(dir) {
  const marker = path.join(dir, ".gitkeep");
  try {
    await fs.access(marker);
  } catch {
    await fs.writeFile(marker, "");
  }
}
