/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const url = require('url');
const Client = require('../client')();
const TestServer = require('../test_server');
const jwtool = require('fxa-jwtool');

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

  it('account reset w/o sessionToken', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';

    let client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    );
    const keys1 = await client.keys();

    await client.forgotPassword();
    const code = await server.mailbox.waitForCode(email);
    assert.throws(() => {
      client.resetPassword(newPassword);
    });
    const response = await resetPassword(client, code, newPassword, {
      sessionToken: false,
    });
    assert(!response.sessionToken, 'session token is not in response');
    assert(!response.keyFetchToken, 'keyFetchToken token is not in response');
    assert(!response.verified, 'verified is not in response');

    const emailData = await server.mailbox.waitForEmail(email);
    const link = emailData.headers['x-link'];
    const query = url.parse(link, true).query;
    assert.ok(query.email, 'email is in the link');

    // make sure we can still login after password reset
    client = await Client.login(config.publicUrl, email, newPassword, {
      keys: true,
    });
    const keys2 = await client.keys();
    assert.notEqual(keys1.wrapKb, keys2.wrapKb, 'wrapKb was reset');
    assert.equal(keys1.kA, keys2.kA, 'kA was not reset');
    assert.equal(typeof client.kB, 'string');
    assert.equal(client.kB.length, 64, 'kB exists, has the right length');
  });

  it('account reset with keys', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';

    let client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    );
    const keys1 = await client.keys();

    await client.forgotPassword();
    const code = await server.mailbox.waitForCode(email);
    assert.throws(() => {
      client.resetPassword(newPassword);
    });
    const response = await resetPassword(client, code, newPassword, {
      keys: true,
    });
    assert.ok(response.sessionToken, 'session token is in response');
    assert.ok(response.keyFetchToken, 'keyFetchToken token is in response');
    assert.equal(response.verified, true, 'verified is true');

    const emailData = await server.mailbox.waitForEmail(email);
    const link = emailData.headers['x-link'];
    const query = url.parse(link, true).query;
    assert.ok(query.email, 'email is in the link');

    // make sure we can still login after password reset
    client = await Client.login(config.publicUrl, email, newPassword, {
      keys: true,
    });
    const keys2 = await client.keys();
    assert.notEqual(keys1.wrapKb, keys2.wrapKb, 'wrapKb was reset');
    assert.equal(keys1.kA, keys2.kA, 'kA was not reset');
    assert.equal(typeof client.kB, 'string');
    assert.equal(client.kB.length, 64, 'kB exists, has the right length');
  });

  it('account reset w/o keys, with sessionToken', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';

    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );

    await client.forgotPassword();
    const code = await server.mailbox.waitForCode(email);
    assert.throws(() => {
      client.resetPassword(newPassword);
    });
    const response = await resetPassword(client, code, newPassword);
    assert.ok(response.sessionToken, 'session token is in response');
    assert(!response.keyFetchToken, 'keyFetchToken token is not in response');
    assert.equal(response.verified, true, 'verified is true');
  });

  it('account reset deletes tokens', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    const opts = {
      keys: true,
    };

    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      opts
    );

    await client.forgotPassword();
    // Stash original reset code then attempt to use it after another reset
    const originalCode = await server.mailbox.waitForCode(email);

    await client.forgotPassword();
    const code = await server.mailbox.waitForCode(email);
    assert.throws(() => client.resetPassword(newPassword));
    await resetPassword(client, code, newPassword, undefined, opts);

    const emailData = await server.mailbox.waitForEmail(email);
    const templateName = emailData.headers['x-template-name'];
    assert.equal(templateName, 'passwordReset');

    try {
      await resetPassword(client, originalCode, newPassword, undefined, opts);
      assert.fail('Should not have succeeded password reset');
    } catch (err) {
      // Ensure that password reset fails with unknown token error codes
      assert.equal(err.code, 401);
      assert.equal(err.errno, 110);
    }
  });

  it('account reset updates keysChangedAt', async () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    const newPassword = 'ez';
    const duration = 1000 * 60 * 60 * 24; // 24 hours
    const publicKey = {
      algorithm: 'RS',
      n:
        '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
      e: '65537',
    };

    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      { keys: true }
    );

    const cert1 = jwtool.unverify(await client.sign(publicKey, duration))
      .payload;

    await client.forgotPassword();
    const code = await server.mailbox.waitForCode(email);
    await resetPassword(client, code, newPassword);
    await server.mailbox.waitForEmail(email);

    const cert2 = jwtool.unverify(await client.sign(publicKey, duration))
      .payload;

    assert.equal(cert1['fxa-uid'], cert2['fxa-uid']);
    assert.ok(cert1['fxa-generation'] < cert2['fxa-generation']);
    assert.ok(cert1['fxa-keysChangedAt'] < cert2['fxa-keysChangedAt']);
  });

  after(() => {
    return TestServer.stop(server);
  });

  async function resetPassword(client, code, newPassword, options) {
    await client.verifyPasswordResetCode(code);
    return await client.resetPassword(newPassword, {}, options);
  }
});
