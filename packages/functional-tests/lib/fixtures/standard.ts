/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Browser,
  Page,
  TestInfo,
  test as base,
  expect,
  firefox,
} from '@playwright/test';
import { getFirefoxUserPrefs } from '../../lib/targets/firefoxUserPrefs';
import { create as createPages } from '../../pages';
import { ServerTarget, TargetName, create } from '../targets';
import { BaseTarget } from '../targets/base';
import { TestAccountTracker } from '../testAccountTracker';
import { existsSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;

export { Page, expect };
export type POMS = ReturnType<typeof createPages>;
export type TestOptions = {
  pages: POMS;
  syncBrowserPages: POMS;
  syncOAuthBrowserPages: POMS;
  testAccountTracker: TestAccountTracker;
};
export type WorkerOptions = { targetName: TargetName; target: ServerTarget };

export const test = base.extend<TestOptions, WorkerOptions>({
  targetName: ['local', { scope: 'worker', option: true }],

  target: [
    async ({ targetName }, use) => {
      const target = create(targetName);
      await use(target);
    },
    { scope: 'worker', auto: true },
  ],

  pages: async ({ target, page }, use) => {
    const pages = createPages(page, target);
    await use(pages);
  },

  syncBrowserPages: async ({ target }, use, testInfo) => {
    const syncBrowserPages = await newPagesForSync(target);

    await use(syncBrowserPages);

    await handleSyncPagesTraceStop(syncBrowserPages, testInfo);

    await syncBrowserPages.browser?.close();
  },

  syncOAuthBrowserPages: async ({ target }, use, testInfo) => {
    const syncBrowserPages = await newPagesForSync(
      target,
      'oauth_webchannel_v1'
    );

    await use(syncBrowserPages);

    await handleSyncPagesTraceStop(syncBrowserPages, testInfo);

    await syncBrowserPages.browser?.close();
  },

  testAccountTracker: async ({ target }, use) => {
    const testAccountTracker = new TestAccountTracker(target);

    await use(testAccountTracker);

    await testAccountTracker.destroyAllAccounts();
  },

  storageState: async ({ target }, use, testInfo) => {
    // This is to store our session without logging in through the ui
    const localStorageItems = [
      {
        name: '__fxa_storage.experiment.generalizedReactApp',
        value: JSON.stringify({ enrolled: false }),
      },
    ];

    // Temporary fix, only set this flag if the test is not a recovery key promo test
    // Once this is no longer feature flagged, we can update all our test and remove this
    if (!testInfo.titlePath.includes('recovery key promo')) {
      localStorageItems.push({
        name: '__fxa_storage.disable_promo.account-recovery-do-it-later',
        value: 'true',
      });
    }

    await use({
      cookies: [],
      origins: [
        {
          origin: target.contentServerUrl,
          localStorage: localStorageItems,
        },
      ],
    });
  },
});

export async function newPages(browser: Browser, target: BaseTarget) {
  const context = await browser.newContext();
  const page = await context.newPage();
  return createPages(page, target);
}

// When running tests that utilize Sync (sign-in/out), we need to run them in a
// completely different browser, otherwise we will get timeout issues.
// The main cause of this is that Sync sets a property
// `identity.fxaccounts.lastSignedInUserHash` to the last
// user signed in. On subsequent login to Sync, a dialog is prompted for the user
// to confirm. Playwright does not have functionality to click browser ui.
async function newPagesForSync(
  target: BaseTarget,
  context: 'fx_desktop_v3' | 'oauth_webchannel_v1' = 'fx_desktop_v3'
) {
  const browser = await firefox.launch({
    args: DEBUG ? ['-start-debugger-server'] : undefined,
    firefoxUserPrefs: getFirefoxUserPrefs(target.name, DEBUG, context),
    headless: !DEBUG,
  });
  return {
    ...(await newPages(browser, target)),
    browser: browser,
  };
}
type SyncPages = Awaited<ReturnType<typeof newPagesForSync>>;

/**
 * Handles stopping and capturing the trace for Sync pages.
 * This is only done if the test has failed, retried, and failed again.
 * @param syncBrowserPages The Sync browser pages object to stop tracing on.
 * @param testInfo Standard Playwright TestInfo object.
 */
async function handleSyncPagesTraceStop(
  syncBrowserPages: SyncPages,
  testInfo: TestInfo
) {
  const { retry, status } = testInfo;
  const allowedTraceStatuses = ['failed', 'timedOut'];

  // only capture trace IF
  // - we are not in debug mode (trace is disabled in debug)
  // - AND the test failed or timedOut
  if (!DEBUG && status && allowedTraceStatuses.includes(status)) {
    await syncBrowserPages.browser.contexts()[0].tracing.stop({
      path: getTracePath(testInfo, retry),
    });
  }
}

/**
 * Gets the absolute path to the trace directory using the test title.
 * @returns {string} The absolute path to the trace directory.
 * @throws {Error} If the root package.json file cannot be found.
 */
function getTracePath(testInfo: TestInfo, retry?: number): string {
  const rootDir = findRootPackageJson();

  // strip the .spec.ts from the test title for readability
  const titlePath = testInfo.titlePath.map((title, index) =>
    index === 0 ? title.replace(/\.spec\.ts$/, '') : title
  );
  const sanitizedTitle = titlePath
    .join(' ')
    .replace(/[^a-z0-9_\-.]/gi, '_') // Replace non-safe chars with _
    .replace(/_+/g, '-') // Collapse multiple underscores
    .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores)

  const maxTitleLength = 70;
  const truncatedTitle =
    sanitizedTitle.length > maxTitleLength
      ? `${sanitizedTitle.slice(0, 35)}---${sanitizedTitle.slice(-35)}`
      : sanitizedTitle;

  const tracePath = join(
    rootDir,
    'artifacts',
    'functional',
    truncatedTitle,
    `syncTrace${retry ? `-${retry}` : ''}.zip`
  );

  return tracePath;
}

/**
 * This walks up the directory looking for a package.json
 * with `"name": "fxa"` in it. This is used to find the root of the project
 * so that we can build the correct path to the `artifacts` directory regardless
 * of running the tests locally or in CI.
 * @param startDir
 * @returns
 */
function findRootPackageJson(startDir: string = __dirname): string {
  const packageJsonPath = join(startDir, 'package.json');

  if (existsSync(packageJsonPath) && isRootPackageJson(packageJsonPath)) {
    return startDir;
  }

  const parentDir = dirname(startDir);

  if (parentDir === startDir) {
    // Reached the root of the filesystem
    throw new Error('Could not find root package.json');
  }

  return findRootPackageJson(parentDir);
}

/**
 * Checks if the given file path contains a package.json file
 * and the package.json has a name of "fxa".
 * @param filePath
 * @returns {boolean} True if the file is a package.json with name "fxa", false otherwise.
 */
function isRootPackageJson(filePath: string): boolean {
  if (basename(filePath) !== 'package.json') {
    return false;
  }

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContent);
    return json.name === 'fxa';
  } catch {
    return false;
  }
}
