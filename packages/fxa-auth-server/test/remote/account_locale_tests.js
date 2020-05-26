/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').getProperties();
config.redis.sessionTokens.enabled = false;
const key = {
  algorithm: 'RS',
  n:
    '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  e: '65537',
};

describe('remote account locale', function () {
  this.timeout(15000);

  let server;
  before(() => {
    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  it('signing a cert against an account with no locale will save the locale', () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    let client;
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then((c) => {
        client = c;
        return c.api.accountStatus(c.uid, c.sessionToken);
      })
      .then((response) => {
        assert.ok(!response.locale, 'account has no locale');
        return client.login();
      })
      .then(() => {
        return client.api.certificateSign(
          client.sessionToken,
          key,
          1000,
          'en-US'
        );
      })
      .then(() => {
        return client.api.accountStatus(client.uid, client.sessionToken);
      })
      .then((response) => {
        assert.equal(response.locale, 'en-US', 'account has a locale');
      });
  });

  it('a really long (invalid) locale', () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    return Client.create(config.publicUrl, email, password, {
      lang: Buffer.alloc(128).toString('hex'),
    })
      .then((c) => {
        return c.api.accountStatus(c.uid, c.sessionToken);
      })
      .then((response) => {
        assert.ok(!response.locale, 'account has no locale');
      });
  });

  it('a really long (valid) locale', () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    return Client.create(config.publicUrl, email, password, {
      lang: `en-US,en;q=0.8,${Buffer.alloc(128).toString('hex')}`,
    })
      .then((c) => {
        return c.api.accountStatus(c.uid, c.sessionToken);
      })
      .then((response) => {
        assert.equal(
          response.locale,
          'en-US,en;q=0.8',
          'account has no locale'
        );
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
