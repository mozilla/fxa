/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');
const route = require('../../../server/lib/routes/get-index');
const config = require('../../../server/lib/configuration');
var instance, request, response;

registerSuite('routes/get-index', {
  'route interface is correct': function () {
    assert.isFunction(route);
    assert.lengthOf(route, 1);
  },

  tests: {
    'initialise route': {
      before: function () {
        instance = route(config);
      },

      tests: {
        'instance interface is correct': function () {
          assert.isObject(instance);
          assert.lengthOf(Object.keys(instance), 3);
          assert.equal(instance.method, 'get');
          assert.equal(instance.path, '/');
          assert.isFunction(instance.process);
          assert.lengthOf(instance.process, 2);
        },

        'route.process': {
          before: function () {
            request = {
              headers: {}
            };
            response = {render: sinon.spy()};
            instance.process(request, response);
          },

          tests: {
            'response.render was called correctly': function () {
              assert.equal(response.render.callCount, 1);

              var args = response.render.args[0];
              assert.lengthOf(args, 2);

              assert.equal(args[0], 'index');

              var renderParams = args[1];
              assert.isObject(renderParams);
              assert.lengthOf(Object.keys(renderParams), 5);
              assert.ok(/[0-9a-f]{64}/.exec(renderParams.flowId));
              assert.isAbove(renderParams.flowBeginTime, 0);
              assert.equal(renderParams.bundlePath, '/bundle');
              assert.equal(renderParams.staticResourceUrl, config.get('static_resource_url'));

              assert.isString(renderParams.config);
              var sentConfig = JSON.parse(decodeURIComponent(renderParams.config));

              assert.equal(sentConfig.authServerUrl, config.get('fxaccount_url'));
              assert.equal(sentConfig.env, config.get('env'));
              assert.equal(sentConfig.marketingEmailPreferencesUrl,
                config.get('marketing_email.preferences_url'));
              assert.equal(sentConfig.marketingEmailServerUrl,
                config.get('marketing_email.api_url'));
              assert.equal(sentConfig.oAuthClientId, config.get('oauth_client_id'));
              assert.equal(sentConfig.oAuthUrl, config.get('oauth_url'));
              assert.equal(sentConfig.profileUrl, config.get('profile_url'));
              assert.equal(sentConfig.scopedKeysEnabled, config.get('scopedKeys.enabled'));
              assert.ok(sentConfig.scopedKeysValidation, 'config validation is present');
              assert.equal(sentConfig.webpackPublicPath, `${config.get('static_resource_url')}/${config.get('jsResourcePath')}/`, 'correct webpackPublicPath');
            }
          }
        }
      }
    }
  }
});
