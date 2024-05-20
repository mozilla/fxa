/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as assert from 'assert';
import AuthClient from '../server';

describe('lib/client', () => {
  let client: AuthClient;

  before(() => {
    client = new AuthClient('http://localhost:9000', {
      requireHeaders: true,
    });
  });

  it('fails without headers', async () => {
    client = new AuthClient('http://localhost:9000', {
      requireHeaders: true,
    });

    try {
      // check that general requests require header
      await client.accountStatus('0123456789abcdef');
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'extraHeaders missing!');
    }

    try {
      // check that session requests require header
      await client.sessionStatus('0123456789abcdef');
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'extraHeaders missing!');
    }
  });
});
