/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const url = require('url');
const Client = require('../client')();
const TestServer = require('../test_server');
const { JWTool } = require('@fxa/vendored/jwtool');

const config = require('../../config').default.getProperties();

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account reset`, function () {
    this.timeout(60000);
    let server;
    config.signinConfirmation.skipForNewAccounts.enabled = true;

    before(async function () {
      server = await TestServer.start(config);
    });

    after(async function () {
      await TestServer.stop(server);
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
        {
          ...testOptions,
          keys: true,
        }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
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

      if (testOptions.version === 'V2') {
        // Reset password only acts on V1 accounts, so we need to create a v1 client
        // run a password upgrade.
        const newClient = await Client.login(
          config.publicUrl,
          email,
          newPassword,
          {
            version: '',
            keys: true,
          }
        );
        await newClient.upgradeCredentials(newPassword);
      }

      // make sure we can still login after password reset
      // eslint-disable-next-line require-atomic-updates
      client = await Client.login(config.publicUrl, email, newPassword, {
        ...testOptions,
        keys: true,
      });
      const keys2 = await client.keys();
      assert.notEqual(keys1.wrapKb, keys2.wrapKb, 'wrapKb was reset');
      assert.equal(keys1.kA, keys2.kA, 'kA was not reset');
      assert.equal(typeof client.getState().kB, 'string');
      assert.equal(
        client.getState().kB.length,
        64,
        'kB exists, has the right length'
      );
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
        { ...testOptions, keys: true }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
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

      if (testOptions.version === 'V2') {
        // Reset password only acts on V1 accounts, so we need to create a v1 client
        // run a password upgrade.
        const newClient = await Client.login(
          config.publicUrl,
          email,
          newPassword,
          {
            version: '',
            keys: true,
          }
        );
        const status = await newClient.getCredentialsStatus(email);
        assert(status.upgradeNeeded);
        await newClient.upgradeCredentials(newPassword);
      }

      // make sure we can still login after password reset
      // eslint-disable-next-line require-atomic-updates
      client = await Client.login(config.publicUrl, email, newPassword, {
        ...testOptions,
        keys: true,
      });
      const keys2 = await client.keys();
      assert.notEqual(keys1.wrapKb, keys2.wrapKb, 'wrapKb was reset');
      assert.equal(keys1.kA, keys2.kA, 'kA was not reset');
      assert.equal(typeof client.getState().kB, 'string');
      assert.equal(
        client.getState().kB.length,
        64,
        'kB exists, has the right length'
      );
    });

    it('account reset w/o keys, with sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      const response = await resetPassword(client, code, newPassword);
      assert.ok(response.sessionToken, 'session token is in response');
      assert(!response.keyFetchToken, 'keyFetchToken token is not in response');
      assert.equal(response.verified, true, 'verified is true');
    });

    it('account reset deletes tokens', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';
      const options = {
        ...testOptions,
        keys: true,
      };

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        options
      );

      await client.forgotPassword();
      // Stash original reset code then attempt to use it after another reset
      const originalCode = await server.mailbox.waitForCode(email);

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      await resetPassword(client, code, newPassword, undefined, options);

      const emailData = await server.mailbox.waitForEmail(email);
      const templateName = emailData.headers['x-template-name'];
      assert.equal(templateName, 'passwordReset');

      try {
        await resetPassword(
          client,
          originalCode,
          newPassword,
          undefined,
          options
        );
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
        n: '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
        e: '65537',
      };

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );

      const cert1 = JWTool.unverify(
        await client.sign(publicKey, duration)
      ).payload;

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      await resetPassword(client, code, newPassword);
      await server.mailbox.waitForEmail(email);

      const cert2 = JWTool.unverify(
        await client.sign(publicKey, duration)
      ).payload;

      assert.equal(cert1['fxa-uid'], cert2['fxa-uid']);
      assert.ok(cert1['fxa-generation'] < cert2['fxa-generation']);
      assert.ok(cert1['fxa-keysChangedAt'] < cert2['fxa-keysChangedAt']);
    });

    async function resetPassword(client, code, newPassword, options) {
      await client.verifyPasswordResetCode(code);
      return await client.resetPassword(newPassword, {}, options);
    }
  });
});
