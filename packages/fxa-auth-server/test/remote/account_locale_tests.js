/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').default.getProperties();
config.redis.sessionTokens.enabled = false;

// Note, intentionally not indenting for code review.
[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account locale`, function () {
    this.timeout(60000);
    let server;

    before(async () => {
      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    it('a really long (invalid) locale', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        lang: Buffer.alloc(128).toString('hex'),
      });
      const response = await client.api.accountStatus(
        client.uid,
        client.sessionToken
      );
      assert.ok(!response.locale, 'account has no locale');
    });

    it('a really long (valid) locale', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        lang: `en-US,en;q=0.8,${Buffer.alloc(128).toString('hex')}`,
      });
      const response = await client.api.accountStatus(
        client.uid,
        client.sessionToken
      );
      assert.equal(response.locale, 'en-US,en;q=0.8', 'account has no locale');
    });
  });
});
