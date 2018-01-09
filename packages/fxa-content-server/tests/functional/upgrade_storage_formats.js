/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var SIGNIN_PAGE_URL = config.fxaContentRoot + 'signin';

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var createUser = FunctionalHelpers.createUser;
var openPage = FunctionalHelpers.openPage;
var testElementValueEquals = FunctionalHelpers.testElementValueEquals;

var email;

registerSuite('upgrade storage formats', {
  beforeEach: function () {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'Upgrade from Session w/o cached credentials, session invalid': function () {
      return this.remote
        .execute(function (email) {
          var namespace = '__fxa_session';
          localStorage.removeItem(namespace);
          var userData = {
            email: email,
            sessionToken: 'an invalid session token'
          };
          localStorage.setItem(namespace, JSON.stringify(userData));

        }, [email])
        .then(openPage(SIGNIN_PAGE_URL, '#fxa-signin-header'))

        // sessionToken was invalid, email should be cleared
        .then(testElementValueEquals('input[type=email]', ''));
    },

    'Upgrade from Session w/o cached Sync credentials, session valid': function () {
      return this.remote
        .then(createUser(email, 'password', {preVerified: true}))

        .then(function (accountInfo) {
          return this.parent.execute(function (email, sessionToken) {
            var namespace = '__fxa_session';
            var userData = {
              email: email,
              sessionToken: sessionToken
            };
            localStorage.setItem(namespace, JSON.stringify(userData));
          }, [email, accountInfo.sessionToken]);
        })

        .then(openPage(SIGNIN_PAGE_URL, '#fxa-signin-header'))

        // sessionToken was valid, email should be pre-filled
        .then(testElementValueEquals('input[type=email]', email));

    },

    'Upgrade from Session w/ cached Sync credentials': function () {
      return this.remote
        .then(createUser(email, 'password', {preVerified: true}))
        .then(function (accountInfo) {
          return this.parent.execute(function (email, sessionToken) {
            var userData = {
              cachedCredentials: {
                email: email,
                sessionToken: sessionToken,
                sessionTokenContext: 'sync',
                uid: 'users id'
              },
              email: 'oauth@testuser.com',
              sessionToken: 'a fake session token'
            };
            localStorage.setItem('__fxa_session', JSON.stringify(userData));
          }, [email, accountInfo.sessionToken]);
        })
        .then(openPage(SIGNIN_PAGE_URL, '#fxa-signin-header'))

        // Sync creds take precedence
        .then(testElementValueEquals('input[type=email]', email));

    },

    'Upgrade from account that has `accountData`': function () {
      return this.remote
        .execute(function (email) {
          // data is taken from localStorage of a browser profile
          // which suffered from #3466.
          localStorage.setItem('__fxa_storage.uniqueUserId', JSON.stringify('fc561101-cab6-4c2d-983e-7eedb59e5ef6'));
          localStorage.setItem('__fxa_session', JSON.stringify({}));
          localStorage.setItem('__fxa_storage.currentAccountUid', JSON.stringify('fb02d1dda57f4d19a7bc7c29a9ffa772'));
          /*eslint-disable sorting/sort-object-props */
          localStorage.setItem('__fxa_storage.accounts', JSON.stringify({
            'fb02d1dda57f4d19a7bc7c29a9ffa772': {
              'accountData': {
                'email': email,
                'uid': 'fb02d1dda57f4d19a7bc7c29a9ffa772',
                'sessionToken': '75468c96fa1f5ad69861afcf396eb127c2b30e7af9e5d5c6e295e03d8b7e8558',
                'verified': true
              },
              'assertion': {
                '_fxaClient': {
                  '_client': {
                    'request': {
                      'baseUri': 'http://127.0.0.1:9000/v1',
                      'timeout': 30000
                    }
                  },
                  '_signUpResendCount': 0,
                  '_passwordResetResendCount': 0,
                  '_interTabChannel': {}
                },
                '_audience': 'http://127.0.0.1:9010'
              },
              'oAuthClient': {},
              'profileClient': {
                'profileUrl': 'http://127.0.0.1:1111'
              },
              'fxaClient': {
                '_client': {
                  'request': {
                    'baseUri': 'http://127.0.0.1:9000/v1',
                    'timeout': 30000
                  }
                },
                '_signUpResendCount': 0,
                '_passwordResetResendCount': 0,
                '_interTabChannel': {}
              },
              'oAuthClientId': '98e6508e88680e1a',
              'uid': 'fb02d1dda57f4d19a7bc7c29a9ffa772',
              'email': email,
              'sessionToken': '75468c96fa1f5ad69861afcf396eb127c2b30e7af9e5d5c6e295e03d8b7e8558',
              'accessToken': '01abda6160a0d5864fe577d2bead1480222ae6228d014d628315d59e5efc5b3d',
              'verified': true,
              'lastLogin': 1456833973259
            }
          }));
          /*eslint-enable sorting/sort-object-props */

        }, [email])
        // success is not going to the 500 page.
        .then(openPage(SIGNIN_PAGE_URL, '#fxa-signin-header'));
    }
  }
});
