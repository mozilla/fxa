/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../../../server/lib/routes/get-config',
  'intern/dojo/node!../../../server/lib/configuration',
], function (registerSuite, assert, sinon, route, config) {
  var instance;
  var request;
  var response;

  registerSuite({
    name: 'routes/get-config',

    'route interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 0);
    },

    'initialise route': {
      setup: function () {
        instance = route();
      },

      'instance interface is correct': function () {
        assert.isObject(instance);
        assert.lengthOf(Object.keys(instance), 3);
        assert.equal(instance.method, 'get');
        assert.equal(instance.path, '/config');
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 2);
      },

      'route.process': {
        setup: function () {
          request = {
            cookies: {
              '__cookie_check': true
            },
            lang: 'db_LB'
          };
          response = {
            header: sinon.spy(),
            json: sinon.spy(),
            set: sinon.spy()
          };
          instance.process(request, response);
        },

        'response.header was called correctly': function () {
          assert.equal(response.header.callCount, 1);
          assert.isTrue(response.header.calledWith('Cache-Control', 'no-cache, max-age=0'));
        },

        'response.set was called correctly': function () {
          assert.equal(response.set.callCount, 1);
          assert.isTrue(response.set.calledWith('Vary', 'accept-language'));
        },

        'response.json was called correctly': function () {
          assert.equal(response.json.callCount, 1);
          var sentConfig = response.json.args[0][0];

          assert.deepEqual(sentConfig.allowedParentOrigins,
                           config.get('allowed_parent_origins'));
          assert.equal(sentConfig.authServerUrl, config.get('fxaccount_url'));
          assert.isTrue(sentConfig.cookiesEnabled);
          assert.equal(sentConfig.env, config.get('env'));
          assert.equal(sentConfig.language, 'db_LB');
          assert.equal(sentConfig.marketingEmailPreferencesUrl,
                       config.get('marketing_email.preferences_url'));
          assert.equal(sentConfig.marketingEmailServerUrl,
                       config.get('marketing_email.api_url'));
          assert.equal(sentConfig.oAuthClientId, config.get('oauth_client_id'));
          assert.equal(sentConfig.oAuthUrl, config.get('oauth_url'));
          assert.equal(sentConfig.profileUrl, config.get('profile_url'));
        }
      }
    }
  });
});
