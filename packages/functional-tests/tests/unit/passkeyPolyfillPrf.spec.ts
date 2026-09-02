/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Covers the one part of the passkey polyfill a Jest test cannot reach: the
 * browser-side shim, which lives in a template string and converts PRF eval
 * salts and outputs across the page/Node boundary. Everything else about the
 * PRF path is unit-tested in `libs/accounts/passkey`.
 *
 * Deliberately minimal — once the wrap flow has functional tests of its own,
 * they exercise this seam through real app code and these become redundant.
 *
 * The page is served by route interception, so no FxA service is needed.
 */

import { expect, test } from '@playwright/test';

import { derivePrfOutput } from '@fxa/accounts/passkey/testing';

import { PasskeyPolyfill } from '../../lib/passkeyPolyfill';

// base64url of "test-prf-salt" — the dev-config PRF salt, not the production one.
const TEST_PRF_SALT = 'dGVzdC1wcmYtc2FsdA';
const SALT_BYTES = [...Buffer.from(TEST_PRF_SALT, 'base64url')];
const RP_ID = 'passkey-polyfill.test';
const PAGE_URL = `http://${RP_ID}/`;
const PRF_OUTPUT_BYTES = 32;

/** Structural stand-in for the DOM's PublicKeyCredential. */
type PrfCredential = {
  getClientExtensionResults(): {
    prf?: { enabled?: boolean; results?: { first: ArrayBuffer } };
  };
};
type GetOptions = Parameters<typeof navigator.credentials.get>[0];
/** The DOM's client extension inputs, named without a DOM identifier. */
type Extensions = NonNullable<
  NonNullable<NonNullable<GetOptions>['publicKey']>['extensions']
>;

type PageArgs = { salt: number[]; rpId: string };

/** Registration run in page context; reports the capability it was told. */
const createInPage = async ({ salt, rpId }: PageArgs) => {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: new Uint8Array(32),
      rp: { id: rpId, name: rpId },
      user: {
        id: new Uint8Array(16),
        name: 'polyfill@example.com',
        displayName: 'polyfill@example.com',
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      extensions: {
        prf: { eval: { first: new Uint8Array(salt) } },
      } as Extensions,
    },
  })) as unknown as PrfCredential;

  return { enabled: credential.getClientExtensionResults().prf?.enabled };
};

/** Assertion run in page context; reports the PRF output as the page sees it. */
const getInPage = async ({ salt, rpId }: PageArgs) => {
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: new Uint8Array(32),
      rpId,
      extensions: {
        prf: { eval: { first: new Uint8Array(salt) } },
      } as Extensions,
    },
  })) as unknown as PrfCredential;

  const results = credential.getClientExtensionResults().prf?.results;
  if (!results) {
    return { hasOutput: false };
  }
  return {
    hasOutput: true,
    isArrayBuffer: results.first instanceof ArrayBuffer,
    byteLength: results.first.byteLength,
    first: btoa(String.fromCharCode(...new Uint8Array(results.first)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''),
  };
};

/** Serve a blank page on a routable origin and install the polyfill on it. */
async function installOn(
  page: Parameters<PasskeyPolyfill['install']>[0],
  polyfill: PasskeyPolyfill
) {
  await page.route(`${PAGE_URL}**`, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html></html>' })
  );
  await page.goto(PAGE_URL);
  await polyfill.install(page);
}

test.describe('passkey polyfill PRF seam', () => {
  test('round-trips an eval salt to an ArrayBuffer output in page context', async ({
    page,
  }) => {
    const polyfill = new PasskeyPolyfill();
    await installOn(page, polyfill);
    await polyfill.success(async () => {
      await page.evaluate(createInPage, { salt: SALT_BYTES, rpId: RP_ID });
    });
    const [credential] = polyfill.getCredentialObjects();

    let assertion: Awaited<ReturnType<typeof getInPage>> | undefined;
    await polyfill.assertion(async () => {
      assertion = await page.evaluate(getInPage, {
        salt: SALT_BYTES,
        rpId: RP_ID,
      });
    });

    expect(assertion).toEqual({
      hasOutput: true,
      isArrayBuffer: true,
      byteLength: PRF_OUTPUT_BYTES,
      first: derivePrfOutput(credential, TEST_PRF_SALT).toString('base64url'),
    });
  });

  test('surfaces no output when the authenticator has no PRF support', async ({
    page,
  }) => {
    const polyfill = new PasskeyPolyfill({ prfSupported: false });
    await installOn(page, polyfill);

    let registration: Awaited<ReturnType<typeof createInPage>> | undefined;
    await polyfill.success(async () => {
      registration = await page.evaluate(createInPage, {
        salt: SALT_BYTES,
        rpId: RP_ID,
      });
    });

    // `enabled: false` only reaches page code if the eval request crossed the
    // boundary, so the absent assertion output below is attributable to the
    // authenticator rather than to broken extension forwarding.
    expect(registration).toEqual({ enabled: false });

    let assertion: Awaited<ReturnType<typeof getInPage>> | undefined;
    await polyfill.assertion(async () => {
      assertion = await page.evaluate(getInPage, {
        salt: SALT_BYTES,
        rpId: RP_ID,
      });
    });

    expect(assertion).toEqual({ hasOutput: false });
  });
});
