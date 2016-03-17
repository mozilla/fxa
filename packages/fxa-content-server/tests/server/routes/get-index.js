/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var FLOW_ID_REGEX = /^[0-9a-f]{64}$/;

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!bluebird',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon',
], function (registerSuite, assert, Promise, path, proxyquire, sinon) {
  var activityEvent, config, route, request, response;

  registerSuite({
    name: 'routes/get-index',

    setup: function () {
      activityEvent = sinon.spy();
      config = {
        get: sinon.spy(function () {
          return 'foo';
        })
      };
      route = proxyquire(path.resolve('server/lib/routes/get-index'), {
        '../activity-event': activityEvent
      });
    },

    'interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 1);

      var instance = route(config);
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
        route(config).process(request, response);
      },

      'response.render was called correctly': function () {
        assert.equal(response.render.callCount, 1);

        var args = response.render.args[0];
        assert.lengthOf(args, 2);

        assert.equal(args[0], 'index');

        assert.isObject(args[1]);
        assert.lengthOf(Object.keys(args[1]), 3);
        assert.match(args[1].flowId, FLOW_ID_REGEX);
        assert.isAbove(args[1].flowBeginTime, 0);
        assert.equal(args[1].staticResourceUrl, 'foo');
      },

      'activityEvent was called correctly': function () {
        assert.equal(activityEvent.callCount, 1);
        assert.isTrue(activityEvent.calledAfter(response.render));

        var args = activityEvent.args[0];
        assert.lengthOf(args, 3);

        assert.equal(args[0], 'flow.begin');

        assert.isObject(args[1]);
        assert.lengthOf(Object.keys(args[1]), 3);
        assert.equal(args[1].flow_id, response.render.args[0][1].flowId);
        assert.strictEqual(args[1].flow_time, 0);
        assert.isAbove(args[1].time, 0);

        assert.equal(args[2], request);
      }
    }
  });
});
