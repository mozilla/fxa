/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').default.getProperties();

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - #series - remote email validity`, function () {
    let server;
    const temp = {};
    before(async () => {
      temp.requireVerifiedAccount =
        config.accountDestroy.requireVerifiedAccount;
      temp.requireVerifiedSession =
        config.accountDestroy.requireVerifiedSession;

      // Temporarily disable this so we can destroy the unverified accounts in the test below.
      config.accountDestroy.requireVerifiedAccount = false;
      config.accountDestroy.requireVerifiedSession = false;
      server = await TestServer.start(config);
    });

    after(async () => {
      config.accountDestroy.requireVerifiedAccount =
        temp.requireVerifiedAccount;
      config.accountDestroy.requireVerifiedSession =
        temp.requireVerifiedSession;
      await TestServer.stop(server);
    });

    const invalidEmails = [
      'notAnEmailAddress',
      '\n@example.com',
      'me@hello world.com',
      'me@hello+world.com',
      'me@.example',
      'me@example',
      'me@example.com-',
      'me@example..com',
      'me@example-.com',
      'me@example.-com',
      '\uD83D\uDCA9@unicodepooforyou.com',
    ];

    invalidEmails.forEach(email => {
      // these are currently getting a false positive
      // they're getting a `400` back, but the
      it(`/account/create rejects malformed email address: ${email}`, () => {
        const pwd = '123456';
        return Client.create(
          config.publicUrl,
          email,
          pwd,
          testOptions
        ).then(assert.fail, (err) => {
          assert.equal(err.code, 400, 'http 400 : malformed email is rejected');
          assert.equal(err.errno, 107, 'errno 107 : malformed email is rejected');
          assert.equal(err.message, "Invalid parameter in request body", )
        });
      });
    });

    const validEmails = [
      'tim@tim-example.net',
      'a+b+c@example.com',
      '#!?-@t-e-s-assert.c-o-m',
      `${String.fromCharCode(1234)}@example.com`,
      `test@${String.fromCharCode(5678)}.com`,
    ];

    // iterate over each and individually test so
    // that, should one email fail, we still test the others
    validEmails.forEach((email) => {
      it(`/account/create allows unusual but valid email addresses: ${email}`, () => {
        const pwd = '123456';
        return Client.create(
          config.publicUrl,
          email,
          pwd,
          testOptions
        ).then(
          (c) => {
            return c.destroyAccount();
          },
          (_err) => {
            console.debug('An email address that should have been allowed was rejected:',
              {
                email,
                _err
              });
            assert(
              false,
              `Email address ${email} should have been allowed, but it wasn't`
            );
          }
        );
      });
    });
  });
});
