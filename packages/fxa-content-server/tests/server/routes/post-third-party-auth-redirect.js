/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const routeModule = require('../../../server/lib/routes/post-third-party-auth-redirect');
const sinon = require('sinon');

const suite = {
  tests: {},
};

var route;

suite.tests['post-third-party-auth-redirect function'] = {
  'route function is correct': function () {
    route = routeModule();
    assert.isObject(route);
    assert.lengthOf(Object.keys(route), 3);
    assert.equal(route.method, 'post');
    assert.equal(route.path, '/post_verify/third_party_auth/callback');
    assert.isFunction(route.process);
    assert.lengthOf(route.process, 2);
  },

  'route.process calls redirect': function () {
    const response = { redirect: sinon.spy() };

    routeModule().process({}, response);
    assert.equal(response.redirect.callCount, 1);

    const statusCode = response.redirect.args[0][0];
    assert.equal(statusCode, 301);

    const redirectUrl = response.redirect.args[0][1];
    assert.equal(
      redirectUrl,
      '/post_verify/third_party_auth/callback?provider=apple'
    );
  },
};

registerSuite('post-third-party-auth-redirect', suite);
