#!/usr/bin/env node
import { run } from "../src/cli.js";

run(process.argv.slice(2)).catch((err) => {
  console.error(`telos: ${err.message ?? err}`);
  process.exit(err.exitCode ?? 1);
});
