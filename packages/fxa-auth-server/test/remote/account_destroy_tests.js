/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').default.getProperties();

// Note, intentionally not indenting for code review.
[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account destroy`, function () {
    this.timeout(15000);
    let server;

    before(() => {
      return TestServer.start(config).then((s) => {
        server = s;
      });
    });

    it('account destroy', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      )
        .then((x) => {
          client = x;
          return client.sessionStatus();
        })
        .then((status) => {
          return client.destroyAccount();
        })
        .then(() => {
          return client.keys();
        })
        .then(
          (keys) => {
            assert(false, 'account not destroyed');
          },
          (err) => {
            assert.equal(err.message, 'Unknown account', 'account destroyed');
          }
        );
    });

    it('invalid authPW on account destroy', () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      )
        .then((c) => {
          c.authPW = Buffer.from(
            '0000000000000000000000000000000000000000000000000000000000000000',
            'hex'
          );
          c.authPWVersion2 = Buffer.from(
            '0000000000000000000000000000000000000000000000000000000000000000',
            'hex'
          );
          return c.destroyAccount();
        })
        .then(
          (r) => {
            assert(false);
          },
          (err) => {
            assert.equal(err.errno, 103);
          }
        );
    });

    it('should fail to delete account with TOTP with unverified session', () => {
      const email = server.uniqueEmail();
      const password = 'ok';
      let client;
      return Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
        }
      )
        .then(() => {
          // Create a new unverified session
          return Client.login(config.publicUrl, email, password, testOptions);
        })
        .then((response) => {
          client = response;
          return client.emailStatus();
        })
        .then((res) =>
          assert.equal(res.sessionVerified, false, 'session not verified')
        )
        .then(() => client.destroyAccount())
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 138, 'unverified session');
        });
    });

    after(() => {
      return TestServer.stop(server);
    });
  });
});
