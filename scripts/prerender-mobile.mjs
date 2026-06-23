#!/usr/bin/env node
/**
 * Prepare a static SPA bundle for Capacitor (Android/iOS) from a TanStack
 * Start build. We:
 *   1. Spawn the Nitro production server (.output/server/index.mjs)
 *   2. Fetch "/" to capture the SSR-rendered HTML shell
 *   3. Copy .output/public/* into dist/client/
 *   4. Save the captured HTML as dist/client/index.html
 *
 * After that, TanStack Router takes over on the client for all routes.
 */
import { spawn } from "node:child_process";
import { cp, mkdir, writeFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT = resolve(ROOT, ".output");
const PUBLIC_DIR = resolve(OUTPUT, "public");
const SERVER_ENTRY = resolve(OUTPUT, "server", "index.mjs");
const DEST = resolve(ROOT, "dist", "client");
const PORT = process.env.PRERENDER_PORT || "3939";

async function waitFor(url, attempts = 40, delayMs = 250) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 404) return;
    } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Server at ${url} did not start in time`);
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) {
    console.error(`Missing ${PUBLIC_DIR}. Run "npm run build" first.`);
    process.exit(1);
  }
  if (!existsSync(SERVER_ENTRY)) {
    console.error(`Missing ${SERVER_ENTRY}. Run "npm run build" first.`);
    process.exit(1);
  }

  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });

  console.log("→ Copying .output/public → dist/client");
  await cp(PUBLIC_DIR, DEST, { recursive: true });

  console.log(`→ Starting Nitro server on port ${PORT}`);
  const proc = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, PORT, HOST: "127.0.0.1", NITRO_PORT: PORT },
    stdio: ["ignore", "inherit", "inherit"],
  });

  let html = "";
  try {
    await waitFor(`http://127.0.0.1:${PORT}/`);
    console.log("→ Fetching SSR HTML for /");
    const res = await fetch(`http://127.0.0.1:${PORT}/`);
    html = await res.text();
  } finally {
    proc.kill("SIGTERM");
  }

  // Strip any hard-coded origin / absolute URLs that point at the dev/preview host.
  html = html.replace(/https?:\/\/[^"'\s/]+\/(?=assets\/|_build\/|icon-|favicon|manifest)/g, "/");

  await writeFile(resolve(DEST, "index.html"), html, "utf8");

  // Also write the same HTML as a SPA fallback so any deep link inside the
  // WebView (e.g. /settings) resolves to the client-side router.
  for (const route of ["settings", "azkar", "favorites", "search", "stats", "tasbeeh", "qibla", "prayer-times"]) {
    const dir = resolve(DEST, route);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, "index.html"), html, "utf8");
  }

  const s = await stat(resolve(DEST, "index.html"));
  console.log(`✓ Wrote dist/client/index.html (${s.size} bytes) + SPA fallbacks`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
