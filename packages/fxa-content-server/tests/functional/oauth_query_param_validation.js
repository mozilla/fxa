/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const Querystring = require('querystring');
const FunctionalHelpers = require('./lib/helpers');
const { createEmail } = require('../lib/helpers');
const config = intern._config;

const SIGNUP_ROOT = `${config.fxaContentRoot}oauth/signup`;

let TRUSTED_CLIENT_ID;
const TRUSTED_SCOPE = 'profile';
let UNTRUSTED_CLIENT_ID;
const UNTRUSTED_SCOPE = 'profile:uid profile:email';
const UNTRUSTED_NO_VALID_SCOPES = 'profile';
const TRUSTED_REDIRECT_URI = `${config.fxaOAuthApp}api/oauth`;
const UNTRUSTED_REDIRECT_URI = `${config.fxaUntrustedOauthApp}api/oauth`;
const AUTHORIZATION_ROOT = `${config.fxaContentRoot}authorization`;

var thenify = FunctionalHelpers.thenify;

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var getQueryParamValue = FunctionalHelpers.getQueryParamValue;
var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
var openFxaFromUntrustedRp = FunctionalHelpers.openFxaFromUntrustedRp;
var openPage = FunctionalHelpers.openPage;
var testElementTextInclude = FunctionalHelpers.testElementTextInclude;

var openPageWithQueryParams = thenify(function(queryParams, expectedHeader) {
  var queryParamsString = '?' + Querystring.stringify(queryParams || {});

  return this.parent.then(
    openPage(SIGNUP_ROOT + queryParamsString, expectedHeader)
  );
});

var openSignUpExpect200 = thenify(function(queryParams) {
  return this.parent.then(
    openPageWithQueryParams(queryParams, '#fxa-signup-header')
  );
});

var openSignUpExpect400 = thenify(function(queryParams) {
  return this.parent.then(
    openPageWithQueryParams(queryParams, '#fxa-400-header')
  );
});

const openAuthorizationWithQueryParams = thenify(function(
  queryParams,
  expectedHeader
) {
  var queryParamsString = '?' + Querystring.stringify(queryParams || {});

  return this.parent.then(
    openPage(AUTHORIZATION_ROOT + queryParamsString, expectedHeader)
  );
});

var testErrorInclude = function(expected) {
  return testElementTextInclude('.error', expected);
};

