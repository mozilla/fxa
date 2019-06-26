/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const routeModule = require('../../../server/lib/routes/get-well-known-change-password');
const got = require('got');
const sinon = require('sinon');
const serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

const suite = {
  tests: {},
};

var route;

suite.tests['get-well-known-change-password route function'] = {
  'route function is correct': function() {
    route = routeModule();
    assert.isObject(route);
    assert.lengthOf(Object.keys(route), 3);
    assert.equal(route.method, 'get');
    assert.equal(route.path, '/.well-known/change-password');
    assert.isFunction(route.process);
    assert.lengthOf(route.process, 2);
  },

  'route.process calls redirect': function() {
    const response = { redirect: sinon.spy() };

    routeModule().process({}, response);
    assert.equal(response.redirect.callCount, 1);

    const statusCode = response.redirect.args[0][0];
    assert.equal(statusCode, 301);
  },
};

suite.tests[
  '#get /.well-known/change-password - returns a redirected page'
] = function() {
  const dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/.well-known/change-password', {})
    .then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.url, `${serverUrl}/settings/change_password`);
      assert.isTrue(res.body.includes('<title>Firefox Accounts</title>'));
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

registerSuite('well-known-change-password', suite);
