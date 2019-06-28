/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').getProperties();

describe('remote account unlock', function() {
  this.timeout(15000);
  let server;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('/account/lock is no longer supported', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
      .then(c => {
        return c.lockAccount();
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        e => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });

  it('/account/unlock/resend_code is no longer supported', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
      .then(c => {
        return c.resendAccountUnlockCode('en');
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        e => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });

  it('/account/unlock/verify_code is no longer supported', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
      .then(c => {
        return c.verifyAccountUnlockCode('bigscaryuid', 'bigscarycode');
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        e => {
          assert.equal(e.code, 410, 'correct error status code');
        }
      );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
