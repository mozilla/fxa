/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const superagent = require('superagent');
const TestServer = require('../test_server');
const path = require('path');

describe(`#integration - remote sign key`, function () {
  this.timeout(60000);
  let server;
  before(async () => {
    const config = require('../../config').default.getProperties();
    config.oldPublicKeyFile = path.resolve(
      __dirname,
      '../../config/public-key.json'
    );
    server = await TestServer.start(config);
  });
  after(async () => {
    await TestServer.stop(server);
  });

  it('.well-known/browserid has keys', () => {
    return superagent
      .get('http://localhost:9000/.well-known/browserid')
      .then((res) => {
        assert.equal(res.statusCode, 200);
        const json = res.body;
        assert.equal(
          json.authentication,
          '/.well-known/browserid/nonexistent.html'
        );
        assert.equal(json.keys.length, 2);
      });
  });


});
