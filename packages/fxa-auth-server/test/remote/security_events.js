/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').getProperties();

describe('security events functional test', () => {
  let server;

  before(function() {
    this.timeout(15000);
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('returns securityEvents on creating and login into an acount', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    return Client.create(config.publicUrl, email, password)
      .then(result => {
        assert.equal(result.securityEvents[0].name, 'create');
        assert.equal(result.securityEvents[0].verified, 0);
        assert.isBelow(
          result.securityEvents[0].createdAt,
          new Date().getTime()
        );
      })
      .then(() =>
        Client.login(config.publicUrl, email, password, { keys: false })
      )
      .then(result => {
        assert.equal(result.securityEvents[0].name, 'login');
        assert.equal(result.securityEvents[0].verified, 1);
        assert.isBelow(
          result.securityEvents[0].createdAt,
          new Date().getTime()
        );
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
