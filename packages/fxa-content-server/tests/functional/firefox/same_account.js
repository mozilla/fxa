/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/restmail',
  'tests/lib/helpers'
], function (intern, registerSuite, assert, require, restmail, TestHelpers) {
  'use strict';

  var config = intern.config;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var user;
  var email;

  registerSuite({
    name: 'about:accounts signup',
    /**
     * Due to a built-in "identity.fxaccounts.lastSignedInUserHash" Firefox configuration this test is
     * a combination of three other tests. We cannot clear "lastSignedInUserHash" with Selenium
     * Note: FxA Token server setting gets reset once sync account is disconnected
     *
     * This tests:
     * 1. Sign up using "about:preferences" Create Account button
     * 2. Force Auth via "about:accounts?action=reauth"
     */
    'signup and signin via about:preferences': function () {
      var self = this;
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      /**
       * Part 1: Sign up
       */

      return self.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        // open Firefox preferences
        .get(require.toUrl('about:preferences'))

        .findById('category-sync')
        .click()
        .end()

        .findByCssSelector('label[value="Create Account"]')
        .click()
        .end()

        // wait for the iframe to load
        .findById('remote')
        .end()

        // switch context to the iframe
        .switchToFrame('remote')

        // fill out the sign up form
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .pressMouseButton()
        .releaseMouseButton()
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // open a new window to validate the email
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              var emailLink = emails[0].headers['x-link'];

              return self.get('remote').execute(function (emailLink) {
                /* global window */
                window.open(emailLink, 'newwindow');

                return true;
              }, [ emailLink ]);
            });
        })

        // close the email tab
        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()
        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        // wait for the verified window in the old tab
        .findById('intro')
        .end()
        // the account should be now confirmed
        // open Firefox preferences again to check if we logged in
        .get(require.toUrl('about:preferences'))
        .findById('category-sync')
        .click()
        .end()

        .findByCssSelector('#fxaEmailAddress1')
        .end()

        // wait for the verified email
        .findByCssSelector('#fxaLoginStatus label[value="Manage"]')
        .click()
        .end()

        // being logged in on /settings is success!
        .findByCssSelector('#fxa-settings-header')
        .end()

        /**
         * Part 2: Reauth
         */
        .get(require.toUrl('about:accounts?action=reauth'))
        .switchToFrame('remote')

        .findByCssSelector('form input.password')
        .clearValue()
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        // wait for "about:accounts" manage switch
        .sleep(1000)
        .switchToFrame()

        .findByCssSelector('#manage .button-row a')
        .end()
        // disconnect sync
        .get(require.toUrl('about:preferences'))
        .findById('category-sync')
        .click()
        .end()

        .findByCssSelector('#fxaUnlinkButton')
        .click()
        .doubleClick()
        // See https://bugzilla.mozilla.org/show_bug.cgi?id=1055370
        // press space
        .pressKeys('\uE00D')
        .end()
        .acceptAlert()

        .findByCssSelector('label[value="Create Account"]')
        .click()
        .end()
        // wait for the iframe to load
        .findById('remote')
        .end();
    }
  });

});
