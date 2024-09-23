/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import TestServer from '../test_server';
import ClientModule from "../client";
const Client = ClientModule();
import retry from 'async-retry';

import configModule from "../../config";
const config = configModule.getProperties();
config.redis.sessionTokens.enabled = false;
const key = {
  algorithm: 'RS',
  n: '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  e: '65537',
};

// Note, intentionally not indenting for code review.
[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote account locale`, function () {
  this.timeout(15000);
  let server;

  before(async () => {
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  it('signing a cert against an account with no locale will save the locale', async () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      testOptions
    );
    let response = await client.api.accountStatus(
      client.uid,
      client.sessionToken
    );
    assert.ok(!response.locale, 'account has no locale');
    await client.login();

    // Certificate sign kicks off async updates that are not waited on, therefore
    // we must retry the accouunt status check until the locale is updated.
    await client.api.certificateSign(client.sessionToken, key, 1000, 'en-US');
    await retry(
      async () => {
        response = await client.api.accountStatus(
          client.uid,
          client.sessionToken
        );
        assert.equal(response.locale, 'en-US', 'account has a locale');
      },
      {
        retries: 10,
        minTimeout: 20,
      }
    );
  });

  it('a really long (invalid) locale', async () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    const client = await Client.create(config.publicUrl, email, password, {
      ...testOptions,
      lang: Buffer.alloc(128).toString('hex'),
    });
    const response = await client.api.accountStatus(
      client.uid,
      client.sessionToken
    );
    assert.ok(!response.locale, 'account has no locale');
  });

  it('a really long (valid) locale', async () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    const client = await Client.create(config.publicUrl, email, password, {
      ...testOptions,
      lang: `en-US,en;q=0.8,${Buffer.alloc(128).toString('hex')}`,
    });
    const response = await client.api.accountStatus(
      client.uid,
      client.sessionToken
    );
    assert.equal(response.locale, 'en-US,en;q=0.8', 'account has no locale');
  });
});

});
