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

import { resolveAuthorityBinary } from '../firefox-binary';
import { MarionetteFirefox } from '../marionette-firefox';
import { BaseTarget } from '../targets/base';
import { test as standardTest, TestOptions } from './standard';

export type PairingTestOptions = TestOptions & {
  marionetteAuthority: MarionetteFirefox;
  /**
   * A second real Firefox for the supplicant half. The v2 supplicant runs real
   * web-channel commands (pair_oauth_start, oauth_login), so it cannot be a
   * Playwright page; its profile is fresh, hence signed out.
   *
   * Both roles get `identity.fxaccounts.pairing.version: 2` from `buildPrefs`
   * in `lib/marionette-firefox.ts`, which is what lets chrome accept the v2
   * commands at all.
   */
  marionetteSupplicant: MarionetteFirefox;
};

/**
 * Marionette ports, two per worker so the roles cannot collide at any worker
 * count. A collision would not be silent: `MarionetteFirefox.launch` kills
 * whatever already holds the port.
 */
function marionettePortFor(role: PairingRole, parallelIndex: number): number {
  const raw = process.env.MARIONETTE_PORT || '2828';
  const basePort = Number(raw);
  if (!Number.isInteger(basePort)) {
    throw new Error(`Invalid MARIONETTE_PORT: ${raw}`);
  }
  const port = basePort + parallelIndex * 2 + (role === 'supplicant' ? 1 : 0);
  if (port < 1024 || port > 65535) {
    throw new Error(
      `Marionette port out of range for worker ${parallelIndex}: ${port}`
    );
  }
  return port;
}

type PairingRole = 'authority' | 'supplicant';

/**
 * Launch one Marionette-driven Firefox for a pairing role.
 *
 * Shared by both fixtures so the two roles cannot drift — notably the CI WAF
 * bypass, which a supplicant hitting a protected target needs just as much as
 * the authority does.
 */
async function launchPairingFirefox(
  role: PairingRole,
  target: BaseTarget,
  channelServerUri: string,
  parallelIndex: number
): Promise<MarionetteFirefox> {
  const firefox = await MarionetteFirefox.launch({
    firefoxBinary: resolveAuthorityBinary(),
    marionettePort: marionettePortFor(role, parallelIndex),
    channelServerUri,
    target: target.name,
    context: 'oauth_webchannel_v1',
    headless: process.env.MARIONETTE_HEADLESS !== 'false',
  });

  // In CI, inject WAF bypass header into all Firefox HTTP requests
  const wafToken = process.env.CI_WAF_TOKEN;
  if (process.env.CI && wafToken) {
    await firefox.client.setContext('chrome');
    await firefox.client.executeScript(
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

  return firefox;
}

/** Resolved once per worker: both roles talk to the same channel server. */
async function resolveChannelServerUri(contentServerUrl: string) {
  return (
    process.env.CHANNEL_SERVER_URI ||
    (await fetchChannelServerUri(contentServerUrl))
  );
}

export const test = standardTest.extend<PairingTestOptions>({
  marionetteAuthority: async ({ target }, use, testInfo) => {
    const authority = await launchPairingFirefox(
      'authority',
      target,
      await resolveChannelServerUri(target.contentServerUrl),
      testInfo.parallelIndex
    );

    await use(authority);

    await authority.close();
  },

  marionetteSupplicant: async ({ target }, use, testInfo) => {
    const supplicant = await launchPairingFirefox(
      'supplicant',
      target,
      await resolveChannelServerUri(target.contentServerUrl),
      testInfo.parallelIndex
    );

    await use(supplicant);

    await supplicant.close();
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
