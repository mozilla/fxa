/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
const pkg = require('../../package.json');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {},
};

function versionJson(route) {
  return function() {
    var dfd = this.async(intern._config.asyncTimeout);

    got(serverUrl + route)
      .then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(
          res.headers['content-type'],
          'application/json; charset=utf-8'
        );

        var body = JSON.parse(res.body);
        assert.deepEqual(Object.keys(body), [
          'commit',
          'version',
          'l10n',
          'tosPp',
          'source',
        ]);

        assert.equal(body.version, pkg.version);

        assert.ok(body.source);
        assert.notEqual(body.source, 'unknown');

        assert.ok(body.l10n);
        assert.notEqual(body.l10n, 'unknown');

        assert.ok(body.tosPp);
        assert.notEqual(body.tosPp, 'unknown');

        // check that the git hash just looks like a hash
        assert.match(body.commit, /^[0-9a-f]{40}$/);
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };
}

suite.tests['#get /ver.json'] = versionJson('/ver.json');
suite.tests['#get /__version__'] = versionJson('/__version__');

registerSuite('ver.json', suite);
