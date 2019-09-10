/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const config = require('../../../server/lib/configuration');
const got = require('got');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');
var openIdConfig = config.get('openid_configuration');

var suite = {
  tests: {},
};

suite.tests[
  '#options /.well-known/openid-configuration - CORS enabled'
] = function() {
  const dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/.well-known/openid-configuration', { method: 'options' })
    .then(function(res) {
      assert.equal(res.statusCode, 204);
      assert.equal(res.headers['access-control-allow-origin'], '*');
      assert.equal(res.headers['access-control-allow-methods'], 'GET');
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

suite.tests[
  '#get /.well-known/openid-configuration - returns a JSON doc with expected values'
] = function() {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/.well-known/openid-configuration', {})
    .then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.headers['access-control-allow-origin'], '*');

      var result = JSON.parse(res.body);
      assert.equal(Object.keys(result).length, 13);
      assert.containsAllKeys(result, [
        'authorization_endpoint',
        'introspection_endpoint',
        'issuer',
        'jwks_uri',
        'revocation_endpoint',
        'token_endpoint',
        'userinfo_endpoint',
      ]);
      assert.deepEqual(result.claims_supported, openIdConfig.claims_supported);
      assert.deepEqual(
        result.id_token_signing_alg_values_supported,
        openIdConfig.id_token_signing_alg_values_supported
      );
      assert.deepEqual(
        result.response_types_supported,
        openIdConfig.response_types_supported
      );
      assert.deepEqual(result.scopes_supported, openIdConfig.scopes_supported);
      assert.deepEqual(
        result.subject_types_supported,
        openIdConfig.subject_types_supported
      );
      assert.deepEqual(
        result.token_endpoint_auth_methods_supported,
        openIdConfig.token_endpoint_auth_methods_supported
      );
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

registerSuite('openid-configuration', suite);
