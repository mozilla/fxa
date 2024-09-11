/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import TestServer from '../test_server';
import ClientModule from '../client';
const Client = ClientModule();
import { Container } from 'typedi';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';

function fail() {
  throw new Error();
}

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote token expiry`, function () {
  this.timeout(15000);
  let server, config;
  before(() => {
    config = require('../../config').default.getProperties();
    config.tokenLifetimes.passwordChangeToken = 1;
    config.tokenLifetimes.sessionTokenWithoutDevice = 1;

    Container.set(PlaySubscriptions, {});
    Container.set(AppStoreSubscriptions, {});

    return TestServer.start(config).then((s) => {
      server = s;
    });
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

  after(() => {
    return TestServer.stop(server);
  });
});

});
