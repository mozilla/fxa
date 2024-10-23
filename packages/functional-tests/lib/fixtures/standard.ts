/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Browser, Page, test as base, expect, firefox } from '@playwright/test';
import { getFirefoxUserPrefs } from '../../lib/targets/firefoxUserPrefs';
import { create as createPages } from '../../pages';
import { ServerTarget, TargetName, create } from '../targets';
import { BaseTarget } from '../targets/base';
import { TestAccountTracker } from '../testAccountTracker';

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

  syncBrowserPages: async ({ target }, use) => {
    const syncBrowserPages = await newPagesForSync(target);

    await use(syncBrowserPages);

    await syncBrowserPages.browser?.close();
  },

  syncOAuthBrowserPages: async ({ target }, use) => {
    const syncBrowserPages = await newPagesForSync(
      target,
      'oauth_webchannel_v1'
    );

    await use(syncBrowserPages);

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
