/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const log = { trace() {}, info() {} };

const config = require('../../config').getProperties();

const Token = require('../../lib/tokens')(log);
const DB = require('../../lib/db')(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
);

let client, db, server;

describe('remote verifier upgrade', function () {
  this.timeout(30000);

  before(async () => {
    config.verifierVersion = 0;
    config.securityHistory.ipProfiling.allowedRecency = 0;

    server = await TestServer.start(config);
    db = await DB.connect(config[config.db.backend]);
  });

  it('upgrading verifierVersion upgrades the account on password change', async () => {
    const email = `${Math.random()}@example.com`;
    const password = 'ok';

    client = await Client.create(config.publicUrl, email, password, {
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
      server.mailbox
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
