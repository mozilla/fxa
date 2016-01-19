/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var testElementDisabled = FunctionalHelpers.testElementDisabled;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  function testAccountNoLongerExistsErrorShown() {
    return this.parent
      .then(testElementTextInclude('.error', 'no longer exists'));
  }

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return FunctionalHelpers.clearBrowserState(this);
    },

    'with an invalid email': function () {
      return this.remote
        .then(openForceAuth({
          // TODO - this is a discrepancy and should go to the 400 page,
          // but that's for another PR.
          header: '#fxa-unexpected-error-header',
          query: {
            email: 'invalid'
          }
        }));
    },

    'with a registered email, no uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({ query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'with a registered email, invalid uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            // TODO - this is a discrepancy and should go to the 400 page,
            // but that's for another PR.
            header: '#fxa-unexpected-error-header',
            query: {
              email: email,
              uid: 'a' + accountInfo.uid
            }
          }).call(this);
        });
    },

    'with a registered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
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
        .then(createUser(email, PASSWORD, { preVerified: true }))
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
          query: { email: email }
        }))
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))

        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))

        .then(fillOutSignUp(this, email, PASSWORD, { enterEmail: false }))
        .then(testElementExists('#fxa-confirm-header'));
    },

    'with an unregistered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
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

    'forgot password flow via force-auth goes directly to confirm email screen': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({ query: { email: email }}))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        // user remembers her password, clicks the "sign in" link. They
        // should go back to the /force_auth screen.
        .then(click('.sign-in'))

        .then(testElementExists('#fxa-force-auth-header'));
    },

    'visiting the tos/pp links saves information for return': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(testRepopulateFields('/legal/terms', 'fxa-tos-header'))
        .then(testRepopulateFields('/legal/privacy', 'fxa-pp-header'));
    },

    'form prefill information is cleared after sign in->sign out': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({ query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testElementValueEquals('input[type=password]', ''));
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
});
