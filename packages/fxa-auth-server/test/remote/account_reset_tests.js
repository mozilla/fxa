/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const chai = require('chai');
const { assert } = chai;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const url = require('url');
const Client = require('../client')();
const { TestUtilities } = require('../test_utilities');
const mailbox = require('../mailbox')();
const config = require('../../config').default.getProperties();

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account reset`, function () {

    it('account reset w/o sessionToken', async () => {
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      let client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        {
          ...testOptions,
          keys: true,
        }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      const response = await resetPassword(client, code, newPassword, {
        sessionToken: false,
      });
      assert(!response.sessionToken, 'session token is not in response');
      assert(!response.keyFetchToken, 'keyFetchToken token is not in response');
      assert(!response.verified, 'verified is not in response');

      const emailData = await mailbox.waitForEmail(email);
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
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      let client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        { ...testOptions, keys: true }
      );
      const keys1 = await client.keys();

      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      const response = await resetPassword(client, code, newPassword, {
        keys: true,
      });
      assert.ok(response.sessionToken, 'session token is in response');
      assert.ok(response.keyFetchToken, 'keyFetchToken token is in response');
      assert.equal(response.verified, true, 'verified is true');

      const emailData = await mailbox.waitForEmail(email);
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
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      );

      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      const response = await resetPassword(client, code, newPassword);
      assert.ok(response.sessionToken, 'session token is in response');
      assert(!response.keyFetchToken, 'keyFetchToken token is not in response');
      assert.equal(response.verified, true, 'verified is true');
    });

    it('account reset deletes tokens', async () => {
      const email = TestUtilities.uniqueEmail();
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
        mailbox,
        options
      );

      await client.forgotPassword();
      // Stash original reset code then attempt to use it after another reset
      const originalCode = await mailbox.waitForCode(email);

      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      assert.isRejected(client.resetPassword(newPassword));
      await resetPassword(client, code, newPassword, undefined, options);

      const emailData = await mailbox.waitForEmail(email);
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
      const email = TestUtilities.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const newPassword = 'ez';

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        { ...testOptions, keys: true }
      );

      const profileBefore = await client.accountProfile();

      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      await resetPassword(client, code, newPassword);
      await mailbox.waitForEmail(email);

      const profileAfter = await client.accountProfile();

      assert.ok(profileBefore['keysChangedAt'] < profileAfter['keysChangedAt']);
    });

    async function resetPassword(client, code, newPassword, options) {
      await client.verifyPasswordResetCode(code);
      return await client.resetPassword(newPassword, {}, options);
    }
  });
});
