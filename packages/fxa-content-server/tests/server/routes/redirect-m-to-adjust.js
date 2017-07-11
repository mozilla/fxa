/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!bluebird',
  'intern/dojo/node!lodash',
  'intern/dojo/node!path',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../../../server/lib/routes/redirect-m-to-adjust',
  'intern/dojo/node!../../../server/lib/configuration',
], function (registerSuite, assert, Promise, _, path, sinon, route, config) {
  var instance, request, response;

  registerSuite({
    name: 'routes/get-app',

    'route interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 1);
    },

    'initialise route': {
      setup: function () {
        instance = route(config);
      },

      'instance interface is correct': function () {
        assert.isObject(instance);
        assert.lengthOf(Object.keys(instance), 4);
        assert.equal(instance.method, 'get');
        assert.equal(instance.path, '/m/:signinCode');
        assert.isObject(instance.validate);
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 2);
      },

      'route.validate': {
        'validates :signinCode correctly': function() {
          const validate = val => instance.validate.params.signinCode.validate(val);

          assert.ok(validate('1234567').error); // too short
          assert.ok(validate('123456789').error); // too long
          assert.ok(validate('1234567+').error); // not URL safe base64
          assert.ok(validate('1234567/').error); // not URL safe base64

          assert.equal(validate('12345678').value, '12345678');
        },

        'validates `channel` query parameter correctly': function() {
          const validate = val => instance.validate.query.channel.validate(val);

          assert.ok(validate('unknown-channel').error);

          assert.equal(validate('beta').value, 'beta');
          assert.equal(validate('nightly').value, 'nightly');
          assert.equal(validate('release').value, 'release');
        }
      },

      'route.process without a `channel` query parameter': {
        setup: function () {
          request = {
            params: {
              signinCode: '12345678'
            },
            query: {}
          };
          response = { redirect: sinon.spy() };
          instance.process(request, response);
        },

        'response.redirect was called correctly': function () {
          assert.equal(response.redirect.callCount, 1);

          const statusCode = response.redirect.args[0][0];
          assert.equal(statusCode, 302);

          const targetUrl = response.redirect.args[0][1];
          assert.equal(targetUrl, _.template(config.get('sms.redirect.targetURITemplate'))({
            channel: config.get('sms.redirect.channels.release'),
            signinCode: '12345678'
          }));
        }
      },

      'route.process with `channel=beta` query parameter': {
        setup: function () {
          request = {
            params: {
              signinCode: '12345678'
            },
            query: {
              channel: 'beta'
            }
          };
          response = { redirect: sinon.spy() };
          instance.process(request, response);
        },

        'response.redirect was called correctly': function () {
          assert.equal(response.redirect.callCount, 1);

          const statusCode = response.redirect.args[0][0];
          assert.equal(statusCode, 302);

          const targetUrl = response.redirect.args[0][1];
          assert.equal(targetUrl, _.template(config.get('sms.redirect.targetURITemplate'))({
            channel: config.get('sms.redirect.channels.beta'),
            signinCode: '12345678'
          }));
        }
      }
    }
  });
});
