/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var clearBrowserState = FunctionalHelpers.clearBrowserState;
var click = FunctionalHelpers.click;
var createUser = FunctionalHelpers.createUser;
var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
var openForceAuth = FunctionalHelpers.openForceAuth;
var testElementDisabled = FunctionalHelpers.testElementDisabled;
var testElementExists = FunctionalHelpers.testElementExists;
var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
var testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;
var type = FunctionalHelpers.type;
var visibleByQSA = FunctionalHelpers.visibleByQSA;

function testAccountNoLongerExistsErrorShown() {
  return this.parent
    .then(testErrorTextInclude('no longer exists'));
}

var PASSWORD = 'password';
var email;

registerSuite('force_auth', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote.then(clearBrowserState());
  },
  tests: {
    'with a missing email': function () {
      return this.remote
        .then(openForceAuth({
          header: '#fxa-400-header'
        }))
        .then(testErrorTextInclude('missing'))
        .then(testErrorTextInclude('email'));
    },

    'with an invalid email': function () {
      return this.remote
        .then(openForceAuth({
          header: '#fxa-400-header',
          query: {
            email: 'invalid'
          }
        }))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with a registered email, no uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openForceAuth({query: {email: email}}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'with a registered email, invalid uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(function (accountInfo) {
          return openForceAuth({
            header: '#fxa-400-header',
            query: {
              email: email,
              uid: 'a' + accountInfo.uid
            }
          }).call(this);
        })
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'with a registered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              email: email,
              uid: accountInfo.uid
            }
          }).call(this);
        })
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'with a registered email, unregistered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openForceAuth({
          query: {
            email: email,
            uid: TestHelpers.createUID()
          }
        }))
        .then(testAccountNoLongerExistsErrorShown);
    },

    'with an unregistered email, no uid': function () {
      return this.remote
        .then(openForceAuth({
          header: '#fxa-signup-header',
          query: {email: email}
        }))
        .then(visibleByQSA('.error'))
        .then(testErrorTextInclude('recreate'))

        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))

        .then(fillOutSignUp(email, PASSWORD, {enterEmail: false}))
        .then(testElementExists('#fxa-confirm-header'));
    },

    'with an unregistered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              email: 'a' + email,
              uid: accountInfo.uid
            }
          }).call(this);
        })

        // user stays on the force_auth page but cannot continue, broker
        // does not support uid change
        .then(testAccountNoLongerExistsErrorShown);
    },

    'with an unregistered email, unregistered uid': function () {
      return this.remote
        .then(openForceAuth({
          query: {
            email: email,
            uid: TestHelpers.createUID()
          }
        }))

        // user stays on the force_auth page but cannot continue, broker
        // does not support uid change
        .then(testAccountNoLongerExistsErrorShown);
    },

    'forgot password flow via force_auth': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openForceAuth({query: {email: email}}))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'))
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))
        .then(testElementTextInclude('.prefillEmail', email))

        // User thinks they have remembered their password, clicks the
        // "sign in" link. Go back to /force_auth.
        .then(click('.sign-in'))

        .then(testElementExists('#fxa-force-auth-header'))
        // User goes back to reset password to submit.
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        // User has remembered their password, for real this time.
        // Go back to /force_auth.
        .then(click('.sign-in'))

        .then(testElementExists('#fxa-force-auth-header'))
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))
        .then(testElementTextInclude('.prefillEmail', email));
    },

    'visiting the tos/pp links saves information for return': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(testRepopulateFields('/legal/terms', 'fxa-tos-header'))
        .then(testRepopulateFields('/legal/privacy', 'fxa-pp-header'));
    },

    'form prefill information is cleared after sign in->sign out': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openForceAuth({query: {email: email}}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testElementValueEquals('input[type=password]', ''));
    }
  }
});

function testRepopulateFields(dest, header) {
  return function () {
    return this.parent
      .then(openForceAuth({ query: { email: email }}))
      .then(type('input[type=password]', PASSWORD))
      .then(click('a[href="' + dest + '"]'))

      .then(testElementExists('#' + header))
      .then(click('.back'))

      .then(testElementExists('#fxa-force-auth-header'))
      // check the email address was re-populated
      .then(testElementValueEquals('input[type=password]', PASSWORD));
  };
}
