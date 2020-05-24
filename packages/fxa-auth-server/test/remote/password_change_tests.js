/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const jwtool = require('fxa-jwtool');
const Client = require('../client')();
const config = require('../../config').getProperties();
const TestServer = require('../test_server');
const url = require('url');

const tokens = require('../../lib/tokens')({ trace: function () {} });
function getSessionTokenId(sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex).then((token) => {
    return token.id;
  });
}

describe('remote password change', function () {
  this.timeout(15000);
  let server;
  before(() => {
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;

    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  it('password change, with unverified session', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'foobar';
    let kB, kA, client, firstAuthPW, originalSessionToken;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((x) => {
        client = x;
        originalSessionToken = client.sessionToken;
        firstAuthPW = x.authPW.toString('hex');
        return client.keys();
      })
      .then((keys) => {
        kB = keys.kB;
        kA = keys.kA;
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        // Login from different location to created unverified session
        return Client.login(config.publicUrl, email, password, { keys: true });
      })
      .then((c) => {
        client = c;
      })
      .then(() => {
        // Ignore confirm login email
        return server.mailbox.waitForEmail(email);
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        // Verify correct status
        assert.equal(status.verified, false, 'account is unverified');
        assert.equal(status.emailVerified, true, 'account email is verified');
        assert.equal(
          status.sessionVerified,
          false,
          'account session is unverified'
        );
      })
      .then(() => {
        return getSessionTokenId(client.sessionToken);
      })
      .then((sessionTokenId) => {
        return client.changePassword(newPassword, undefined, sessionTokenId);
      })
      .then((response) => {
        // Verify correct change password response
        assert.notEqual(
          response.sessionToken,
          originalSessionToken,
          'session token has changed'
        );
        assert.ok(response.keyFetchToken, 'key fetch token returned');
        assert.notEqual(
          client.authPW.toString('hex'),
          firstAuthPW,
          'password has changed'
        );
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        const subject = emailData.headers['subject'];
        assert.equal(subject, 'Password updated');
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.email, 'email is in the link');
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        // Verify correct status
        assert.equal(status.verified, false, 'account is unverified');
        assert.equal(status.emailVerified, true, 'account email is verified');
        assert.equal(
          status.sessionVerified,
          false,
          'account session is unverified'
        );
      })
      .then(() => {
        return Client.loginAndVerify(
          config.publicUrl,
          email,
          newPassword,
          server.mailbox,
          { keys: true }
        );
      })
      .then((x) => {
        client = x;
        return client.keys();
      })
      .then((keys) => {
        assert.deepEqual(keys.kB, kB, 'kB is preserved');
        assert.deepEqual(keys.kA, kA, 'kA is preserved');
      });
  });

  it('password change, with verified session', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'foobar';
    let kB, kA, client, firstAuthPW, originalSessionToken;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((x) => {
        client = x;
        originalSessionToken = client.sessionToken;
        firstAuthPW = x.authPW.toString('hex');
        return client.keys();
      })
      .then((keys) => {
        kB = keys.kB;
        kA = keys.kA;
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        return getSessionTokenId(client.sessionToken);
      })
      .then((sessionTokenId) => {
        return client.changePassword(newPassword, undefined, sessionTokenId);
      })
      .then((response) => {
        assert.notEqual(
          response.sessionToken,
          originalSessionToken,
          'session token has changed'
        );
        assert.ok(response.keyFetchToken, 'key fetch token returned');
        assert.notEqual(
          client.authPW.toString('hex'),
          firstAuthPW,
          'password has changed'
        );
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        const subject = emailData.headers['subject'];
        assert.equal(subject, 'Password updated');
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.email, 'email is in the link');
        assert.equal(
          emailData.html.indexOf('IP address') > -1,
          true,
          'contains ip location data'
        );
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        return Client.loginAndVerify(
          config.publicUrl,
          email,
          newPassword,
          server.mailbox,
          { keys: true }
        );
      })
      .then((x) => {
        client = x;
        return client.keys();
      })
      .then((keys) => {
        assert.deepEqual(keys.kB, kB, 'kB is preserved');
        assert.deepEqual(keys.kA, kA, 'kA is preserved');
      });
  });

  it('password change, with raw session data rather than session token id, return invalid token error', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'foobar';
    let client;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((x) => {
        client = x;
        return client.keys();
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, true, 'account is verified');
      })
      .then(() => {
        return client.changePassword(
          newPassword,
          undefined,
          client.sessionToken
        );
      })
      .then(
        () => {
          assert(false);
        },
        (err) => {
          assert.equal(err.errno, 110, 'Invalid token error');
          assert.equal(
            err.message,
            'The authentication token could not be found'
          );
        }
      );
  });

  it('password change w/o sessionToken', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'foobar';
    let kB, kA, client, firstAuthPW;

    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((x) => {
        client = x;
        firstAuthPW = x.authPW.toString('hex');
        return client.keys();
      })
      .then((keys) => {
        kB = keys.kB;
        kA = keys.kA;
      })
      .then(() => {
        return client.changePassword(newPassword);
      })
      .then((response) => {
        assert(!response.sessionToken, 'no session token returned');
        assert(!response.keyFetchToken, 'no key fetch token returned');
        assert.notEqual(
          client.authPW.toString('hex'),
          firstAuthPW,
          'password has changed'
        );
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        const subject = emailData.headers['subject'];
        assert.equal(subject, 'Password updated');
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.email, 'email is in the link');
      })
      .then(() => {
        return Client.loginAndVerify(
          config.publicUrl,
          email,
          newPassword,
          server.mailbox,
          { keys: true }
        );
      })
      .then((x) => {
        client = x;
        return client.keys();
      })
      .then((keys) => {
        assert.deepEqual(keys.kB, kB, 'kB is preserved');
        assert.deepEqual(keys.kA, kA, 'kA is preserved');
      });
  });

  it('password change does not update keysChangedAt', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'foobar';
    const duration = 1000 * 60 * 60 * 24; // 24 hours
    const publicKey = {
      algorithm: 'RS',
      n:
        '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
      e: '65537',
    };

    let client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );

    const cert1 = jwtool.unverify(await client.sign(publicKey, duration))
      .payload;

    await client.changePassword(newPassword);
    await server.mailbox.waitForEmail(email);

    client = await Client.loginAndVerify(
      config.publicUrl,
      email,
      newPassword,
      server.mailbox
    );

    const cert2 = jwtool.unverify(await client.sign(publicKey, duration))
      .payload;
    assert.equal(cert1['fxa-uid'], cert2['fxa-uid']);
    assert.ok(cert1['fxa-generation'] < cert2['fxa-generation']);
    assert.equal(cert1['fxa-keysChangedAt'], cert2['fxa-keysChangedAt']);
  });

  it('wrong password on change start', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((x) => {
        client = x;
        return client.keys();
      })
      .then(() => {
        client.authPW = Buffer.from(
          '0000000000000000000000000000000000000000000000000000000000000000',
          'hex'
        );
        return client.changePassword('foobar');
      })
      .then(
        () => assert(false),
        (err) => {
          assert.equal(err.errno, 103, 'invalid password');
        }
      );
  });

  it("shouldn't change password on account with TOTP without passing sessionToken", () => {
    const email = server.uniqueEmail();
    const password = 'ok';
    let client;
    return Client.createAndVerifyAndTOTP(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((res) => {
        client = res;

        // Doesn't specify a sessionToken to use
        return client.changePassword('foobar');
      })
      .then(assert.fail, (err) => {
        assert.equal(err.errno, 138, 'unverified session');
      });
  });

  it('should change password on account with TOTP with verified TOTP sessionToken', () => {
    const email = server.uniqueEmail();
    const password = 'ok';
    let client, firstAuthPW;
    return Client.createAndVerifyAndTOTP(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    )
      .then((res) => {
        client = res;
        firstAuthPW = client.authPW.toString('hex');
        return getSessionTokenId(client.sessionToken);
      })
      .then((sessionTokenId) => {
        return client.changePassword('foobar', undefined, sessionTokenId);
      })
      .then((response) => {
        assert(response.sessionToken, 'session token returned');
        assert(response.keyFetchToken, 'key fetch token returned');
        assert.notEqual(
          client.authPW.toString('hex'),
          firstAuthPW,
          'password has changed'
        );
      });
  });

  it("shouldn't change password on account with TOTP with unverified sessionToken", () => {
    const email = server.uniqueEmail();
    const password = 'ok';
    let client;
    return (
      Client.createAndVerifyAndTOTP(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { keys: true }
      )
        // Create new unverified client
        .then(() =>
          Client.login(config.publicUrl, email, password, { keys: true })
        )
        .then((res) => {
          client = res;
          return getSessionTokenId(client.sessionToken);
        })
        .then((sessionTokenId) => {
          return client.changePassword('foobar', undefined, sessionTokenId);
        })
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 138, 'unverified session');
        })
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
