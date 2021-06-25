/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

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
    return Promise.allSettled([r1, r2])
      .then((results) => {
        const rejected = results.filter((p) => p.status === 'rejected');
        assert(rejected.length === 1, 'one request should have failed');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
