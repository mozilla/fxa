/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'sinon';

import { configureSentry } from '../../lib/sentry';

describe('Sentry', () => {
  it('can be set up when sentry is enabled', async () => {
    const dsn = 'https://deadbeef:deadbeef@localhost/123';
    try {
      await configureSentry({ dsn });
    } catch (err) {
      assert.fail('Should not throw');
    }
  });

  it('can be set up when sentry is not enabled', async () => {
    try {
      await configureSentry({ enabled: false });
    } catch (err) {
      assert.fail('Should not throw');
    }
  });
});
