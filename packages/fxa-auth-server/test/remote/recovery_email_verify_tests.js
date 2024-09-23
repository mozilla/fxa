/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import url from 'url';
import ClientModule from "../client";
const Client = ClientModule();
import TestServer from '../test_server';

import configModule from "../../config";
const config = configModule.getProperties();

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote recovery email verify`, function () {
  this.timeout(15000);
  let server;
  before(() => {
    return TestServer.start(config).then((s) => {
      server = s;
    });
  });

  it('create account verify with incorrect code', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password, testOptions)
      .then((x) => {
        client = x;
      })
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, false, 'new account is not verified');
      })
      .then(() => {
        return client.verifyEmail('00000000000000000000000000000000');
      })
      .then(
        () => {
          assert(false, 'verified email with bad code');
        },
        (err) => {
          assert.equal(
            err.message.toString(),
            'Invalid confirmation code',
            'bad attempt'
          );
        }
      )
      .then(() => {
        return client.emailStatus();
      })
      .then((status) => {
        assert.equal(status.verified, false, 'account not verified');
      });
  });

  it('verification email link', () => {
    const email = server.uniqueEmail();
    const password = 'something';
    const options = {
      ...testOptions,
      redirectTo: `https://sync.${config.smtp.redirectDomain}/`,
      service: 'sync',
    };
    return Client.create(config.publicUrl, email, password, options)
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then((emailData) => {
        const link = emailData.headers['x-link'];
        const query = url.parse(link, true).query;
        assert.ok(query.uid, 'uid is in link');
        assert.ok(query.code, 'code is in link');
        assert.equal(
          query.redirectTo,
          options.redirectTo,
          'redirectTo is in link'
        );
        assert.equal(query.service, options.service, 'service is in link');
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});

});
