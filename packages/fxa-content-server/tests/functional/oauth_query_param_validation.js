/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/node_modules/dojo/node!querystring',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, Querystring, FunctionalHelpers) {
  var config = intern.config;

  var SIGNUP_ROOT = config.fxaContentRoot + 'oauth/signup';

  var TRUSTED_CLIENT_ID;
  var TRUSTED_SCOPE = 'profile';
  var UNTRUSTED_CLIENT_ID;
  var UNTRUSTED_SCOPE = 'profile:uid profile:email';
  var UNTRUSTED_NO_VALID_SCOPES = 'profile';


  var thenify = FunctionalHelpers.thenify;
  var getQueryParamValue = FunctionalHelpers.getQueryParamValue;
  var openFxaFromRp = thenify(FunctionalHelpers.openFxaFromRp);
  var openFxaFromUntrustedRp = thenify(FunctionalHelpers.openFxaFromUntrustedRp);
  var openPage = FunctionalHelpers.openPage;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;

  var openPageWithQueryParams = function (context, queryParams, expectedHeader) {
    var queryParamsString = '?' + Querystring.stringify(queryParams || {});

    return openPage(context, SIGNUP_ROOT + queryParamsString, expectedHeader);
  };

  var openSignUpExpect200 = function (context, queryParams) {
    return openPageWithQueryParams(context, queryParams, '#fxa-signup-header');
  };

  var openSignUpExpect400 = function (context, queryParams) {
    return openPageWithQueryParams(context, queryParams, '#fxa-400-header');
  };

  var testErrorInclude = function (expected) {
    return testElementTextInclude('.error', expected);
  };

  /*eslint-disable camelcase */
  registerSuite({
    name: 'oauth query parameter validation',

    before: function () {
      // get the trusted and untrusted client IDs by opening
      // FxA from the reliers. This is done instead of hard coding
      // the values because the client_ids change depending on
      // the environment.
      return this.remote
        .then(openFxaFromRp(this, 'signup'))
        .then(getQueryParamValue('client_id'))
        .then(function (clientId) {
          TRUSTED_CLIENT_ID = clientId;
        })
        .then(openFxaFromUntrustedRp(this, 'signup'))
        .then(getQueryParamValue('client_id'))
        .then(function (clientId) {
          UNTRUSTED_CLIENT_ID = clientId;
        });
    },

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true
      });
    },

    'invalid access_type': function () {
      return openSignUpExpect400(this, {
        access_type: 'invalid',
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('access_type'));
    },

    'valid access_type (offline)': function () {
      return openSignUpExpect200(this, {
        access_type: 'offline',
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE
      });
    },

    'valid access_type (online)': function () {
      return openSignUpExpect200(this, {
        access_type: 'online',
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE
      });
    },

    'missing client_id': function () {
      return openSignUpExpect400(this, {
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('missing'))
      .then(testErrorInclude('client_id'));
    },

    'empty client_id': function () {
      return openSignUpExpect400(this, {
        client_id: '',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('client_id'));
    },

    'space client_id': function () {
      return openSignUpExpect400(this, {
        client_id: ' ',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('client_id'));
    },

    'invalid client_id': function () {
      return openSignUpExpect400(this, {
        client_id: 'invalid_client_id',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('client_id'));
    },

    'unknown client_id': function () {
      return openSignUpExpect400(this, {
        client_id: 'deadbeef',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('unknown client'));
    },

    'missing keys': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE
      });
    },

    'empty keys': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        keys: '',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('keys'));
    },

    'space keys': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        keys: ' ',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('keys'));
    },

    'invalid keys': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        keys: 'asdf',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('keys'));
    },

    'valid keys (true)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        keys: 'true',
        scope: TRUSTED_SCOPE
      });
    },

    'valid keys (false)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        keys: 'false',
        scope: TRUSTED_SCOPE
      });
    },

    'empty prompt': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        prompt: '',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('prompt'));
    },

    'space prompt': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        prompt: ' ',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('prompt'));
    },

    'invalid prompt': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        prompt: 'invalid',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('prompt'));
    },

    'valid prompt (consent)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        prompt: 'consent',
        scope: TRUSTED_SCOPE
      });
    },

    'invalid redirectTo (url)': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        redirectTo: '127.0.0.1',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('redirectTo'));
    },

    'valid redirectTo (url)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        redirectTo: 'http://127.0.0.1',
        scope: TRUSTED_SCOPE
      });
    },

    'invalid redirect_uri (url)': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        redirect_uri: '127.0.0.1',
        scope: TRUSTED_SCOPE
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('redirect_uri'));
    },

    'valid redirect_uri (url)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        redirect_uri: 'http://127.0.0.1',
        scope: TRUSTED_SCOPE
      });
    },

    'missing scope': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID
      })
      .then(testErrorInclude('missing'))
      .then(testErrorInclude('scope'));
    },

    'empty scope': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: ''
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('scope'));
    },

    'space scope': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: ' '
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('scope'));
    },

    'no valid scopes (untrusted)': function () {
      return openSignUpExpect400(this, {
        client_id: UNTRUSTED_CLIENT_ID,
        scope: UNTRUSTED_NO_VALID_SCOPES
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('scope'));
    },

    'valid scope (trusted)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE
      });
    },

    'valid scope (untrusted)': function () {
      return openSignUpExpect200(this, {
        client_id: UNTRUSTED_CLIENT_ID,
        scope: UNTRUSTED_SCOPE
      });
    },

    'invalid verification_redirect': function () {
      return openSignUpExpect400(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE,
        verification_redirect: 'invalid'
      })
      .then(testErrorInclude('invalid'))
      .then(testErrorInclude('verification_redirect'));
    },

    'valid verification_redirect (always)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE,
        verification_redirect: 'always'
      });
    },

    'valid verification_redirect (no)': function () {
      return openSignUpExpect200(this, {
        client_id: TRUSTED_CLIENT_ID,
        scope: TRUSTED_SCOPE,
        verification_redirect: 'no'
      });
    }
  });
  /*eslint-enable camelcase */
});
