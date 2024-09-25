/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').default.getProperties();

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote concurrent`, function () {
  this.timeout(60000);
  let server;

  before(async () => {
    config.verifierVersion = 1;
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  it('concurrent create requests', () => {
    const email = server.uniqueEmail();
    const password = 'abcdef';
    // Two shall enter, only one shall survive!
    const r1 = Client.create(config.publicUrl, email, password, testOptions);
    const r2 = Client.create(config.publicUrl, email, password, testOptions);
    return Promise.allSettled([r1, r2])
      .then((results) => {
        const rejected = results.filter((p) => p.status === 'rejected');
        assert(rejected.length === 1, 'one request should have failed');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      });
  });


});

});
