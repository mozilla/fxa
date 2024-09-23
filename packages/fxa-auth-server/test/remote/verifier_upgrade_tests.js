/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import TestServer from '../test_server';
import ClientModule from '../client';
const Client = ClientModule();
const log = { trace() {}, info() {}, debug() {}, warn() {}, error() {} };

import configModule from '../../config';
const config = configModule.getProperties();
import TokenModule from '../../lib/tokens';
const Token = TokenModule(log);
import DBModule from '../../lib/db';

const DB = DBModule(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
);

import { Container } from 'typedi';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';

let client, db, server;

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote verifier upgrade`, function () {
  this.timeout(30000);

  before(async () => {
    config.verifierVersion = 0;
    config.securityHistory.ipProfiling.allowedRecency = 0;

    Container.set(PlaySubscriptions, {});
    Container.set(AppStoreSubscriptions, {});

    server = await TestServer.start(config);
    db = await DB.connect(config);
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

  after(async () => {
    try {
      await db.close();
      await TestServer.stop(server);
    } catch (e) {}
  });
});

});
