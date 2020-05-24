/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const TestServer = require('../test_server');
const jwtool = require('fxa-jwtool');

const config = require('../../config').getProperties();

const pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile);

describe('remote flow', function () {
  this.timeout(15000);
  let server;
  let email1;
  config.signinConfirmation.skipForNewAccounts.enabled = true;
  before(() => {
    return TestServer.start(config).then((s) => {
      server = s;
      email1 = server.uniqueEmail();
    });
  });

  it('Create account flow', () => {
    const email = email1;
    const password = 'allyourbasearebelongtous';
    let client = null;
    const publicKey = {
      algorithm: 'RS',
      n:
        '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
      e: '65537',
    };
    const duration = 1000 * 60 * 60 * 24; // 24 hours
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
      .then((keys) => {
        assert.equal(typeof keys.kA, 'string', 'kA exists');
        assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
        assert.equal(typeof keys.kB, 'string', 'kB exists');
        assert.equal(client.kB.length, 64, 'kB exists, has the right length');
      })
      .then(() => {
        return client.sign(publicKey, duration);
      })
      .then((cert) => {
        assert.equal(typeof cert, 'string', 'cert exists');
        const payload = jwtool.verify(cert, pubSigKey.pem);
        assert.equal(
          payload.principal.email.split('@')[0],
          client.uid,
          'cert has correct uid'
        );
      });
  });

  it('Login flow', () => {
    const email = email1;
    const password = 'allyourbasearebelongtous';
    let client = null;
    const publicKey = {
      algorithm: 'RS',
      n:
        '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
      e: '65537',
    };
    const duration = 1000 * 60 * 60 * 24; // 24 hours
    return Client.login(config.publicUrl, email, password, server.mailbox, {
      keys: true,
    })
      .then((x) => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
        assert.ok(client.uid, 'got a uid');
        return client.keys();
      })
      .then((keys) => {
        assert.equal(typeof keys.kA, 'string', 'kA exists');
        assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
        assert.equal(typeof keys.kB, 'string', 'kB exists');
        assert.equal(client.kB.length, 64, 'kB exists, has the right length');
      })
      .then(() => {
        return client.sign(publicKey, duration);
      })
      .then((cert) => {
        assert.equal(typeof cert, 'string', 'cert exists');
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
