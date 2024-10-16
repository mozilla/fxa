/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const log = { trace() {}, info() {}, debug() {}, warn() {}, error() {} };

const config = require('../../config').default.getProperties();

const Token = require('../../lib/tokens')(log);
const { createDB } = require('../../lib/db');
const DB = createDB(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
);

const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote verifier upgrade`, function () {
    this.timeout(60000);

    let client, db, server;

    before(async () => {
      config.verifierVersion = 0;
      config.securityHistory.ipProfiling.allowedRecency = 0;

      Container.set(PlaySubscriptions, {});
      Container.set(AppStoreSubscriptions, {});

      server = await TestServer.start(config);
      db = await DB.connect(config);
    });

    after(async () => {
      await TestServer.stop(server);
      await db.close();
    });

    it('upgrading verifierVersion upgrades the account on password change', async () => {
      const email = `${Math.random()}@example.com`;
      const password = 'ok';

      client = await Client.create(config.publicUrl, email, password, {
        ...testOptions,
        preVerified: true,
        keys: true,
      });

      let account = await db.account(client.uid);

      assert.equal(account.verifierVersion, 0, 'wrong version');
      await TestServer.stop(server);

      config.verifierVersion = 1;
      server = await TestServer.start(config);

      client = await Client.login(
        config.publicUrl,
        email,
        password,
        testOptions
      );

      await client.changePassword(password);
      account = await db.account(client.uid);
      assert.equal(account.verifierVersion, 1, 'wrong upgrade version');
    });
  });
});
