/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const P = require('../../lib/promise');

const config = require('../../config').getProperties();

describe('remote concurrect', function () {
  this.timeout(15000);
  let server;
  before(() => {
    config.verifierVersion = 1;
    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  it('concurrent create requests', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    // Two shall enter, only one shall survive!
    const r1 = Client.create(config.publicUrl, email, password, server.mailbox);
    const r2 = Client.create(config.publicUrl, email, password, server.mailbox);
    return P.all([r1, r2])
      .then(
        () => assert(false, 'created both accounts'),
        (err) => {
          assert.equal(err.errno, 101, 'account exists');
          // Note that P.all fails fast when one of the requests fails,
          // but we have to wait for *both* to complete before tearing
          // down the test infrastructure.  Bleh.
          if (!r1.isRejected()) {
            return r1;
          } else {
            return r2;
          }
        }
      )
      .then(() => {
        return server.mailbox.waitForEmail(email);
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
