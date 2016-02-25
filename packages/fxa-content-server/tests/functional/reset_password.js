/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, require, nodeXMLHttpRequest,
      FxaClient, restmail, TestHelpers, FunctionalHelpers, Test) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var SIGNIN_PAGE_URL = config.fxaContentRoot + 'signin';
  var RESET_PAGE_URL = config.fxaContentRoot + 'reset_password';
  var CONFIRM_PAGE_URL = config.fxaContentRoot + 'confirm_reset_password';
  var COMPLETE_PAGE_URL_ROOT = config.fxaContentRoot + 'complete_reset_password';

  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;
  var email;
  var code;
  var token;
  var client;

  var click = FunctionalHelpers.click;
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

  /**
   * Fill out the reset password form
   */
  function fillOutResetPassword(context, email) {
    return FunctionalHelpers.fillOutResetPassword(context, email);
  }

  /**
   * Programatically initiate a reset password using the
   * FxA Client. Saves the token and code.
   */
  function initiateResetPassword(context, emailAddress, emailNumber) {
    return client.passwordForgotSendCode(emailAddress)
      .then(function () {
        return setTokenAndCodeFromEmail(emailAddress, emailNumber);
      });
  }

  function openCompleteResetPassword(context, email, token, code) {
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
    return context.remote.get(require.toUrl(url))
      .setFindTimeout(intern.config.pageLoadTimeout);
  }

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
    name: 'reset_password flow',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      var self = this;
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true })
          .then(function () {
            // clear localStorage to avoid pollution from other tests.
            return FunctionalHelpers.clearBrowserState(self);
          });
    },

    'visit confirmation screen without initiating reset_password, user is redirected to /reset_password': function () {
      return this.remote
        .get(require.toUrl(CONFIRM_PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        // user is immediately redirected to /reset_password if they have no
        // sessionToken.
        // Success is showing the screen
        .findById('fxa-reset-password-header')
        .end();
    },

    'open /reset_password page from /signin': function () {
      var self = this;
      return this.remote
        .get(require.toUrl(SIGNIN_PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .then(type('input[type="email"]', email))

        .then(click('a[href="/reset_password"]'))

        .findById('fxa-reset-password-header')
        .end()

        // ensure there is a signin button
        .then(testElementExists('a[href="/signin"]'))

        // ensure there is a link to `Learn how Sync works`
        .then(testElementExists('a[href="https://support.mozilla.org/en-US/products/firefox/sync"]'))

        // email should not be pre-filled
        .then(testElementValueEquals('input[type="email"]', ''))

        .then(function () {
          return fillOutResetPassword(self, email);
        })

        .findById('fxa-confirm-reset-password-header')
        .end();
    },

    'open /reset_password from /signin with partial email': function () {
      var self = this;
      email = 'partial';

      return self.remote
        .get(require.toUrl(SIGNIN_PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .then(type('input[type=email]', email))

        .then(click('a[href="/reset_password"]'))

        .findById('fxa-reset-password-header')
        .end()

        // Email should not be written
        .then(testElementValueEquals('input[type=email]', ''));
    },


    'enter an email with leading whitespace': function () {
      return fillOutResetPassword(this, '   ' + email)
        .findById('fxa-confirm-reset-password-header')
        .end();
    },

    'enter an email with trailing whitespace': function () {
      return fillOutResetPassword(this, email + '   ')
        .findById('fxa-confirm-reset-password-header')
        .end();
    },

    'open confirm_reset_password page, click resend': function () {
      var user = TestHelpers.emailToUser(email);
      return fillOutResetPassword(this, email)
        .findById('resend')
          .click()
        .end()

        .then(restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2))

        // Success is showing the success message
        .then(FunctionalHelpers.testSuccessWasShown(this))

        .findById('resend')
          .click()
          .click()
        .end()

        // Stills shows success message
        //
        // this uses .visibleByQSA instead of testSuccessWasShown because
        // the element is not re-shown, but rather should continue to
        // be visible.
        .then(FunctionalHelpers.visibleByQSA('.success'));
    },

    'open complete page with missing token shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          return openCompleteResetPassword(self, email, null, code)
            .findById('fxa-reset-link-damaged-header')
            .end();
        });

    },

    'open complete page with malformed token shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var malformedToken = createRandomHexString(token.length - 1);
          return openCompleteResetPassword(self, email, malformedToken, code)
            .findById('fxa-reset-link-damaged-header')
            .end()

            .then(FunctionalHelpers.noSuchElement(self, '#fxa-reset-link-expired-header'));
        });
    },

    'open complete page with invalid token shows expired screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var invalidToken = createRandomHexString(token.length);
          return openCompleteResetPassword(self, email, invalidToken, code)
            .findById('fxa-reset-link-expired-header')
            .end()

            .then(FunctionalHelpers.noSuchElement(self, '#fxa-reset-link-damaged-header'));
        });
    },

    'open complete page with missing code shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          return openCompleteResetPassword(self, email, token, null)
            .findById('fxa-reset-link-damaged-header')
            .end();
        });
    },

    'open complete page with malformed code shows damanged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          var malformedCode = createRandomHexString(code.length - 1);
          return openCompleteResetPassword(self, email, token, malformedCode)
            .findById('fxa-reset-link-damaged-header')
            .end();
        });
    },

    'open complete page with missing email shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          return openCompleteResetPassword(self, null, token, code)
            .findById('fxa-reset-link-damaged-header')
            .end();
        });
    },

    'open complete page with malformed email shows damaged screen': function () {
      var self = this;
      return initiateResetPassword(this, email, 0)
        .then(function () {
          return openCompleteResetPassword(self, 'invalidemail', token, code)
            .findById('fxa-reset-link-damaged-header')
            .end();
        });
    },

    'reset password, verify same browser': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')

        .findById('fxa-complete-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        })

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

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

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        })

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('');
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
          return self.remote
            .get(require.toUrl(verificationLink))
            .setFindTimeout(intern.config.pageLoadTimeout);
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        });
    },

    'reset password, verify in a different browser, from the original tab\'s P.O.V.': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return FunctionalHelpers.fillOutResetPassword(self, email)

        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
                      client, email, PASSWORD);
        })

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .then(testElementExists('#fxa-signin-header'))

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .then(click('button[type="submit"]'))

        // no success message, the user should have seen that above.
        .then(testElementExists('#fxa-settings-header'));
    },

    'reset password, verify in a different browser, from the new browser\'s P.O.V.': function () {
      var self = this;

      self.timeout = 90 * 1000;
      return FunctionalHelpers.fillOutResetPassword(self, email)

        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          // clear all browser state, simulate opening in a new
          // browser
          return FunctionalHelpers.clearBrowserState(self, {
            contentServer: true
          });
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote
            .get(require.toUrl(verificationLink))
            .setFindTimeout(intern.config.pageLoadTimeout);
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
                      self, PASSWORD, PASSWORD);
        })

        .then(function () {
          return testAtSettingsWithVerifiedMessage(self);
        });
    },

    'verifying a reset password unlocks an account': function () {
      var self = this;
      self.timeout = 90 * 1000;
      return client.accountLock(email, PASSWORD)
        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email)
            .findById('fxa-confirm-reset-password-header')
            .end()

            .then(function () {
              return FunctionalHelpers.openVerificationLinkInNewTab(
                          self, email, 0);
            })

            // Complete the reset password in the new tab
            .switchToWindow('newwindow')

            .findById('fxa-complete-reset-password-header')
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
            })

            // this tab's success is seeing the reset password complete header.
            .then(function () {
              return testAtSettingsWithVerifiedMessage(self);
            })

            .closeCurrentWindow()
            // switch to the original window
            .switchToWindow('')

            .findByCssSelector('#fxa-settings-header')
            .end()

            .then(FunctionalHelpers.testSuccessWasShown(self))

            .then(click('#signout'))

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .then(testElementExists('#fxa-settings-header'));
        });
    }
  });

  registerSuite({
    name: 'try to re-use a link',


    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
          .then(function () {
            return initiateResetPassword(self, email, 0);
          })
          .then(function () {
            // clear localStorage to avoid pollution from other tests.
            return FunctionalHelpers.clearBrowserState(self);
          });
    },

    'complete reset, then re-open verification link, click resend': function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      var self = this;
      return openCompleteResetPassword(self, email, token, code)
        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
        })

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          return openCompleteResetPassword(self, email, token, code);
        })

        .findById('fxa-reset-link-expired-header')
        .end()

        .findById('resend')
          .click()
        .end()

        .findById('fxa-confirm-reset-password-header')
        .end();
    }
  });


  registerSuite({
    name: 'reset_password with email specified on URL',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'browse directly to page with email on query params': function () {
      var url = RESET_PAGE_URL + '?email=' + email;
      var self = this;
      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)

        // email address should not be pre-filled from the query param.
        .then(testElementValueEquals('form input.email'), '')

        // ensure there is no back button when browsing directly to page
        .then(Test.noElementById(self, 'fxa-tos-back'))

        // fill in email
        .then(type('form input.email', email))

        .then(click('button[type="submit"]'))

        .findById('fxa-confirm-reset-password-header')
        .end();
    }
  });


  registerSuite({
    name: 'confirm_reset_password page transition',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'original page transitions after completion': function () {
      return fillOutResetPassword(this, email)
        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return client.passwordChange(email, PASSWORD, 'newpassword');
        })

        .findById('fxa-signin-header')
        .end();
    }
  });

  registerSuite({
    name: 'reset_password with unknown email',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    'open /reset_password page, enter unknown email, wait for error': function () {
      return fillOutResetPassword(this, email)
        // The error area shows a link to /signup
        .then(FunctionalHelpers.visibleByQSAErrorHeight('.error a[href="/signup"]'))

        .then(click('.error a[href="/signup"]'))

        .findById('fxa-signup-header')
        .end()

        // check the email address was written
        .then(testElementValueEquals('input[type=email]', email));
    }
  });
});
