/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (intern, registerSuite, assert, config, request) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'openid'
  };

  suite['#get /openid/login - returns XRDS when Accept: application/xrds+xml'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/openid/login', {
      headers: {
        'Accept': 'application/xrds+xml'
      }
    },
    dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['Content-Type'], 'application/xrds+xml; charset=utf-8');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /openid/login - returns html when the querystring looks like a return_to request'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/openid/login?openid.mode=test',
    dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});
