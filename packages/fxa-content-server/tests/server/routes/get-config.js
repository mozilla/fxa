/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');
const route = require('../../../server/lib/routes/get-config');
var instance;
var request;
var response;

registerSuite('routes/get-config', {
  'route interface is correct': function() {
    assert.isFunction(route);
    assert.lengthOf(route, 0);
  },

  'initialise route': {
    before: function() {
      instance = route();
    },

    tests: {
      'instance interface is correct': function() {
        assert.isObject(instance);
        assert.lengthOf(Object.keys(instance), 3);
        assert.equal(instance.method, 'get');
        assert.equal(instance.path, '/config');
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 2);
      },

      'route.process': {
        before: function() {
          request = {};
          response = {
            json: sinon.spy(function() {
              return this;
            }),
            status: sinon.spy(function() {
              return this;
            }),
          };
          instance.process(request, response);
        },
        tests: {
          'response.status was called correctly': function() {
            assert.equal(response.status.callCount, 1);
            assert.equal(response.status.args[0][0], 410);
          },

          'response.json was called correctly': function() {
            assert.equal(response.json.callCount, 1);
            assert.deepEqual(response.json.args[0][0], {});
          },
        },
      },
    },
  },
});
