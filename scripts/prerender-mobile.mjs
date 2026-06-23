#!/usr/bin/env node
/**
 * Prepare a static SPA shell for Capacitor (Android/iOS) from a TanStack Start
 * Vite build. The Vite build produces `dist/client/` (static assets) and
 * `dist/server/` (a Cloudflare Worker module — not runnable under Node), so we
 * cannot spawn the production server inside the WebView.
 *
 * Instead we:
 *   1. Read the TanStack Start manifest from `dist/server/` to discover the
 *      client entry and root preloads (hashed per build).
 *   2. Find the built CSS bundle in `dist/client/assets/`.
 *   3. Write a minimal RTL HTML shell at `dist/client/index.html` that boots
 *      the SPA — the TanStack Router takes over on the client for every route.
 *   4. Duplicate that shell under `dist/client/<route>/index.html` so deep
 *      links resolve inside the WebView.
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CLIENT = resolve(ROOT, "dist", "client");
const SERVER = resolve(ROOT, "dist", "server");

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function findManifestFile(dir) {
  const files = await walk(dir);
  return files.find((f) => /_tanstack-start-manifest_v-[^/]+\.(mjs|js)$/.test(f));
}

async function main() {
  if (!existsSync(CLIENT) || !existsSync(SERVER)) {
    console.error(`Missing dist/client or dist/server. Run "bun run build" first.`);
    process.exit(1);
  }

  // 1. Find the TanStack Start manifest. Its location/extension varies
  // depending on whether the nitro post-build step ran (`.mjs` in
  // `dist/server/`) or only the plain Vite SSR build (`.js` under
  // `dist/server/assets/`). Walk recursively to handle both.
  const manifestPath = await findManifestFile(SERVER);
  if (!manifestPath) {
    console.error("Could not find TanStack Start manifest under dist/server/.");
    process.exit(1);
  }
  console.log(`  manifest: ${relative(ROOT, manifestPath)}`);
  const manifestSrc = await readFile(manifestPath, "utf8");

  // Extract clientEntry and the root route's preload list. We parse via regex
  // to avoid importing the module (it has runtime-only deps).
  const clientEntryMatch = manifestSrc.match(/clientEntry:\s*"([^"]+)"/);
  if (!clientEntryMatch) {
    console.error("Could not parse clientEntry from manifest.");
    process.exit(1);
  }
  const clientEntry = clientEntryMatch[1];

  const rootMatch = manifestSrc.match(/__root__:\s*\{[^}]*?preloads:\s*\[([^\]]*)\]/);
  const rootPreloads = rootMatch
    ? Array.from(rootMatch[1].matchAll(/"([^"]+)"/g)).map((m) => m[1])
    : [];

  // 2. Find the main CSS bundle (filename starts with "styles-" by Vite default).
  const assetsDir = resolve(CLIENT, "assets");
  let cssHref = null;
  if (existsSync(assetsDir)) {
    const assetFiles = await readdir(assetsDir);
    const cssName =
      assetFiles.find((n) => n.startsWith("styles-") && n.endsWith(".css")) ||
      assetFiles.find((n) => n.endsWith(".css"));
    if (cssName) cssHref = `/assets/${cssName}`;
  }


  // 3. Build the SPA HTML shell.
  const preloadTags = [clientEntry, ...rootPreloads]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((href) => `    <link rel="modulepreload" href="${href}" />`)
    .join("\n");

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0c4a6e" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="format-detection" content="telephone=no" />
    <title>رفيق أذكار — Rafeeq Azkar</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
${cssHref ? `    <link rel="stylesheet" href="${cssHref}" />\n` : ""}${preloadTags}
    <script type="module" src="${clientEntry}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  await writeFile(resolve(CLIENT, "index.html"), html, "utf8");

  // 4. SPA fallbacks for deep links inside the WebView.
  const routes = [
    "settings", "azkar", "favorites", "search", "stats", "tasbeeh",
    "qibla", "prayer-times", "audio", "focus", "goals", "mood", "tree",
  ];
  for (const route of routes) {
    const dir = resolve(CLIENT, route);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, "index.html"), html, "utf8");
  }

  const s = await stat(resolve(CLIENT, "index.html"));
  console.log(`✓ Wrote dist/client/index.html (${s.size} bytes)`);
  console.log(`  clientEntry: ${clientEntry}`);
  console.log(`  rootPreloads: ${rootPreloads.length}`);
  console.log(`  css: ${cssHref ?? "(none)"}`);
  console.log(`  SPA fallbacks: ${routes.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
