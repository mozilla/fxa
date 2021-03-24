/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const routeModule = require('../../../server/lib/routes/get-well-known-change-password');
const sinon = require('sinon');

const suite = {
  tests: {},
};

var route;

suite.tests['get-well-known-change-password route function'] = {
  'route function is correct': function () {
    route = routeModule();
    assert.isObject(route);
    assert.lengthOf(Object.keys(route), 3);
    assert.equal(route.method, 'get');
    assert.equal(route.path, '/.well-known/change-password');
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
    assert.equal(redirectUrl, '/settings/change_password');
  },
};

registerSuite('well-known-change-password', suite);
