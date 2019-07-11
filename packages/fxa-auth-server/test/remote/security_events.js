/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').getProperties();

const tokens = require('../../lib/tokens')({ trace: function() {} });
function getSessionTokenId(sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
    return token.id;
  });
}

describe('remote securityEvents', () => {
  let server;

  before(function() {
    this.timeout(15000);
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('returns securityEvents on creating and login into an account', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    let client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(x => {
        client = x;
        return client.login().then(() => {
          return client.securityEvents();
        });
      })
      .then(events => {
        assert.equal(events.length, 2);
        assert.equal(events[0].name, 'account.login');
        assert.isBelow(events[0].createdAt, new Date().getTime());
        assert.equal(events[0].verified, false);

        assert.equal(events[1].name, 'account.create');
        assert.isBelow(events[1].createdAt, new Date().getTime());
        assert.equal(events[1].verified, true);
      });
  });

  it('returns security events after password change, with unverified session', () => {
    const email = server.uniqueEmail();
    const password = 'oldPassword';
    const newPassword = 'newPasssword';
    let client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then(x => {
        client = x;
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        // Login from different location to created unverified session
        return Client.login(config.publicUrl, email, password, { keys: true });
      })
      .then(c => {
        client = c;
      })
      .then(() => {
        // Ignore confirm login email
        return server.mailbox.waitForEmail(email);
      })
      .then(() => {
        return getSessionTokenId(client.sessionToken);
      })
      .then(sessionTokenId => {
        return client.changePassword(newPassword, undefined, sessionTokenId);
      })
      .then(() => {
        return client.securityEvents();
      })
      .then(events => {
        assert.equal(events.length, 2);
        assert.equal(events[0].name, 'account.login');
        assert.isBelow(events[0].createdAt, new Date().getTime());
        assert.equal(events[0].verified, false);

        assert.equal(events[1].name, 'account.create');
        assert.isBelow(events[1].createdAt, new Date().getTime());
        assert.equal(events[1].verified, true);
      });
  });

  it('returns security events after password change, with verified session', () => {
    const email = server.uniqueEmail();
    const password = 'oldPassword';
    const newPassword = 'newPasssword';
    let client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then(x => {
        client = x;
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        return getSessionTokenId(client.sessionToken);
      })
      .then(sessionTokenId => {
        return client.changePassword(newPassword, undefined, sessionTokenId);
      })
      .then(() => {
        return client.securityEvents();
      })
      .then(events => {
        assert.equal(events.length, 1);
        assert.equal(events[0].name, 'account.create');
        assert.isBelow(events[0].createdAt, new Date().getTime());
        assert.equal(events[0].verified, true);
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
