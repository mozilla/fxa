/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const _ = require('lodash');
const sinon = require('sinon');
const route = require('../../../server/lib/routes/redirect-m-to-adjust');
const config = require('../../../server/lib/configuration');
var instance, request, response;

registerSuite('routes/get-app', {
  tests: {
    'route interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 1);
    },

    'initialise route': {
      before: function () {
        instance = route(config);
      },
      tests: {
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
          'validates :signinCode correctly': function () {
            const validate = (val) =>
              instance.validate.params.signinCode.validate(val);

            assert.ok(validate('1234567').error); // too short
            assert.ok(validate('123456789').error); // too long
            assert.ok(validate('1234567+').error); // not URL safe base64
            assert.ok(validate('1234567/').error); // not URL safe base64

            assert.equal(validate('12345678').value, '12345678');
          },

          'validates `channel` query parameter correctly': function () {
            const validate = (val) =>
              instance.validate.query.channel.validate(val);

            assert.ok(validate('unknown-channel').error);

            assert.equal(validate('beta').value, 'beta');
            assert.equal(validate('nightly').value, 'nightly');
            assert.equal(validate('release').value, 'release');
          },
        },

        'route.process without a `channel` query parameter': {
          before: function () {
            request = {
              params: {
                signinCode: '12345678',
              },
              query: {},
            };
            response = { redirect: sinon.spy() };
            instance.process(request, response);
          },
          tests: {
            'response.redirect was called correctly': function () {
              assert.equal(response.redirect.callCount, 1);

              const statusCode = response.redirect.args[0][0];
              assert.equal(statusCode, 302);

              const targetUrl = response.redirect.args[0][1];
              assert.equal(
                targetUrl,
                _.template(config.get('sms.redirect.targetURITemplate'))({
                  channel: config.get('sms.redirect.channels.release'),
                  signinCode: '12345678',
                })
              );
            },
          },
        },

        'route.process with `channel=beta` query parameter': {
          before: function () {
            request = {
              params: {
                signinCode: '12345678',
              },
              query: {
                channel: 'beta',
              },
            };
            response = { redirect: sinon.spy() };
            instance.process(request, response);
          },
          tests: {
            'response.redirect was called correctly': function () {
              assert.equal(response.redirect.callCount, 1);

              const statusCode = response.redirect.args[0][0];
              assert.equal(statusCode, 302);

              const targetUrl = response.redirect.args[0][1];
              assert.equal(
                targetUrl,
                _.template(config.get('sms.redirect.targetURITemplate'))({
                  channel: config.get('sms.redirect.channels.beta'),
                  signinCode: '12345678',
                })
              );
            },
          },
        },

        'route.process with iOS device': {
          before: function () {
            request = {
              params: {
                signinCode: '12345678',
              },
              query: {
                channel: 'beta',
              },
              headers: {
                'user-agent':
                  'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10',
              },
            };
            response = { redirect: sinon.spy() };
            instance.process(request, response);
          },
          tests: {
            'response.redirect was called correctly': function () {
              assert.equal(response.redirect.callCount, 1);

              const statusCode = response.redirect.args[0][0];
              assert.equal(statusCode, 302);

              const targetUrl = response.redirect.args[0][1];
              assert.equal(
                targetUrl,
                _.template(config.get('sms.redirect.targetURITemplateiOS'))({
                  channel: config.get('sms.redirect.channels.beta'),
                  signinCode: '12345678',
                })
              );
            },
          },
        },
      },
    },
  },
});
