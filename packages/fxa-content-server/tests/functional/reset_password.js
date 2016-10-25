/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, nodeXMLHttpRequest,
      FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var SIGNIN_PAGE_URL = config.fxaContentRoot + 'signin';
  var RESET_PAGE_URL = config.fxaContentRoot + 'reset_password';
  var CONFIRM_PAGE_URL = config.fxaContentRoot + 'confirm_reset_password';
  var COMPLETE_PAGE_URL_ROOT = config.fxaContentRoot + 'complete_reset_password';

  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;

  var client;
  var code;
  var email;
  var token;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutCompleteResetPassword = thenify(FunctionalHelpers.fillOutCompleteResetPassword);
  var fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var type = FunctionalHelpers.type;

  var createRandomHexString = TestHelpers.createRandomHexString;

  function setTokenAndCodeFromEmail(emailAddress, emailNumber) {
    var fetchCount = emailNumber + 1;
    var user = TestHelpers.emailToUser(emailAddress);
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, fetchCount)()
      .then(function (emails) {
        // token and code are hex values
        token = emails[emailNumber].html.match(/token=([a-f\d]+)/)[1];
        code = emails[emailNumber].html.match(/code=([a-f\d]+)/)[1];
      });
  }

  function ensureFxaJSClient() {
    if (! client) {
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
    }
  }

  /**
   * Programatically initiate a reset password using the
   * FxA Client. Saves the token and code.
   */
  function initiateResetPassword(context, emailAddress, emailNumber) {
    ensureFxaJSClient();

    return client.passwordForgotSendCode(emailAddress)
      .then(function () {
        return setTokenAndCodeFromEmail(emailAddress, emailNumber);
      });
  }

  var openCompleteResetPassword = thenify(function (context, email, token, code, header) {
    var url = COMPLETE_PAGE_URL_ROOT + '?';

    var queryParams = [];
    if (email) {
      queryParams.push('email=' + encodeURIComponent(email));
    }

    if (token) {
      queryParams.push('token=' + encodeURIComponent(token));
    }

    if (code) {
      queryParams.push('code=' + encodeURIComponent(code));
    }

    url += queryParams.join('&');
    return openPage(context, url, header);
  });

  function testAtSettingsWithVerifiedMessage(context) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)
      .sleep(1000)

      .findByCssSelector('#fxa-settings-header')
      .then(null, function (err) {
        return context.remote.takeScreenshot().then(function (buffer) {
          console.error('Error occurred, capturing base64 screenshot:');
          console.error(buffer.toString('base64'));

          throw err;
        });
      })
      .end()

      .then(FunctionalHelpers.testSuccessWasShown(context));
  }

  registerSuite({
    name: 'reset password',

    beforeEach: function () {
      this.timeout = TIMEOUT;

      email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this));
    },

    'visit confirmation screen without initiating reset_password, user is redirected to /reset_password': function () {
      // user is immediately redirected to /reset_password if they have no
      // sessionToken.
      // Success is showing the screen
      return openPage(this, CONFIRM_PAGE_URL, '#fxa-reset-password-header');
    },

    'open /reset_password page from /signin': function () {
      var self = this;
      return openPage(this, SIGNIN_PAGE_URL, '#fxa-signin-header')

        .then(type('input[type=email]', email))

        .then(click('a[href="/reset_password"]'))

        .then(testElementExists('#fxa-reset-password-header'))

        // ensure there is a signin button
        .then(testElementExists('a[href="/signin"]'))

        // ensure there is a link to `Learn how Sync works`
        .then(testElementExists('a[href="https://support.mozilla.org/products/firefox/sync"]'))

        // email should not be pre-filled
        .then(testElementValueEquals('input[type=email]', ''))

        .then(function () {
          return fillOutResetPassword(self, email);
        })

        .then(testElementExists('#fxa-confirm-reset-password-header'));
    },

    'enter an email with leading whitespace': function () {
      return fillOutResetPassword(this, '   ' + email)
        .then(testElementExists('#fxa-confirm-reset-password-header'));
    },

    'enter an email with trailing whitespace': function () {
      return fillOutResetPassword(this, email + '   ')
        .then(testElementExists('#fxa-confirm-reset-password-header'));
    },

    'open confirm_reset_password page, click resend': function () {
      var user = TestHelpers.emailToUser(email);
      return fillOutResetPassword(this, email)
        .then(click('#resend'))

        .then(restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2))

        // Success is showing the success message
        .then(FunctionalHelpers.testSuccessWasShown(this))

        .then(click('#resend'))
        .then(click('#resend'))

        // Stills shows success message
        //
        // this uses .visibleByQSA instead of testSuccessWasShown because
        // the element is not re-shown, but rather should continue to
        // be visible.
        .then(FunctionalHelpers.visibleByQSA('.success'));
    },

    'open complete page with missing token shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, email, null, code, '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with malformed token shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var malformedToken = createRandomHexString(token.length - 1);
          return openCompleteResetPassword(
            self, email, malformedToken, code, '#fxa-reset-link-damaged-header')();
        });
    },

    'open complete page with invalid token shows expired screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var invalidToken = createRandomHexString(token.length);
          return openCompleteResetPassword(
            self, email, invalidToken, code, '#fxa-reset-link-expired-header')();
        });
    },

    'open complete page with empty token shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, email, '', code, '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with missing code shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, email, token, null, '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with empty code shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, email, token, '', '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with malformed code shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var malformedCode = createRandomHexString(code.length - 1);
          return openCompleteResetPassword(
            this, email, token, malformedCode, '#fxa-reset-link-damaged-header');
        });
    },

    'open complete page with missing email shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, null, token, code, '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with empty email shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, '', token, code, '#fxa-reset-link-damaged-header'
        ));
    },

    'open complete page with malformed email shows damaged screen': function () {
      return initiateResetPassword(this, email, 0)
        .then(openCompleteResetPassword(
          this, 'invalidemail', token, code, '#fxa-reset-link-damaged-header'
        ));
    },

    'reset password, verify same browser': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')

        .then(testElementExists('#fxa-complete-reset-password-header'))

        .then(fillOutCompleteResetPassword(self, PASSWORD, PASSWORD))

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        })

        .then(closeCurrentWindow())

        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        });
    },

    'reset password, verify same browser with original tab closed': function () {
      var self = this;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // user browses to another site.
        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .then(fillOutCompleteResetPassword(self, PASSWORD, PASSWORD))

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        })

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'reset password, verify same browser by replacing the original tab': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return openPage(self, verificationLink, '#fxa-complete-reset-password-header');
        })

        .then(fillOutCompleteResetPassword(self, PASSWORD, PASSWORD))

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        });
    },

    'reset password, verify in a different browser, from the original tab\'s P.O.V.': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
                      email, PASSWORD);
        })

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .then(testElementExists('#fxa-signin-header'))

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .then(type('input[type=password]', PASSWORD))

        .then(click('button[type="submit"]'))

        // no success message, the user should have seen that above.
        .then(testElementExists('#fxa-settings-header'));
    },

    'reset password, verify in a different browser, from the new browser\'s P.O.V.': function () {
      var self = this;

      self.timeout = 90 * 1000;
      return FunctionalHelpers.fillOutResetPassword(self, email)

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // clear all browser state, simulate opening in
        // a new browser
        .then(clearBrowserState(this, { contentServer: true }))

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return openPage(self, verificationLink, '#fxa-complete-reset-password-header');
        })

        .then(fillOutCompleteResetPassword(self, PASSWORD, PASSWORD))

        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        });
    }
  });

  registerSuite({
    name: 'try to re-use a link',


    beforeEach: function () {
      this.timeout = TIMEOUT;
      email = TestHelpers.createEmail();

      var self = this;
      return this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(function () {
            return initiateResetPassword(self, email, 0);
          })
          .then(clearBrowserState(this));
    },

    'complete reset, then re-open verification link, click resend': function () {
      this.timeout = TIMEOUT;

      var self = this;
      return this.remote
        .then(openCompleteResetPassword(
          this, email, token, code, '#fxa-complete-reset-password-header'
        ))
        .then(fillOutCompleteResetPassword(self, PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))

        .then(openCompleteResetPassword(
          this, email, token, code, '#fxa-reset-link-expired-header'
        ))

        .then(click('#resend'))

        .then(testElementExists('#fxa-confirm-reset-password-header'));
    }
  });


  registerSuite({
    name: 'reset_password with email specified on URL',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this));
    },

    'browse directly to page with email on query params': function () {
      var url = RESET_PAGE_URL + '?email=' + email;
      return openPage(this, url, '#fxa-reset-password-header')

        // email address should not be pre-filled from the query param.
        .then(testElementValueEquals('input[type=email]', ''))

        // ensure there is no back button when browsing directly to page
        .then(noSuchElement(this, '#fxa-tos-back'))

        // fill in email
        .then(type('input[type=email]', email))

        .then(click('button[type="submit"]'))

        .then(testElementExists('#fxa-confirm-reset-password-header'));
    }
  });


  registerSuite({
    name: 'password change while at confirm_reset_password screen',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      ensureFxaJSClient();

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this));
    },

    'original page transitions after completion': function () {
      return fillOutResetPassword(this, email)
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(function () {
          return client.signIn(email, PASSWORD);
        })
        .then(function (accountInfo) {
          return client.passwordChange(email, PASSWORD, 'newpassword', {
            sessionToken: accountInfo.sessionToken
          });
        })

        .then(testElementExists('#fxa-signin-header'));
    }
  });

  registerSuite({
    name: 'reset_password with unknown email',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(clearBrowserState(this));
    },

    'open /reset_password page, enter unknown email, wait for error': function () {
      return fillOutResetPassword(this, email)
        // The error area shows a link to /signup
        .then(FunctionalHelpers.visibleByQSA('.error'))

        .then(click('.error a[href="/signup"]'))

        .then(testElementExists('#fxa-signup-header'))

        // check the email address was written
        .then(testElementValueEquals('input[type=email]', email));
    }
  });
});
