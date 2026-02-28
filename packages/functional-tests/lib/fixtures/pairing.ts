/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Playwright fixture extension for pairing E2E tests.
 *
 * Adds a `marionetteAuthority` fixture that launches a separate Firefox
 * instance with Marionette enabled, suitable for driving the authority
 * (desktop) side of the pairing flow.
 */

import { firefox } from 'playwright';
import { MarionetteFirefox } from '../marionette-firefox';
import { test as standardTest, TestOptions } from './standard';

export type PairingTestOptions = TestOptions & {
  marionetteAuthority: MarionetteFirefox;
};

export const test = standardTest.extend<PairingTestOptions>({
  marionetteAuthority: async ({ target }, use, testInfo) => {
    // Use Playwright's bundled Firefox by default — it's already downloaded
    // in CI and locally. Override with FIREFOX_BINARY env if needed.
    const firefoxBinary =
      process.env.FIREFOX_BINARY || firefox.executablePath();
    const channelServerUri =
      process.env.CHANNEL_SERVER_URI ||
      await fetchChannelServerUri(target.contentServerUrl);
    const marionettePort = parseInt(
      process.env.MARIONETTE_PORT || '2828',
      10
    );
    if (isNaN(marionettePort)) {
      throw new Error(`Invalid MARIONETTE_PORT: ${process.env.MARIONETTE_PORT}`);
    }
    const headless = process.env.MARIONETTE_HEADLESS !== 'false';

    const authority = await MarionetteFirefox.launch({
      firefoxBinary,
      marionettePort,
      channelServerUri,
      target: target.name,
      context: 'oauth_webchannel_v1',
      headless,
    });

    // In CI, inject WAF bypass header into all Firefox HTTP requests
    const wafToken = process.env.CI_WAF_TOKEN;
    if (process.env.CI && wafToken) {
      await authority.client.setContext('chrome');
      await authority.client.executeScript(
        `
        const token = arguments[0];
        Services.obs.addObserver({
          observe(subject) {
            subject.QueryInterface(Ci.nsIHttpChannel);
            subject.setRequestHeader("fxa-ci", token, false);
          }
        }, "http-on-modify-request");
        `,
        { sandbox: 'system', args: [wafToken] }
      );
    }

    await use(authority);

    await authority.close();
  },
});

export { expect } from '@playwright/test';

/**
 * Fetch the pairing channel server URI from the target's well-known config.
 * Each environment (local, stage, production) uses a different channel server.
 */
async function fetchChannelServerUri(
  contentServerUrl: string
): Promise<string> {
  const fallback = 'wss://channelserver.services.mozilla.com';
  try {
    const url = `${contentServerUrl}/.well-known/fxa-client-configuration`;
    const headers: Record<string, string> =
      process.env.CI && process.env.CI_WAF_TOKEN
        ? { 'fxa-ci': process.env.CI_WAF_TOKEN }
        : {};
    const resp = await fetch(url, { headers });
    if (!resp.ok) return fallback;
    const config = await resp.json();
    return config.pairing_server_base_uri || fallback;
  } catch {
    return fallback;
  }
}
