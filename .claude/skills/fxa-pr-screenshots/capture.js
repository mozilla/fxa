#!/usr/bin/env node
// Reads a JSON array of { id, url, outPath } from stdin, captures one PNG per
// target via headless Firefox. Used by the fxa-pr-screenshots skill — see
// SKILL.md in the same folder.
//
// Usage:
//   node capture.js <<'EOF'
//   [{"id":"...","url":"...","outPath":"..."}, ...]
//   EOF
//
// Exit codes: 0 = all captured, 1 = one or more failures, 2 = bad input.

const { firefox } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 30_000;
const RENDER_TIMEOUT_MS = 15_000;
// Small settle delay after the story root has content — Storybook can paint
// layout before fonts/icons finish loading, which produced flickery captures
// during skill development.
const SETTLE_MS = 300;

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function captureOne(browser, { id, url, outPath }) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT_MS });
    // 'networkidle' never settles on the Storybook dev server (HMR keeps
    // long-lived connections open), so we wait on the story DOM instead.
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#storybook-root');
        if (!root || root.children.length === 0) return false;
        // storybook-email injects "Loading email..." synchronously, then
        // replaces it after MJML render; without this guard the screenshot
        // can be of the loading state, not the rendered template.
        if (root.textContent.includes('Loading email...')) return false;
        return true;
      },
      { timeout: RENDER_TIMEOUT_MS }
    );
    await page.waitForTimeout(SETTLE_MS);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`ok ${id} -> ${outPath}`);
    return true;
  } catch (err) {
    console.error(`fail ${id}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

(async () => {
  const raw = await readStdin();
  if (!raw.trim()) {
    console.error('capture: no targets on stdin');
    process.exit(2);
  }
  let targets;
  try {
    targets = JSON.parse(raw);
  } catch (err) {
    console.error(`capture: invalid JSON on stdin — ${err.message}`);
    process.exit(2);
  }
  if (!Array.isArray(targets) || targets.length === 0) {
    console.error('capture: targets must be a non-empty JSON array');
    process.exit(2);
  }

  const browser = await firefox.launch({ headless: true });
  let failures = 0;
  try {
    for (const target of targets) {
      const ok = await captureOne(browser, target);
      if (!ok) failures++;
    }
  } finally {
    await browser.close();
  }
  process.exit(failures > 0 ? 1 : 0);
})();
