/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const {
  clearBrowserState,
  click,
  createUser,
  fillOutForceAuth,
  fillOutSignUp,
  openForceAuth,
  testElementDisabled,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testErrorTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

function testAccountNoLongerExistsErrorShown() {
  return this.parent
    .then(testErrorTextInclude('no longer exists'));
}

const PASSWORD = 'password';
let email;

registerSuite('force_auth', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote.then(clearBrowserState());
  },
  tests: {
    'with a missing email': function () {
      return this.remote
        .then(openForceAuth({
          header: selectors['400'].HEADER
        }))
        .then(testErrorTextInclude('missing'))
        .then(testErrorTextInclude('email'));
    },

    'with an invalid email': function () {
      return this.remote
        .then(openForceAuth({
          header: selectors['400'].HEADER,
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

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'with a registered email, invalid uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(function (accountInfo) {
          return openForceAuth({
            header: selectors['400'].HEADER,
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

        .then(testElementExists(selectors.SETTINGS.HEADER));
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
          header: selectors.SIGNUP.HEADER,
          query: {email: email}
        }))
        .then(visibleByQSA('.error'))
        .then(testErrorTextInclude('recreate'))

        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, email))
        .then(testElementDisabled(selectors.SIGNUP.EMAIL))

        .then(fillOutSignUp(email, PASSWORD, {enterEmail: false}))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER));
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

        .then(click(selectors.FORCE_AUTH.LINK_RESET_PASSWORD))

        .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, email))
        .then(testElementDisabled(selectors.FORCE_AUTH.EMAIL))
        .then(testElementTextInclude(selectors.FORCE_AUTH.EMAIL_NOT_EDITABLE, email))
        // User thinks they have remembered their password, clicks the
        // "sign in" link. Go back to /force_auth.
        .then(click(selectors.RESET_PASSWORD.LINK_SIGNIN))

        .then(testElementExists(selectors.FORCE_AUTH.HEADER))
        // User goes back to reset password to submit.
        .then(click(selectors.FORCE_AUTH.LINK_RESET_PASSWORD))

        .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
        .then(click(selectors.RESET_PASSWORD.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
        // User has remembered their password, for real this time.
        // Go back to /force_auth.
        .then(click(selectors.CONFIRM_RESET_PASSWORD.LINK_SIGNIN))

        .then(testElementExists(selectors.FORCE_AUTH.HEADER))
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, email))
        .then(testElementDisabled(selectors.FORCE_AUTH.EMAIL))
        .then(testElementTextInclude(selectors.FORCE_AUTH.EMAIL_NOT_EDITABLE, email));
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

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click('#signout'))

        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.PASSWORD, ''));
    }
  }
});

function testRepopulateFields(dest, header) {
  return function () {
    return this.parent
      .then(openForceAuth({ query: { email: email }}))
      .then(type(selectors.FORCE_AUTH.PASSWORD, PASSWORD))
      .then(click('a[href="' + dest + '"]'))

      .then(testElementExists('#' + header))
      .then(click('.back'))

      .then(testElementExists(selectors.FORCE_AUTH.HEADER))
      // check the email address was re-populated
      .then(testElementValueEquals(selectors.FORCE_AUTH.PASSWORD, PASSWORD));
  };
}
