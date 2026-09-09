import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function scaffold(cwd, config) {
  const telosDir = path.join(cwd, ".telos");
  await fs.mkdir(path.join(telosDir, "references"), { recursive: true });
  await fs.mkdir(path.join(telosDir, "project"), { recursive: true });
  await fs.mkdir(path.join(telosDir, "features"), { recursive: true });

  await copyReferences(path.join(telosDir, "references"));

  const trackerTemplate = path.join(packageRoot, "src", "templates", `tracker-${config.tracker}.md`);
  await fs.copyFile(trackerTemplate, path.join(telosDir, "tracker.md"));

  await fs.writeFile(path.join(telosDir, "telos.json"), JSON.stringify(config, null, 2) + "\n");

  for (const dir of ["references", "project", "features"]) {
    await keep(path.join(telosDir, dir));
  }
}

async function copyReferences(destDir) {
  let entries;
  try {
    entries = await fs.readdir(path.join(packageRoot, "references"), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isFile()) {
      await fs.copyFile(
        path.join(packageRoot, "references", entry.name),
        path.join(destDir, entry.name)
      );
    }
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
