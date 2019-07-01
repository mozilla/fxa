/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const url = require('url');
const Client = require('../client')();
const TestServer = require('../test_server');

const config = require('../../config').getProperties();

describe('remote account reset', function() {
  this.timeout(15000);
  let server;
  config.signinConfirmation.skipForNewAccounts.enabled = true;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('account reset w/o sessionToken', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    let wrapKb, kA, client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then(x => {
        client = x;
      })
      .then(() => {
        return client.keys();
      })
      .then(keys => {
        wrapKb = keys.wrapKb;
        kA = keys.kA;
        return client.forgotPassword();
      })
      .then(() => {
        return server.mailbox.waitForCode(email);
      })
      .then(code => {
        assert.throws(() => {
          client.resetPassword(newPassword);
        });
        return resetPassword(client, code, newPassword, {
          sessionToken: false,
        });
      })
      .then(response => {
        assert(!response.sessionToken, 'session token is not in response');
        assert(
          !response.keyFetchToken,
          'keyFetchToken token is not in response'
        );
        assert(!response.verified, 'verified is not in response');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.email, 'email is in the link');
      })
      .then(() => {
        // make sure we can still login after password reset
        return Client.login(config.publicUrl, email, newPassword, {
          keys: true,
        });
      })
      .then(x => {
        client = x;
        return client.keys();
      })
      .then(keys => {
        assert.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset');
        assert.equal(kA, keys.kA, 'kA was not reset');
        assert.equal(typeof client.kB, 'string');
        assert.equal(client.kB.length, 64, 'kB exists, has the right length');
      });
  });

  it('account reset with keys', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    let wrapKb, kA, client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then(x => {
        client = x;
      })
      .then(() => {
        return client.keys();
      })
      .then(keys => {
        wrapKb = keys.wrapKb;
        kA = keys.kA;
        return client.forgotPassword();
      })
      .then(() => {
        return server.mailbox.waitForCode(email);
      })
      .then(code => {
        assert.throws(() => {
          client.resetPassword(newPassword);
        });
        return resetPassword(client, code, newPassword, { keys: true });
      })
      .then(response => {
        assert.ok(response.sessionToken, 'session token is in response');
        assert.ok(response.keyFetchToken, 'keyFetchToken token is in response');
        assert.equal(response.verified, true, 'verified is true');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.email, 'email is in the link');
      })
      .then(() => {
        // make sure we can still login after password reset
        return Client.login(config.publicUrl, email, newPassword, {
          keys: true,
        });
      })
      .then(x => {
        client = x;
        return client.keys();
      })
      .then(keys => {
        assert.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset');
        assert.equal(kA, keys.kA, 'kA was not reset');
        assert.equal(typeof client.kB, 'string');
        assert.equal(client.kB.length, 64, 'kB exists, has the right length');
      });
  });

  it('account reset w/o keys, with sessionToken', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    let client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(x => {
        client = x;
      })
      .then(() => {
        return client.forgotPassword();
      })
      .then(() => {
        return server.mailbox.waitForCode(email);
      })
      .then(code => {
        assert.throws(() => {
          client.resetPassword(newPassword);
        });
        return resetPassword(client, code, newPassword);
      })
      .then(response => {
        assert.ok(response.sessionToken, 'session token is in response');
        assert(
          !response.keyFetchToken,
          'keyFetchToken token is not in response'
        );
        assert.equal(response.verified, true, 'verified is true');
      });
  });

  it('account reset deletes tokens', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    let client = null;
    let originalCode = null;
    const opts = {
      keys: true,
    };
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      opts
    )
      .then(x => {
        client = x;

        return client.forgotPassword();
      })
      .then(() => server.mailbox.waitForCode(email))
      .then(code => {
        // Stash original reset code then attempt to use it after another reset
        originalCode = code;

        return client.forgotPassword();
      })
      .then(() => server.mailbox.waitForCode(email))
      .then(code => {
        assert.throws(() => client.resetPassword(newPassword));

        return resetPassword(client, code, newPassword, undefined, opts);
      })
      .then(() => server.mailbox.waitForEmail(email))
      .then(emailData => {
        const templateName = emailData.headers['x-template-name'];
        assert.equal(templateName, 'passwordResetEmail');

        return resetPassword(
          client,
          originalCode,
          newPassword,
          undefined,
          opts
        ).then(
          () => assert.fail('Should not have succeeded password reset'),
          err => {
            // Ensure that password reset fails with unknown token error codes
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110);
          }
        );
      });
  });

  after(() => {
    return TestServer.stop(server);
  });

  function resetPassword(client, code, newPassword, options) {
    return client.verifyPasswordResetCode(code).then(() => {
      return client.resetPassword(newPassword, {}, options);
    });
  }
});
