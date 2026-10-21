/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import {
  gotoSyncSession,
  requestBrowserSignedInUser,
} from '../../lib/sync-helpers';
import { BaseTarget } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';

const VAPID_EMAIL = /^vapid-[a-f0-9]{32}@restmail\.net$/;
const VAPID_PASSWORD = /^vapid-[a-f0-9]{32}$/;

async function createVapidAccount(
  target: BaseTarget,
  testAccountTracker: TestAccountTracker
) {
  const { email, password } = testAccountTracker.generateVapidAccountDetails();
  expect(email).toMatch(VAPID_EMAIL);
  expect(password).toMatch(VAPID_PASSWORD);
  const credentials = await target.authClient.signUp(
    email,
    password,
    { keys: true, service: 'sync' },
    target.ciHeader
  );
  return { email, password, ...credentials };
}

function sendFxaLogin(
  page: Page,
  data: {
    email: string;
    uid: string;
    sessionToken: string;
    keyFetchToken?: string;
    unwrapBKey?: string;
  }
) {
  return page.evaluate(
    ({ command, data }) => {
      window.dispatchEvent(
        new CustomEvent('WebChannelMessageToChrome', {
          detail: JSON.stringify({
            id: 'account_updates',
            message: {
              command,
              data: {
                ...data,
                verified: true,
                services: { sync: { offeredEngines: [], declinedEngines: [] } },
              },
              messageId: `${Date.now()}`,
            },
          }),
        })
      );
    },
    { command: FirefoxCommand.Login, data }
  );
}

test.describe('vapid account', () => {
  test.beforeEach(({}, { project }) => {
    // The auth server only pre-verifies vapid accounts with
    // `vapidAccounts.enabled`, which is set in config/dev.json.
    test.skip(project.name !== 'local');
  });

  test('creates a verified session without a confirmation code', async ({
    target,
    testAccountTracker,
  }) => {
    const { sessionToken, verificationMethod } = await createVapidAccount(
      target,
      testAccountTracker
    );

    expect(verificationMethod).toBeUndefined();
    const status = await target.authClient.sessionStatus(
      sessionToken,
      target.ciHeader
    );
    expect(status.state).toBe('verified');
    expect(status.details.accountEmailVerified).toBe(true);
    expect(status.details.sessionVerified).toBe(true);
  });

  test('signs the account into Firefox over the web channel', async ({
    target,
    testAccountTracker,
    syncBrowserPages: { page },
  }) => {
    const { email, uid, sessionToken, keyFetchToken, unwrapBKey } =
      await createVapidAccount(target, testAccountTracker);

    await gotoSyncSession(page, target);
    await sendFxaLogin(page, {
      email,
      uid,
      sessionToken,
      keyFetchToken,
      unwrapBKey,
    });

    await expect
      .poll(() => requestBrowserSignedInUser(page))
      .toEqual({ email, uid, sessionToken, verified: true });
  });

  test('signs in again without a confirmation code', async ({
    target,
    testAccountTracker,
  }) => {
    const { email, password } = await createVapidAccount(
      target,
      testAccountTracker
    );

    const signin = await target.authClient.signIn(
      email,
      password,
      { keys: true, service: 'sync' },
      target.ciHeader
    );

    expect(signin.emailVerified).toBe(true);
    expect(signin.sessionVerified).toBe(true);
    expect(signin.verificationMethod).toBeUndefined();
  });
});
