/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* jshint node: true */

var url = require('url');

/**
 * These is the environment configuration for the front-end application.
 * @param environment {String}
 *        Application environment, such as "development", "production", test"
 */
module.exports = function(environment) {
  var config = require('../lib/config');
  var oauthUriParsed = url.parse(config.get('fxaOAuth').oauth_uri);
  var oauthInternalUriParsed = url.parse(
    config.get('fxaOAuth').oauth_internal_uri
  );
  var profileUriParsed = url.parse(config.get('fxaOAuth').profile_uri);
  var baseURL = config.get('base_url');
  var oauthUri = oauthUriParsed.protocol + '//' + oauthUriParsed.host;
  var oauthInternalUri =
    oauthInternalUriParsed.protocol + '//' + oauthInternalUriParsed.host;

  var ENV = {
    modulePrefix: 'fxa-oauth-console',
    'simple-auth': {
      authorizer: 'authorizer:custom',
    },
    servers: {
      oauth: oauthUri,
      oauthInternal: oauthInternalUri,
      oauthUriParsed: oauthUriParsed,
      oauthInternalUriParsed: oauthInternalUriParsed,
      profileUriParsed: profileUriParsed,
    },
    environment: environment,
    baseURL: baseURL,
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // Production settings go here
  }

  return ENV;
};
