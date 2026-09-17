#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIST_EXTENSION } from "./prepare-extension-e2e.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const IS_WIN = process.platform === "win32";

if (!fs.existsSync(path.join(DIST_EXTENSION, "manifest.json"))) {
  console.error("Missing dist-extension. Build it first with: npm run build-extension");
  process.exit(1);
}

const forwardArgs = process.argv.slice(2);
const pw = spawnSync(
  "npx",
  ["playwright", "test", "-c", "playwright.extension.config.ts", ...forwardArgs],
  {
    cwd: REPO_ROOT,
    stdio: "inherit",
    shell: IS_WIN,
    env: process.env,
  },
);
process.exit(pw.status ?? 1);
