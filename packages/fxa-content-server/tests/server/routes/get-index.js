/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!bluebird',
  'intern/dojo/node!path',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../../../server/lib/routes/get-index',
], function (registerSuite, assert, Promise, path, sinon, route) {
  var config, instance, request, response;

  registerSuite({
    name: 'routes/get-index',

    'route interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 1);
    },

    'initialise route': {
      setup: function () {
        config = {
          get: sinon.spy(function () {
            return 'foo';
          })
        };
        instance = route(config);
      },

      'instance interface is correct': function () {
        assert.isObject(instance);
        assert.lengthOf(Object.keys(instance), 3);
        assert.equal(instance.method, 'get');
        assert.equal(instance.path, '/');
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 2);
      },

      'config.get was called correctly': function () {
        assert.equal(config.get.callCount, 1);
        var args = config.get.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'static_resource_url');
      },

      'route.process': {
        setup: function () {
          request = {};
          response = { render: sinon.spy() };
          instance.process(request, response);
        },

        'response.render was called correctly': function () {
          assert.equal(response.render.callCount, 1);

          var args = response.render.args[0];
          assert.lengthOf(args, 2);

          assert.equal(args[0], 'index');

          assert.isObject(args[1]);
          assert.lengthOf(Object.keys(args[1]), 2);
          assert.isAbove(args[1].flowBeginTime, 0);
          assert.equal(args[1].staticResourceUrl, 'foo');
        }
      }
    }
  });
});
