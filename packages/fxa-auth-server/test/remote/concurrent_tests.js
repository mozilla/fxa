/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const { uniqueEmail } = require('../lib/util');
const config = require('../../config').default.getProperties();
const TestServer = require('../test_server');

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - #serial - remote concurrent`, function () {
    let server;
    before(async function () {
      server = await TestServer.start(config);
    });

    after(async function () {
      await TestServer.stop(server);
    });

    it('concurrent create requests', async function () {
      // Two shall enter, only one shall survive!
      const email = uniqueEmail();
      const password = 'abcdef';

      // wrap the start of each request to the same tick
      let start;
      const startSignal = new Promise((resolve) => {
        start = resolve;
      });

      const createUser = () =>
        startSignal.then(() =>
          Client.create(config.publicUrl, email, password, testOptions)
        );

      // release both requests on the same tick
      start();

      // Start both requests concurrently
      const r1 = createUser();
      const r2 = createUser();

      // Wait for both to settle
      const results = await Promise.allSettled([r1, r2]);

      const rejected = results.filter((p) => p.status === 'rejected');
      assert.strictEqual(rejected.length, 1, 'one request should have failed');

      // Wait for the resulting email (from the successful create)
      await server.mailbox.waitForEmail(email);
    });
  });
});
