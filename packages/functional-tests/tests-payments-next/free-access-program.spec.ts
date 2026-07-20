/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/payments';

const FREE_ACCESS_EMAIL = '123donefreeaccess@restmail.net';
const FREE_ACCESS_CAPABILITY = '123donePro';
const FREE_ACCESS_PASSWORD = process.env.FREE_ACCESS_PROGRAM_PWD;

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Free Access Program relies on non-production Strapi configuration'
    );
    test.skip(
      !FREE_ACCESS_PASSWORD,
      'FREE_ACCESS_PROGRAM_PWD is not set; required to provision the free-access account'
    );
  });

  test('grants the 123donePro capability via the auth-server profile', async ({
    target,
    testAccountTracker,
  }) => {
    // Guaranteed set by the beforeEach skip above.
    const password = FREE_ACCESS_PASSWORD as string;

    const credentials = await testAccountTracker.signInOrCreateSharedAccount(
      FREE_ACCESS_EMAIL,
      password
    );

    const profile = await target.authClient.accountProfile(
      credentials.sessionToken,
      target.ciHeader
    );

    // `subscriptionsByClientId` maps each client id to its capability slugs;
    // the free-access grant appears here even without a subscription.
    const capabilities = Object.values(
      profile.subscriptionsByClientId ?? {}
    ).flat();

    expect(capabilities).toContain(FREE_ACCESS_CAPABILITY);
  });
});
