/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Two real Firefox profiles, A and B, signed in to Sync on one account. Unlike
 * the other syncV3 specs, nothing here mocks the browser: device registration,
 * Send Tab and the session checks run Firefox's own FxA code.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import {
  changePasswordInSettings,
  checkAccountStatus,
  disconnectDeviceInSettings,
  getConnectedServiceNames,
  getDeviceList,
  getLocalDeviceId,
  getOpenTabUrls,
  hasLocalSession,
  hasSyncKeys,
  receiveTabs,
  sendTab,
  signInToSync,
} from '../../lib/firefox-device-helpers';
import { pollUntil } from '../../lib/pairing-helpers';

const DEVICE_A = 'Functional Test Firefox A';
const DEVICE_B = 'Functional Test Firefox B';

// Two Firefox launches and two full sign-ins per test.
test.setTimeout(180_000);

// Disconnects devices and changes passwords, so keep it off stage and production.
test.skip(({ target }) => target.name !== 'local');

async function signInBoth(
  a: MarionetteClient,
  b: MarionetteClient,
  credentials: { email: string; password: string }
) {
  await test.step('Sign in Firefox A and Firefox B to Sync', async () => {
    await signInToSync(a, { ...credentials, deviceName: DEVICE_A });
    await signInToSync(b, { ...credentials, deviceName: DEVICE_B });
  });
}

function waitForDeviceGone(
  client: MarionetteClient,
  deviceId: string
): Promise<true> {
  return pollUntil(
    async () =>
      (await getDeviceList(client)).every((d) => d.id !== deviceId) ||
      undefined,
    30_000,
    `Device ${deviceId} is still in the device list`
  );
}

test.describe('severity-2', () => {
  test.describe('Firefox desktop devices', () => {
    test('both profiles register as Send Tab devices and show in Connected services', async ({
      target,
      testAccountTracker,
      marionetteAuthority: { client: a },
      marionetteSupplicant: { client: b },
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInBoth(a, b, credentials);

      await test.step('A sees both devices, with B as a Send Tab target', async () => {
        const bId = await getLocalDeviceId(b);
        const devices = await getDeviceList(a);
        expect(devices).toContainEqual(
          expect.objectContaining({
            name: DEVICE_A,
            type: 'desktop',
            isCurrentDevice: true,
            sendTabCompatible: true,
          })
        );
        expect(devices).toContainEqual(
          expect.objectContaining({
            id: bId,
            name: DEVICE_B,
            type: 'desktop',
            isCurrentDevice: false,
            sendTabCompatible: true,
          })
        );
      });

      await test.step('Settings on A lists both devices', async () => {
        const names = await getConnectedServiceNames(
          a,
          target.contentServerUrl
        );
        expect(names).toEqual(expect.arrayContaining([DEVICE_A, DEVICE_B]));
      });
    });

    test('Send Tab from A opens the tab on B', async ({
      testAccountTracker,
      marionetteAuthority: { client: a },
      marionetteSupplicant: { client: b },
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInBoth(a, b, credentials);
      const tab = {
        url: 'https://example.com/fxa-send-tab',
        title: 'Sent tab',
      };

      await test.step('A sends the tab to B', async () => {
        const result = await sendTab(a, await getLocalDeviceId(b), tab);
        expect(result).toEqual({ succeeded: 1, failed: [] });
      });

      await test.step('B receives and opens the tab', async () => {
        expect(await receiveTabs(b)).toEqual([
          { uri: tab.url, title: tab.title, sender: DEVICE_A },
        ]);
        await expect.poll(() => getOpenTabUrls(b)).toContain(tab.url);
      });
    });

    test('disconnect B from Settings on A signs B out', async ({
      target,
      testAccountTracker,
      marionetteAuthority: { client: a },
      marionetteSupplicant: { client: b },
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInBoth(a, b, credentials);
      const bId = await getLocalDeviceId(b);

      await test.step('A disconnects B in Connected services', async () => {
        await disconnectDeviceInSettings(a, target.contentServerUrl, DEVICE_B);
      });

      await test.step('B is gone from the device list and loses its session', async () => {
        await waitForDeviceGone(a, bId);
        expect(await checkAccountStatus(b)).toBe(false);
        expect(await hasLocalSession(b)).toBe(false);
      });

      await test.step('A stays signed in', async () => {
        expect(await checkAccountStatus(a)).toBe(true);
      });
    });

    test('password change on A keeps A signed in and signs B out', async ({
      target,
      testAccountTracker,
      marionetteAuthority: { client: a },
      marionetteSupplicant: { client: b },
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInBoth(a, b, credentials);
      const newPassword = testAccountTracker.generatePassword();

      await test.step('A changes the password in Settings', async () => {
        await changePasswordInSettings(a, target.contentServerUrl, {
          oldPassword: credentials.password,
          newPassword,
          getMfaCode: () =>
            target.emailClient.getVerifyAccountChangeCode(credentials.email),
        });
        credentials.password = newPassword;
      });

      await test.step('A takes the new session and keeps its Sync keys', async () => {
        expect(await checkAccountStatus(a)).toBe(true);
        expect(await hasSyncKeys(a)).toBe(true);
      });

      await test.step('B loses its session', async () => {
        expect(await checkAccountStatus(b)).toBe(false);
        expect(await hasLocalSession(b)).toBe(false);
      });
    });
  });
});
