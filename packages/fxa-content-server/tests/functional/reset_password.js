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
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
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
   * Programatically initiate a password reset using the
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

  function testSuccessMessageVisible(context, message) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)

      .then(FunctionalHelpers.visibleByQSA('.success'))
      .findByCssSelector('.success')
        .getVisibleText()
        .then(function (text) {
          var searchFor = new RegExp(message, 'i');
          assert.isTrue(searchFor.test(text));
        })
      .end();
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

      .then(function () {
        return testSuccessMessageVisible(context, 'verified');
      });
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

        .findByCssSelector('input[type="email"]')
          .clearValue()
          .click()
          .type(email)
        .end()

        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header')
        .end()

        // ensure there is a back button
        .findById('back')
        .end()

        // email should be pre-filled
        .findByCssSelector('input[type="email"]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end()


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

        .findByCssSelector('input[type=email]')
          .click()
          .clearValue()
          .type(email)
        .end()

        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header')
        .end()

        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end();
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
        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .findById('resend')
          .click()
        .end()

        .findById('resend')
          .click()
        .end()

        // Stills shows success message
        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end();
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
          return FunctionalHelpers.openVerificationLinkSameBrowser(
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

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        // user browses to another site.
        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
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

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

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
        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(function () {
          return testSuccessMessageVisible(self, 'reset');
        })

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // no success message, the user should have seen that above.
        .findByCssSelector('#fxa-settings-header')
        .end();
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
              return FunctionalHelpers.openVerificationLinkSameBrowser(
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

            .then(FunctionalHelpers.visibleByQSA('.success'))
            .end()

            .findByCssSelector('#signout')
              .click()
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .findByCssSelector('#fxa-settings-header')
            .end();
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
        .findByCssSelector('form input.email')
          .getAttribute('value')
          .then(function (resultText) {
            // email address should be pre-filled from the query param.
            assert.equal(resultText, email);
          })
        .end()

        // ensure there is no back button when browsing directly to page
        .then(Test.noElementById(self, 'fxa-tos-back'))

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

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
        .then(FunctionalHelpers.visibleByQSA('.error a[href="/signup"]'))
        .findByCssSelector('.error a[href="/signup"]')
          .click()
        .end()

        .findById('fxa-signup-header')
        .end()

        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end();
    }
  });
});
