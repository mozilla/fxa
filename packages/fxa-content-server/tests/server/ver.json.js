/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request',
  'intern/dojo/node!../../package.json',
], function (intern, registerSuite, assert, config, request, pkg) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'ver.json'
  };

  function versionJson(route) {
    return function () {
      var dfd = this.async(intern.config.asyncTimeout);

      request(serverUrl + route, dfd.callback(function (err, res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

        var body = JSON.parse(res.body);
        assert.deepEqual(Object.keys(body), ['source', 'version', 'commit', 'l10n', 'tosPp']);
        assert.equal(body.version, pkg.version, 'package version');
        assert.ok(body.source && body.source !== 'unknown', 'source repository');
        assert.ok(body.l10n && body.l10n !== 'unknown', 'l10n version');
        assert.ok(body.tosPp && body.tosPp !== 'unknown', 'tosPp version');
        // check that the git hash just looks like a hash
        assert.ok(body.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one');
      }, dfd.reject.bind(dfd)));
    };
  }

  suite['#get /ver.json'] = versionJson('/ver.json');
  suite['#get /__version__'] = versionJson('/__version__');

  registerSuite(suite);
});
