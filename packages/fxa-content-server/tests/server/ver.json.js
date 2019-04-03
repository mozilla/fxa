/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
const pkg = require('../../package.json');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {}
};

function versionJson(route) {
  return function () {
    var dfd = this.async(intern._config.asyncTimeout);

    got(serverUrl + route)
      .then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

        var body = JSON.parse(res.body);
        /*eslint-disable sorting/sort-object-props*/
        assert.deepEqual(Object.keys(body), ['commit', 'version', 'l10n', 'tosPp', 'source' ]);
        /*eslint-disable sorting/sort-object-props*/
        assert.equal(body.version, pkg.version, 'package version');
        assert.ok(body.source && body.source !== 'unknown', 'source repository');
        assert.ok(body.l10n && body.l10n !== 'unknown', 'l10n version');
        assert.ok(body.tosPp && body.tosPp !== 'unknown', 'tosPp version');
        // check that the git hash just looks like a hash
        assert.ok(body.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one');
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };
}

suite.tests['#get /ver.json'] = versionJson('/ver.json');
suite.tests['#get /__version__'] = versionJson('/__version__');

registerSuite('ver.json', suite);
