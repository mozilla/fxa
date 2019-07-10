/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').getProperties();

describe('security events functional test', () => {
  let client, server;

  before(function() {
    this.timeout(15000);
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  // these tests will also be modified after db method starts working for local route

  it('returns securityEvents on creating and login into an acount', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(client => {
        return client.sessionStatus();
      })
      .then(status => {
        console.log(status);
        let { uid } = status;
        Client;
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