/*eslint-disable camelcase */
registerSuite('oauth query parameter validation', {
  beforeEach: function() {
    return this.remote
      .then(
        clearBrowserState({
          contentServer: true,
        })
      )
      .then(openFxaFromRp('signup'))
      .then(getQueryParamValue('client_id'))
      .then(function(clientId) {
        TRUSTED_CLIENT_ID = clientId;
      })
      .then(openFxaFromUntrustedRp('signup'))
      .then(getQueryParamValue('client_id'))
      .then(function(clientId) {
        UNTRUSTED_CLIENT_ID = clientId;
      });
  },
  tests: {
    'service specified': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
            service: 'sync',
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('service'));
    },

    'invalid access_type': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            access_type: 'invalid',
            client_id: TRUSTED_CLIENT_ID,
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('access_type'));
    },

    'valid access_type (offline)': function() {
      return this.remote.then(
        openSignUpExpect200({
          access_type: 'offline',
          client_id: TRUSTED_CLIENT_ID,
          redirect_uri: TRUSTED_REDIRECT_URI,
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'valid access_type (online)': function() {
      return this.remote.then(
        openSignUpExpect200({
          access_type: 'online',
          client_id: TRUSTED_CLIENT_ID,
          redirect_uri: TRUSTED_REDIRECT_URI,
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'missing client_id': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('missing'))
        .then(testErrorInclude('client_id'));
    },

    'empty client_id': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: '',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('client_id'));
    },

    'space client_id': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: ' ',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('client_id'));
    },

    'invalid client_id': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: 'invalid_client_id',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('client_id'));
    },

    'unknown client_id': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: 'deadbeefdeadbeef',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('unknown client'));
    },

    'empty prompt': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            prompt: '',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('prompt'));
    },

    'space prompt': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            prompt: ' ',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('prompt'));
    },

    'invalid prompt': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            prompt: 'invalid',
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('prompt'));
    },

    'valid prompt (consent)': function() {
      return this.remote.then(
        openSignUpExpect200({
          client_id: TRUSTED_CLIENT_ID,
          prompt: 'consent',
          redirect_uri: TRUSTED_REDIRECT_URI,
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'invalid redirectTo (url)': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            redirectTo: '127.0.0.1',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('redirectTo'));
    },

    'valid redirectTo (url)': function() {
      return this.remote.then(
        openSignUpExpect200({
          client_id: TRUSTED_CLIENT_ID,
          redirect_uri: TRUSTED_REDIRECT_URI,
          redirectTo: 'http://127.0.0.1',
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'invalid redirect_uri (url)': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            redirect_uri: '127.0.0.1',
            scope: TRUSTED_SCOPE,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('redirect_uri'));
    },

    'valid redirect_uri (url)': function() {
      return this.remote.then(
        openSignUpExpect200({
          client_id: TRUSTED_CLIENT_ID,
          redirect_uri: TRUSTED_REDIRECT_URI,
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'missing scope': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
          })
        )
        .then(testErrorInclude('missing'))
        .then(testErrorInclude('scope'));
    },

    'empty scope': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            scope: '',
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('scope'));
    },

    'space scope': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: TRUSTED_CLIENT_ID,
            scope: ' ',
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('scope'));
    },

    'no valid scopes (untrusted)': function() {
      return this.remote
        .then(
          openSignUpExpect400({
            client_id: UNTRUSTED_CLIENT_ID,
            redirect_uri: UNTRUSTED_REDIRECT_URI,
            scope: UNTRUSTED_NO_VALID_SCOPES,
          })
        )
        .then(testErrorInclude('invalid'))
        .then(testErrorInclude('scope'));
    },

    'valid scope (trusted)': function() {
      return this.remote.then(
        openSignUpExpect200({
          client_id: TRUSTED_CLIENT_ID,
          redirect_uri: TRUSTED_REDIRECT_URI,
          scope: TRUSTED_SCOPE,
        })
      );
    },

    'valid scope (untrusted)': function() {
      return this.remote.then(
        openSignUpExpect200({
          client_id: UNTRUSTED_CLIENT_ID,
          redirect_uri: UNTRUSTED_REDIRECT_URI,
          scope: UNTRUSTED_SCOPE,
        })
      );
    },

    'authorization with no action (trusted)': function() {
      return this.remote.then(
        openAuthorizationWithQueryParams(
          {
            client_id: TRUSTED_CLIENT_ID,
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          },
          '#fxa-signup-header'
        )
      );
    },

    'authorization with signin (trusted)': function() {
      return this.remote.then(
        openAuthorizationWithQueryParams(
          {
            action: 'signin',
            client_id: TRUSTED_CLIENT_ID,
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          },
          '#fxa-signin-header'
        )
      );
    },

    'authorization with force_auth with no email (trusted)': function() {
      return (
        this.remote
          // 400s because there is no email set
          .then(
            openAuthorizationWithQueryParams(
              {
                action: 'force_auth',
                client_id: TRUSTED_CLIENT_ID,
                redirect_uri: TRUSTED_REDIRECT_URI,
                scope: TRUSTED_SCOPE,
              },
              '#fxa-400-header'
            )
          )
      );
    },

    'authorization with unknown action (trusted)': function() {
      return (
        this.remote
          // 400s because there is no email set
          .then(
            openAuthorizationWithQueryParams(
              {
                action: 'unknown',
                client_id: TRUSTED_CLIENT_ID,
                redirect_uri: TRUSTED_REDIRECT_URI,
                scope: TRUSTED_SCOPE,
              },
              '#fxa-400-header'
            )
          )
      );
    },

    'authorization with force_auth (trusted)': function() {
      return this.remote.then(
        openAuthorizationWithQueryParams(
          {
            action: 'force_auth',
            client_id: TRUSTED_CLIENT_ID,
            email: createEmail(),
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          },
          '#fxa-signup-header'
        )
      );
    },

    'authorization with email (trusted)': function() {
      return this.remote.then(
        openAuthorizationWithQueryParams(
          {
            action: 'email',
            client_id: TRUSTED_CLIENT_ID,
            email: createEmail(),
            redirect_uri: TRUSTED_REDIRECT_URI,
            scope: TRUSTED_SCOPE,
          },
          '#fxa-signup-password-header'
        )
      );
    },
  },
});
/*eslint-enable camelcase */
