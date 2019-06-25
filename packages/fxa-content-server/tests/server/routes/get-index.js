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
  'route interface is correct': function() {
    assert.isFunction(route);
    assert.lengthOf(route, 1);
  },

  tests: {
    'initialise route': {
      before: function() {
        instance = route(config);
      },

      after: () => {
        instance.terminate();
      },

      tests: {
        'instance interface is correct': function() {
          assert.isObject(instance);
          assert.lengthOf(Object.keys(instance), 4);
          assert.equal(instance.method, 'get');
          assert.equal(instance.path, '/');
          assert.isFunction(instance.process);
          assert.lengthOf(instance.process, 2);
        },

        'route.process with no context': {
          before: function() {
            request = {
              headers: {},
              query: {},
            };
            response = { render: sinon.spy() };
            return instance.process(request, response);
          },

          tests: {
            'response.render was called correctly': function() {
              assert.equal(response.render.callCount, 1);

              var args = response.render.args[0];
              assert.lengthOf(args, 2);

              assert.equal(args[0], 'index');

              var renderParams = args[1];
              assert.isObject(renderParams);
              assert.lengthOf(Object.keys(renderParams), 6);
              assert.ok(/[0-9a-f]{64}/.exec(renderParams.flowId));
              assert.isAbove(renderParams.flowBeginTime, 0);
              assert.equal(renderParams.bundlePath, '/bundle');
              assert.isObject(
                JSON.parse(decodeURIComponent(renderParams.featureFlags))
              );
              assert.equal(
                renderParams.staticResourceUrl,
                config.get('static_resource_url')
              );

              assert.isString(renderParams.config);
              var sentConfig = JSON.parse(
                decodeURIComponent(renderParams.config)
              );

              assert.equal(
                sentConfig.authServerUrl,
                config.get('fxaccount_url')
              );
              assert.equal(sentConfig.env, config.get('env'));
              assert.equal(
                sentConfig.marketingEmailEnabled,
                config.get('marketing_email.enabled')
              );
              assert.equal(
                sentConfig.marketingEmailPreferencesUrl,
                config.get('marketing_email.preferences_url')
              );
              assert.equal(
                sentConfig.oAuthClientId,
                config.get('oauth_client_id')
              );
              assert.equal(sentConfig.oAuthUrl, config.get('oauth_url'));
              assert.equal(
                sentConfig.pairingChannelServerUri,
                config.get('pairing.server_base_uri')
              );
              assert.equal(sentConfig.profileUrl, config.get('profile_url'));
              assert.equal(
                sentConfig.scopedKeysEnabled,
                config.get('scopedKeys.enabled')
              );
              assert.ok(
                sentConfig.scopedKeysValidation,
                'config validation is present'
              );
              assert.deepEqual(
                sentConfig.subscriptions,
                config.get('subscriptions')
              );
              assert.equal(
                sentConfig.webpackPublicPath,
                `${config.get('static_resource_url')}/${config.get(
                  'jsResourcePath'
                )}/`,
                'correct webpackPublicPath'
              );
            },
          },
        },

        'route.process with context=fx_desktop_v1': {
          before: function() {
            request = {
              headers: {},
              originalUrl:
                'https://accounts.firefox.com/?context=fx_desktop_v1&service=sync',
              query: {
                context: 'fx_desktop_v1',
                service: 'sync',
              },
            };
            response = { redirect: sinon.spy() };
            return instance.process(request, response);
          },

          tests: {
            'response.redirect was called correctly': function() {
              assert.isTrue(
                response.redirect.calledOnceWith(
                  '/update_firefox?context=fx_desktop_v1&service=sync'
                )
              );
            },
          },
        },

        'route.process with context=fx_desktop_v2': {
          before: function() {
            request = {
              headers: {},
              originalUrl:
                'https://accounts.firefox.com/?context=fx_desktop_v2&service=sync',
              query: {
                context: 'fx_desktop_v2',
                service: 'sync',
              },
            };
            response = { redirect: sinon.spy() };
            return instance.process(request, response);
          },

          tests: {
            'response.redirect was called correctly': function() {
              assert.isTrue(
                response.redirect.calledOnceWith(
                  '/update_firefox?context=fx_desktop_v2&service=sync'
                )
              );
            },
          },
        },

        'route.process with context=fx_desktop_v3': {
          before: function() {
            request = {
              headers: {},
              originalUrl:
                'https://accounts.firefox.com/?context=fx_desktop_v3&service=sync',
              query: {
                context: 'fx_desktop_v3',
                service: 'sync',
              },
            };
            response = { render: sinon.spy() };
            return instance.process(request, response);
          },

          tests: {
            'response.render was called correctly': function() {
              assert.isTrue(response.render.calledOnceWith('index'));
            },
          },
        },
      },
    },
  },
});
