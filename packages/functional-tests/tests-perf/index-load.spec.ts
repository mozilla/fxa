/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/standard';
import { median, usedBytes } from './metrics';

// Chrome DevTools "Slow 4G" preset.
const SLOW_4G = {
  offline: false,
  latency: 562.5,
  downloadThroughput: (1.44 * 1024 * 1024) / 8,
  uploadThroughput: (675 * 1024) / 8,
};

const recordFormAndLcp = () => {
  (window as any).__lcp = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) (window as any).__lcp = e.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new MutationObserver((_, obs) => {
    if (document.querySelector('input[name=email]')) {
      (window as any).__form = performance.now();
      obs.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
};

// Checked at load time, so a bad value fails before the browser opens.
const runs = Number(process.env.PERF_RUNS || '5');
if (!Number.isInteger(runs) || runs < 1) {
  throw new Error(
    `PERF_RUNS must be a positive integer, got "${process.env.PERF_RUNS}"`
  );
}

test('Index page-load metrics', async ({ browser, target }) => {
  test.setTimeout(600_000);
  const throttled = process.env.PERF_THROTTLE !== '0';
  const url = `${target.contentServerUrl}/`;

  const form: number[] = [];
  const lcp: number[] = [];
  const jsBytes: number[] = [];
  for (let i = 0; i < runs; i++) {
    // A new context per run gives a cold cache.
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(recordFormAndLcp);
    if (throttled) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await page.goto(url);
    await page.waitForFunction(() => (window as any).__form);
    // Let LCP settle after the form shows.
    await page.waitForTimeout(1500);
    form.push(await page.evaluate(() => (window as any).__form));
    lcp.push(await page.evaluate(() => (window as any).__lcp));
    jsBytes.push(
      await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((e: any) => e.name.endsWith('.js'))
          .reduce((a, e: any) => a + e.transferSize, 0)
      )
    );
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(recordFormAndLcp);
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.goto(url);
  await page.waitForFunction(() => (window as any).__form);
  await page.waitForTimeout(1000);
  const coverage = (await page.coverage.stopJSCoverage()).filter(
    (e): e is typeof e & { source: string } =>
      e.url.includes('/static/js/') && !!e.source
  );
  await context.close();
  let total = 0;
  let used = 0;
  for (const e of coverage) {
    total += e.source.length;
    used += usedBytes(e.source, e.functions);
  }
  // A wrong URL filter fails here instead of printing NaN.
  expect(coverage.length).toBeGreaterThan(0);

  console.log(
    JSON.stringify({
      route: '/',
      runs,
      throttled,
      formMs: median(form),
      lcpMs: median(lcp),
      jsKB: median(jsBytes.map((b) => b / 1024)),
      unusedJsPct: Math.round((100 * (total - used)) / total),
    })
  );
});
