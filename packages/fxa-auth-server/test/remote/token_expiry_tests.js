/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

function fail() {
  throw new Error();
}

describe('remote token expiry', function() {
  this.timeout(15000);
  let server, config;
  before(() => {
    config = require('../../config').getProperties();
    config.tokenLifetimes.passwordChangeToken = 1;
    config.tokenLifetimes.sessionTokenWithoutDevice = 1;

    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('token expiry', () => {
    // FYI config.tokenLifetimes.passwordChangeToken = 1
    const email = `${Math.random()}@example.com`;
    const password = 'ok';
    return Client.create(config.publicUrl, email, password, {
      preVerified: true,
    })
      .then(c => {
        return c.changePassword('hello');
      })
      .then(fail, err => {
        assert.equal(err.errno, 110, 'invalid token');
      });
  });

  it('session token expires', () => {
    return Client.createAndVerify(
      config.publicUrl,
      `${Math.random()}@example.com`,
      'wibble',
      server.mailbox
    ).then(client =>
      client.sessionStatus().then(
        () => assert.ok(false, 'client.sessionStatus should have failed'),
        err =>
          assert.equal(
            err.errno,
            110,
            'client.sessionStatus returned the correct error'
          )
      )
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
