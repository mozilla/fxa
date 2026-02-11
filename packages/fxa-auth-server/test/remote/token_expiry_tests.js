/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

function fail() {
  throw new Error();
}

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote token expiry`, function () {
  this.timeout(60000);
  let server, config;

  before(async () => {
    config = require('../../config').default.getProperties();
    config.tokenLifetimes.passwordChangeToken = 1;
    config.tokenLifetimes.sessionTokenWithoutDevice = 1;

    Container.set(PlaySubscriptions, {});
    Container.set(AppStoreSubscriptions, {});

    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  it('token expiry', () => {
    // FYI config.tokenLifetimes.passwordChangeToken = 1
    const email = `${Math.random()}@example.com`;
    const password = 'ok';
    return Client.create(config.publicUrl, email, password, {
      ...testOptions,
      preVerified: true,
    })
      .then((c) => {
        return c.changePassword('hello');
      })
      .then(fail, (err) => {
        assert.equal(err.errno, 110, 'invalid token');
      });
  });

  it('session token expires', () => {
    return Client.createAndVerify(
      config.publicUrl,
      `${Math.random()}@example.com`,
      'wibble',
      server.mailbox,
      testOptions
    ).then((client) =>
      client.sessionStatus().then(
        () => assert.ok(false, 'client.sessionStatus should have failed'),
        (err) =>
          assert.equal(
            err.errno,
            110,
            'client.sessionStatus returned the correct error'
          )
      )
    );
  });


});

});
