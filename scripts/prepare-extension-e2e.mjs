#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..");
export const DIST_EXTENSION = path.join(REPO_ROOT, "dist-extension");
export const EXTENSION_E2E_DIR = path.join(REPO_ROOT, ".tmp", "extension-e2e");
const HOOK_SRC = path.join(REPO_ROOT, "tests", "extension-e2e", "e2e-cors-hook.js");
const HOOK_NAME = "e2e-cors-hook.js";

export function prepareExtensionE2e() {
  if (!fs.existsSync(path.join(DIST_EXTENSION, "manifest.json"))) {
    throw new Error(
      `Missing ${DIST_EXTENSION}. Build it first with: npm run build-extension`,
    );
  }
  if (!fs.existsSync(HOOK_SRC)) {
    throw new Error(`Missing CORS e2e hook at ${HOOK_SRC}`);
  }

  fs.mkdirSync(path.dirname(EXTENSION_E2E_DIR), { recursive: true });
  fs.rmSync(EXTENSION_E2E_DIR, { recursive: true, force: true });
  fs.cpSync(DIST_EXTENSION, EXTENSION_E2E_DIR, { recursive: true });
  fs.copyFileSync(HOOK_SRC, path.join(EXTENSION_E2E_DIR, HOOK_NAME));

  const manifestPath = path.join(EXTENSION_E2E_DIR, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.content_scripts = manifest.content_scripts || [];
  manifest.content_scripts.unshift({
    matches: ["http://player.dirplayer.test/*"],
    js: [HOOK_NAME],
    run_at: "document_start",
    all_frames: false,
  });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return EXTENSION_E2E_DIR;
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dest = prepareExtensionE2e();
  console.log(`Prepared extension e2e overlay at ${dest}`);
}
