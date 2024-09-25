/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const superagent = require('superagent');

// Note, intentionally not indenting for code review.
[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote base path`, function () {
  this.timeout(60000);
  let server, config;
  before(async () => {
    config = require('../../config').default.getProperties();
    config.publicUrl = 'http://localhost:9000/auth';

    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });

  function testVersionRoute(path) {
    return () => {
      return superagent.get(config.publicUrl + path).then((res) => {
        assert.equal(res.statusCode, 200);
        const json = res.body;
        assert.deepEqual(Object.keys(json), ['version', 'commit', 'source']);
        assert.equal(
          json.version,
          require('../../package.json').version,
          'package version'
        );
        assert.ok(
          json.source && json.source !== 'unknown',
          'source repository'
        );

        // check that the git hash just looks like a hash
        assert.ok(
          json.commit.match(/^[0-9a-f]{40}$/),
          'The git hash actually looks like one'
        );
      });
    };
  }

  it('alternate base path', () => {
    const email = `${Math.random()}@example.com`;
    const password = 'ok';
    // if this doesn't crash, we're all good
    return Client.create(config.publicUrl, email, password, testOptions);
  });

  it('.well-known did not move', () => {
    return superagent
      .get('http://localhost:9000/.well-known/browserid')
      .then((res) => {
        assert.equal(res.statusCode, 200);
        const json = res.body;
        assert.equal(
          json.authentication,
          '/.well-known/browserid/nonexistent.html'
        );
      });
  });

  it('"/" returns valid version information', testVersionRoute('/'));

  it(
    '"/__version__" returns valid version information',
    testVersionRoute('/__version__')
  );


});

});
