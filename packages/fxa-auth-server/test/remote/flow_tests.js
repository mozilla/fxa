/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').default.getProperties();

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote flow`, function () {
    this.timeout(60000);
    let server;
    let email1;
    config.signinConfirmation.skipForNewAccounts.enabled = true;
    before(async () => {
      server = await TestServer.start(config);
      email1 = server.uniqueEmail();
    });

    after(async () => {
      await TestServer.stop(server);
    });

    it('Create account flow', () => {
      const email = email1;
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then((x) => {
          client = x;
          return client.keys();
        })
        .then((keys) => {
          assert.equal(typeof keys.kA, 'string', 'kA exists');
          assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
          assert.equal(typeof keys.kB, 'string', 'kB exists');
          assert.equal(
            client.getState().kB.length,
            64,
            'kB exists, has the right length'
          );
        });
    });

    it('Login flow', () => {
      const email = email1;
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.login(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      })
        .then((x) => {
          client = x;
          assert.ok(client.authAt, 'authAt was set');
          assert.ok(client.uid, 'got a uid');
          return client.keys();
        })
        .then((keys) => {
          assert.equal(typeof keys.kA, 'string', 'kA exists');
          assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
          assert.equal(typeof keys.kB, 'string', 'kB exists');
          assert.equal(
            client.getState().kB.length,
            64,
            'kB exists, has the right length'
          );
        });
    });
  });
});
