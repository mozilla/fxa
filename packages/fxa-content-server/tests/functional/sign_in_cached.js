/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'app/scripts/lib/constants'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers, FxDesktopHelpers,
        Constants) {
  var FX_DESKTOP_V1_CONTEXT = Constants.FX_DESKTOP_V1_CONTEXT;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;

  var config = intern.config;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  // The automatedBrowser query param tells signin/up to stub parts of the flow
  // that require a functioning desktop channel
  var PAGE_SIGNIN = config.fxaContentRoot + 'signin';
  var PAGE_SIGNIN_DESKTOP = PAGE_SIGNIN + '?context=' + FX_DESKTOP_V1_CONTEXT + '&service=sync';
  var PAGE_SIGNIN_NO_CACHED_CREDS = PAGE_SIGNIN + '?email=blank';
  var PAGE_SIGNUP = config.fxaContentRoot + 'signup';
  var PAGE_SIGNUP_DESKTOP = config.fxaContentRoot + 'signup?context=' + FX_DESKTOP_V1_CONTEXT + '&service=sync';
  var PAGE_SETTINGS = config.fxaContentRoot + 'settings';


  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var PASSWORD = 'password';
  var email;
  var email2;
  var client;

  function waitForDesktopLogin(context, redirect) {
    // This will listen for the login event triggered by the submit below
    return context.remote
      .execute(function (URL) {
        addEventListener('FirefoxAccountsCommand', function (e) {
          if (e.detail.command === 'login') {
            sessionStorage.clear();

            window.location.href = URL;
          }
        });
        return true;
      }, [ redirect ]);
  }

  registerSuite({
    name: 'sign in cached',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      email2 = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return client.signUp(email2, PASSWORD, { preVerified: true });
        })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in twice, on second attempt email will be cached': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          // reset prefill and context
          return FunctionalHelpers.clearSessionStorage(self);
        })

        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    },

    'sign in first in sync context, on second attempt credentials will be cached': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN_DESKTOP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        // This will listen for the login event triggered by the submit below
        .then(function () {
          return waitForDesktopLogin(self, PAGE_SIGNIN);
        })

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    },

    'sign in once, use a different account': function () {
      return this.remote
        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        // testing to make sure "Use different account" button works
        .findByCssSelector('.use-different')
        .click()
        .end()

        // the form should not be prefilled
        .findByCssSelector('form input.email')
        .getAttribute('value')
        .then(function (val) {
          assert.equal(val, '');
        })
        .click()
        .type(email2)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        // testing to make sure cached signin comes back after a refresh
        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('form input.email')
        .getAttribute('value')
        .then(function (val) {
          assert.equal(val, '');
        })
        .end();
    },
    'sign in with cached credentials but with an expired session': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN_DESKTOP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        // signin normally, nothing in session yet
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        // This will listen for the login event triggered by the submit below
        .execute(function (email, context, URL) {
          addEventListener('FirefoxAccountsCommand', function (e) {
            if (e.detail.command === 'login') {
              var accounts = JSON.parse(localStorage.getItem('__fxa_storage.accounts'));
              var uid = Object.keys(accounts)[0];
              accounts[uid].sessionToken = 'eeead2b45791360e00b162ed37f118abbdae6ee8d3997f4eb48ee31dbdf53802';
              localStorage.setItem('__fxa_storage.accounts', JSON.stringify(accounts));

              window.location.href = URL;
            }
          });
          return true;
        }, [ email, FX_DESKTOP_V1_CONTEXT, PAGE_SIGNIN ])


        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        // Session expired error should show.
        .then(FunctionalHelpers.visibleByQSA('.error'))

        .findByCssSelector('.error').isDisplayed()
        .then(function (isDisplayed) {
          assert.isTrue(isDisplayed);
        })
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .then(function () {
          return waitForDesktopLogin(self, PAGE_SETTINGS);
        })

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    },
    'unverified cached signin with sync context redirects to confirm email': function () {
      var email = TestHelpers.createEmail();
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNUP_DESKTOP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          // reset prefill and context
          return FunctionalHelpers.clearSessionStorage(self);
        })

        .get(require.toUrl(PAGE_SIGNIN))

        // cached login should still go to email confirmation screen for unverified accounts
        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end();
    },
    'unverified cached signin redirects to confirm email': function () {
      var email = TestHelpers.createEmail();

      return this.remote
        .get(require.toUrl(PAGE_SIGNUP))
        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        // cached login should still go to email confirmation screen for unverified accounts

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end();
    },

    'sign in on desktop then sign in with prefill does not show picker': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN_DESKTOP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        // This will listen for the login event triggered by the submit below
        .then(function () {
          return waitForDesktopLogin(self, PAGE_SIGNIN + '?email=' + email2 );
        })

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('form input.email.prefilled')
        .getAttribute('value')
        .then(function (val) {
          // confirm prefilled email
          assert.ok(val.indexOf(email2) > -1);
        })
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          // reset prefill and context
          return FunctionalHelpers.clearSessionStorage(self);
        })

        // testing to make sure cached signin comes back after a refresh
        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('.prefill')
        .getVisibleText()
        .then(function (text) {
          // confirm prefilled email
          assert.ok(text.indexOf(email) > -1);
        })
        .end()

        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .end();
    },

    'sign in with desktop context then no context, desktop credentials should not persist': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN_DESKTOP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        // This will listen for the login event triggered by the submit below
        .then(function () {
          return waitForDesktopLogin(self, PAGE_SIGNIN);
        })

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        // This will clear the desktop credentials
        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .click()
        .type(email2)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          // reset prefill and context
          return FunctionalHelpers.clearSessionStorage(self);
        })

        // testing to make sure cached signin comes back after a refresh
        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('.prefill')
        .getVisibleText()
        .then(function (text) {
          // confirm prefilled email
          assert.ok(text.indexOf(email) === -1);
        })
        .end()

        .refresh()

        .findByCssSelector('.use-different')
        .end();
    },

    'overrule cached credentials': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          // reset prefill and context
          return FunctionalHelpers.clearSessionStorage(self);
        })

        .get(require.toUrl(PAGE_SIGNIN_NO_CACHED_CREDS))

        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    }


  });
});
