/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Browser, Page, test as base, expect, firefox } from '@playwright/test';
import { getFirefoxUserPrefs } from '../../lib/targets/firefoxUserPrefs';
import { create as createPages } from '../../pages';
import { ServerTarget, TargetName, create } from '../targets';
import { BaseTarget } from '../targets/base';
import { TestAccountTracker } from '../testAccountTracker';
import { PasskeyPage } from '../../pages/passkey';
import { GleanEventsHelper } from '../glean';
import { addWafBypassHeader } from '../waf';

export { addWafBypassHeader };

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
  apiAccountTracker: TestAccountTracker;
  gleanEventsHelper: GleanEventsHelper;
};
export type WorkerOptions = { targetName: TargetName; target: ServerTarget };

export const test = base.extend<TestOptions, WorkerOptions>({
  targetName: ['local', { scope: 'worker', option: true }],

  target: [
    async ({ targetName }, use) => {
      const target = create(targetName);
      await target.clearRateLimits();
      await use(target);
    },
    { scope: 'worker', auto: true },
  ],

  page: async ({ page, target }, use) => {
    await addWafBypassHeader(page, target);
    await use(page);
  },

  pages: async ({ target, page }, use) => {
    const pages = createPages(page, target);
    await use(pages);
    // Cleanup passkey CDP sessions from any page that used them
    for (const pageInstance of Object.values(pages)) {
      if (pageInstance instanceof PasskeyPage) {
        await pageInstance.cleanupPasskeys();
      }
    }
  },

  syncBrowserPages: async ({ target }, use) => {
    const syncBrowserPages = await newPagesForSync(target);

    await use(syncBrowserPages);

    await closeSyncBrowser(syncBrowserPages);
  },

  syncOAuthBrowserPages: async ({ target }, use) => {
    const syncBrowserPages = await newPagesForSync(
      target,
      'oauth_webchannel_v1'
    );

    await use(syncBrowserPages);

    await closeSyncBrowser(syncBrowserPages);
  },

  // Same tracking and teardown as `testAccountTracker`, without the `context`
  // dependency that would launch a browser for an API-only spec.
  apiAccountTracker: async ({ target }, use, testInfo) => {
    const apiAccountTracker = new TestAccountTracker(target, testInfo);

    await use(apiAccountTracker);

    await target.clearRateLimits();
    await apiAccountTracker.destroyAllAccounts();
  },

  testAccountTracker: async ({ target, context }, use, testInfo) => {
    const testAccountTracker = new TestAccountTracker(
      target,
      testInfo,
      context
    );

    await use(testAccountTracker);

    await target.clearRateLimits();
    await testAccountTracker.destroyAllAccounts();
  },

  gleanEventsHelper: async ({ page }, use) => {
    const helper = new GleanEventsHelper(page);
    await helper.start();
    await use(helper);
    await helper.stop();
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
  await addWafBypassHeader(page, target);
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

// browser.close() skips Playwright's trace capture, but context.close() saves
// the context's trace into the test's trace.zip.
async function closeSyncBrowser(syncBrowserPages: SyncPages) {
  await syncBrowserPages.page.context().close();
  await syncBrowserPages.browser.close();
}
