/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helpers that drive the FxA code inside a real, Marionette-controlled
 * Firefox: Sync sign-in, device registration, Send Tab and session checks.
 *
 * Inline scripts MUST be ASCII only (see the warning in pairing-helpers.ts).
 */

import { MarionetteClient } from './marionette';
import { SELECTORS, TIMEOUTS } from './pairing-constants';
import {
  findElementBySelectors,
  pollUntil,
  setInputValueByScript,
  waitForUrlChange,
} from './pairing-helpers';

export type FirefoxDevice = {
  id: string;
  name: string;
  type: string;
  isCurrentDevice: boolean;
  sendTabCompatible: boolean;
};

export type ReceivedTab = { uri: string; title: string; sender: string | null };

const SEND_TAB_TIMEOUT = 30_000;

/**
 * Run `body` in chrome with `fxa` (the FxAccounts singleton) and `args` in
 * scope. `body` returns a JSON-serializable value; a thrown error rejects.
 */
async function runWithFxAccounts<T>(
  client: MarionetteClient,
  body: string,
  args: unknown[] = [],
  timeoutMs: number = TIMEOUTS.ASYNC_SCRIPT
): Promise<T> {
  await client.setContext('chrome');
  const raw = await client.executeAsyncScript(
    `
    const resolve = arguments[arguments.length - 1];
    const args = Array.prototype.slice.call(arguments, 0, -1);
    (async () => {
      const { getFxAccountsSingleton } = ChromeUtils.importESModule(
        "resource://gre/modules/FxAccounts.sys.mjs"
      );
      const fxa = getFxAccountsSingleton();
      ${body}
    })().then(
      value => resolve(JSON.stringify({ value })),
      // FxA client errors are plain objects, which String() hides.
      e => resolve(JSON.stringify({
        error: String(e) === "[object Object]" ? JSON.stringify(e) : String(e),
      }))
    );
    `,
    { sandbox: 'system', args, timeoutMs }
  );
  const result = JSON.parse(raw as string);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.value as T;
}

/**
 * Sign in to Sync the way the Firefox menu does, and wait until Firefox holds
 * the Sync keys. `/pair` sign-in never sends `oauth_login`, so it gets no keys.
 */
export async function signInToSync(
  client: MarionetteClient,
  opts: { email: string; password: string; deviceName: string }
): Promise<void> {
  await client.setContext('chrome');
  const connectUrl = (await client.executeAsyncScript(
    `
    const [resolve] = arguments;
    const { FxAccountsConfig } = ChromeUtils.importESModule(
      "resource://gre/modules/FxAccountsConfig.sys.mjs"
    );
    FxAccountsConfig.promiseConnectAccountURI("fxa-functional-test").then(resolve);
    `,
    { sandbox: 'system', timeoutMs: TIMEOUTS.ASYNC_SCRIPT }
  )) as string;

  await client.setContext('content');
  await client.navigate(connectUrl);
  await setInputValueByScript(client, SELECTORS.EMAIL_INPUT, opts.email);
  await client.clickElement(
    await findElementBySelectors(client, SELECTORS.SUBMIT_BUTTON)
  );
  await setInputValueByScript(client, SELECTORS.PASSWORD_INPUT, opts.password);
  const passwordUrl = await client.getUrl();
  await client.clickElement(
    await findElementBySelectors(client, SELECTORS.SUBMIT_BUTTON)
  );
  await waitForUrlChange(client, passwordUrl);

  // The inline recovery key prompt holds back the keys until it is dismissed.
  await pollUntil(
    async () => {
      await client.setContext('content');
      await client.executeScript(`
        const later = document.querySelector(
          '[data-glean-id="inline_recovery_key_setup_create_do_it_later"]'
        );
        if (later) later.click();
      `);
      return (await hasSyncKeys(client)) || undefined;
    },
    TIMEOUTS.AUTHORITY_COMPLETE,
    'Firefox did not receive the Sync keys'
  );

  // Settings groups rows by name, so each profile needs a distinct one. Set
  // after sign-in, which resets the account prefs.
  await runWithFxAccounts(
    client,
    `
    Services.prefs.setStringPref("identity.fxaccounts.account.device.name", args[0]);
    await fxa.device.updateDeviceRegistration();
    `,
    [opts.deviceName]
  );
}

export function hasSyncKeys(client: MarionetteClient): Promise<boolean> {
  return runWithFxAccounts(
    client,
    `return await fxa.keys.canGetKeyForScope(
      "https://identity.mozilla.com/apps/oldsync"
    );`
  );
}

export function getLocalDeviceId(client: MarionetteClient): Promise<string> {
  return runWithFxAccounts(client, `return await fxa.device.getLocalId();`);
}

/** The account's device list, fetched from the auth server. */
export function getDeviceList(
  client: MarionetteClient
): Promise<FirefoxDevice[]> {
  return runWithFxAccounts(
    client,
    `
    await fxa.device.refreshDeviceList({ ignoreCached: true });
    return fxa.device.recentDeviceList.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      isCurrentDevice: d.isCurrentDevice,
      sendTabCompatible: !!fxa.commands.sendTab.isDeviceCompatible(d),
    }));
    `
  );
}

