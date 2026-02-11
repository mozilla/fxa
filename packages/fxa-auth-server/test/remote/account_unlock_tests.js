/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').default.getProperties();

// Note, intentionally not indenting for code review.
[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote account unlock`, function () {
  this.timeout(60000);
  let server;
  before(async () => {
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  it('/account/lock is no longer supported', () => {
    return Client.create(
      config.publicUrl,
      server.uniqueEmail(),
      'password',
      testOptions
    )
      .then((c) => {
        return c.lockAccount();
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        (e) => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });

  it('/account/unlock/resend_code is no longer supported', () => {
    return Client.create(
      config.publicUrl,
      server.uniqueEmail(),
      'password',
      testOptions
    )
      .then((c) => {
        return c.resendAccountUnlockCode('en');
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        (e) => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });

  it('/account/unlock/verify_code is no longer supported', () => {
    return Client.create(
      config.publicUrl,
      server.uniqueEmail(),
      'password',
      testOptions
    )
      .then((c) => {
        return c.verifyAccountUnlockCode('bigscaryuid', 'bigscarycode');
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        (e) => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });


});

});