/** Send a tab through Firefox's own Send Tab code, as the tab menu does. */
export function sendTab(
  client: MarionetteClient,
  targetDeviceId: string,
  tab: { url: string; title: string }
): Promise<{ succeeded: number; failed: string[] }> {
  return runWithFxAccounts(
    client,
    `
    const [targetId, tab] = args;
    await fxa.device.refreshDeviceList({ ignoreCached: true });
    const target = fxa.device.recentDeviceList.find(d => d.id == targetId);
    if (!target) throw new Error("no device " + targetId);
    const result = await fxa.commands.sendTab.send([target], tab);
    return {
      succeeded: result.succeeded.length,
      failed: result.failed.map(f => String(f.error)),
    };
    `,
    [targetDeviceId, tab],
    SEND_TAB_TIMEOUT
  );
}

/**
 * Fetch pending device commands and return the tabs that Firefox opened.
 * Firefox normally polls on a push message; there is no push service in the
 * test stacks, so this polls directly.
 */
export function receiveTabs(client: MarionetteClient): Promise<ReceivedTab[]> {
  return runWithFxAccounts(
    client,
    `
    const received = [];
    const observer = {
      observe(subject) {
        const tabs = subject.wrappedJSObject
          ? subject.wrappedJSObject.object
          : subject;
        for (const t of tabs) {
          received.push({
            uri: t.uri,
            title: t.title,
            sender: t.sender ? t.sender.name : null,
          });
        }
      },
    };
    Services.obs.addObserver(observer, "fxaccounts:commands:open-uri");
    try {
      await fxa.commands.pollDeviceCommands();
    } finally {
      Services.obs.removeObserver(observer, "fxaccounts:commands:open-uri");
    }
    return received;
    `,
    [],
    SEND_TAB_TIMEOUT
  );
}

export async function getOpenTabUrls(
  client: MarionetteClient
): Promise<string[]> {
  await client.setContext('chrome');
  return (await client.executeScript(
    `return Services.wm.getMostRecentWindow("navigator:browser")
      .gBrowser.tabs.map(t => t.linkedBrowser.currentURI.spec);`,
    { sandbox: 'system' }
  )) as string[];
}

/**
 * Ask the auth server whether this Firefox's session is still valid. On a
 * rejected session, Firefox drops its credentials and asks the user to
 * sign in again.
 */
export function checkAccountStatus(client: MarionetteClient): Promise<boolean> {
  return runWithFxAccounts(client, `return await fxa.checkAccountStatus();`);
}

export function hasLocalSession(client: MarionetteClient): Promise<boolean> {
  return runWithFxAccounts(client, `return await fxa.hasLocalSession();`);
}

export async function getConnectedServiceNames(
  client: MarionetteClient,
  contentServerUrl: string
): Promise<string[]> {
  await client.setContext('content');
  await client.navigate(`${contentServerUrl}/settings#connected-services`);
  await findElementBySelectors(client, [
    '[data-testid="settings-connected-service"]',
  ]);
  return (await client.executeScript(`
    return Array.from(
      document.querySelectorAll('[data-testid="settings-connected-service"]')
    ).map(row => row.getAttribute('data-name'));
  `)) as string[];
}

/** Sign a device out from Settings > Connected services, then wait for its row to go. */
export async function disconnectDeviceInSettings(
  client: MarionetteClient,
  contentServerUrl: string,
  deviceName: string
): Promise<void> {
  const row = `[data-testid="settings-connected-service"][data-name="${deviceName}"]`;
  await client.setContext('content');
  await client.navigate(`${contentServerUrl}/settings#connected-services`);
  await client.clickElement(
    await findElementBySelectors(client, [
      `${row} [data-testid="connected-service-sign-out"]`,
    ])
  );
  await client.clickElement(
    await findElementBySelectors(client, ['input[name="reason"][value="no"]'])
  );
  await client.clickElement(
    await findElementBySelectors(client, ['[data-testid="modal-confirm"]'])
  );
  await pollUntil(
    async () => {
      const found = await client.findElements('css selector', row);
      return found.length === 0 || undefined;
    },
    TIMEOUTS.ELEMENT_FIND,
    `Row for "${deviceName}" is still in Connected services`
  );
}

/** Change the password from Settings, which sends fxaccounts:change_password to Firefox. */
export async function changePasswordInSettings(
  client: MarionetteClient,
  contentServerUrl: string,
  opts: {
    oldPassword: string;
    newPassword: string;
    getMfaCode: () => Promise<string>;
  }
): Promise<void> {
  await client.setContext('content');
  await client.navigate(`${contentServerUrl}/settings/change_password`);
  await setInputValueByScript(
    client,
    ['input[name="confirmationCode"]'],
    await opts.getMfaCode()
  );
  await client.clickElement(
    await findElementBySelectors(client, [
      '[data-glean-id="account_pref_mfa_guard_submit"]',
    ])
  );
  await setInputValueByScript(
    client,
    ['[data-testid="current-password-input-field"]'],
    opts.oldPassword
  );
  await setInputValueByScript(
    client,
    ['[data-testid="new-password-input-field"]'],
    opts.newPassword
  );
  await setInputValueByScript(
    client,
    ['[data-testid="verify-password-input-field"]'],
    opts.newPassword
  );
  const formUrl = await client.getUrl();
  await client.clickElement(
    await findElementBySelectors(client, ['button[type="submit"]'])
  );
  await waitForUrlChange(client, formUrl);
}
