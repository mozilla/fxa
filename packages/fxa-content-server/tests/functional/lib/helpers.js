/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'intern/dojo/node!leadfoot/helpers/pollUntil',
  'intern/node_modules/dojo/node!url',
  'intern/node_modules/dojo/node!querystring'
], function (intern, require, restmail, TestHelpers, pollUntil,
        Url, Querystring) {
  'use strict';

  var config = intern.config;
  var CONTENT_SERVER = config.fxaContentRoot;
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SIGNUP_URL = config.fxaContentRoot + 'signup';
  var RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password';

  var EXTERNAL_SITE_URL = 'http://example.com';
  var EXTERNAL_SITE_LINK_TEXT = 'More information';

  function clearBrowserState(context, options) {
    options = options || {};

    if (! ('contentServer' in options)) {
      options.contentServer = true;
    }

    if (! ('123done' in options)) {
      options['123done'] = false;
    }

    return context.get('remote')
      .then(function () {
        if (options.contentServer) {
          return clearContentServerState(context);
        }
      })
      .then(function () {
        if (options['123done']) {
          return clear123DoneState(context);
        }
      });
  }

  function clearContentServerState(context) {
    // clear localStorage to avoid polluting other tests.
    return context.get('remote')
      // always go to the content server so the browser state is cleared,
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .getCurrentUrl()
      .then(function (url) {
        // only load up the content server if we aren't
        // already at the content server.
        if (url.indexOf(CONTENT_SERVER) === -1) {
          return context.get('remote').get(require.toUrl(CONTENT_SERVER + 'clear'))
                    .setFindTimeout(config.pageLoadTimeout)
                    .findById('fxa-clear-storage-header');
        }
      })

      .clearCookies()
      .execute(function () {
        try {
          /* global sessionStorage, localStorage */
          localStorage.clear();
          sessionStorage.clear();
        } catch(e) {
          console.log('Failed to clearBrowserState');
          // if cookies are disabled, this will blow up some browsers.
        }
        return true;
      }, []);
  }

  function clear123DoneState(context) {
    /**
     * Clearing state for 123done is a bit of a hack.
     * When the user clicks "Sign out", the buttons to signup/signin
     * are shown without waiting for the XHR request to complete.
     * If Selenium moves too quickly and loads another page before the XHR
     * request completes, the request is aborted and the user never signs out,
     * causing state to hang around and problems later on.
     *
     * To get around this, manually sign the user out by calling the
     * logout endpoint on the server, then notify Selenium when that request
     * completes by adding an element to the DOM. Selenium will look for
     * the added element.
     */
    return context.get('remote')
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .get(require.toUrl(OAUTH_APP))

      .findByCssSelector('#footer-main')
      .end()

      .execute(function () {
        /* global $ */
        $.post('/api/logout/')
            .always(function () {
              $('body').append('<div id="loggedout">Logged out</div>');
            });
      })
      .findByCssSelector('#loggedout')
      .end();
  }

  function clearSessionStorage(context) {
    // clear localStorage to avoid polluting other tests.
    return context.get('remote')
      .execute(function () {
        try {
          /* global sessionStorage */
          sessionStorage.clear();
        } catch(e) {
          console.log('Failed to clearSessionStorage');
        }
        return true;
      }, []);
  }

  /**
   * Use document.querySelectorAll to find visible elements
   * used for error and success notification animations.
   *
   * Usage:  ".then(FunctionalHelpers.visibleByQSA('.success'))"
   *
   * @param {String} selector
   *        QSA compatible selector string
   */
  function visibleByQSA(selector, timeout) {
    timeout = timeout || 10000;

    return pollUntil(function (selector) {
      /* global document */
      var match = document.querySelectorAll(selector);

      if (match.length > 1) {
        throw new Error('Multiple elements matched. Make a more precise selector');
      }

      return match[0] && match[0].offsetWidth > 0 ? true : null;
    }, [ selector ], timeout);
  }

  function getVerificationLink(user, index) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    return getVerificationHeaders(user, index)
      .then(function (headers) {
        return require.toUrl(headers['x-link']);
      });
  }

  function getVerificationHeaders(user, index) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    // restmail takes an index that is 1 based instead of 0 based.
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, index + 1)
      .then(function (emails) {
        return emails[index].headers;
      });
  }

  function openExternalSite(context) {
    return function () {
      return context.get('remote')
        .get(require.toUrl(EXTERNAL_SITE_URL))
          .findByPartialLinkText(EXTERNAL_SITE_LINK_TEXT)
        .end();
    };
  }

  function openVerificationLinkSameBrowser(context, email, index, windowName) {
    var user = TestHelpers.emailToUser(email);
    windowName = windowName || 'newwindow';

    /* global window*/

    return getVerificationLink(user, index)
      .then(function (verificationLink) {
        return context.get('remote')
          .execute(function (verificationLink, windowName) {
            var newWindow = window.open(verificationLink, windowName);

            // from http://dev.w3.org/html5/webstorage/
            // When a new top-level browsing context is created by a script in
            // an existing browsing context, then the session storage area of
            // the origin of that Document must be copied into the new
            // browsing context when it is created. From that point on,
            // however, the two session storage areas must be considered
            // separate, not affecting each other in any way.
            //
            // We want to pretend this is a new tab that the user opened using
            // CTRL-T, which does NOT copy sessionStorage over. Wipe
            // sessionStorage in this new context;
            newWindow.sessionStorage.clear();

            return true;
          }, [ verificationLink, windowName ]);
      });
  }

  function openVerificationLinkDifferentBrowser(client, email) {
    var user = TestHelpers.emailToUser(email);

    return getVerificationHeaders(user, 0)
      .then(function (headers) {
        var uid = headers['x-uid'];
        var code = headers['x-verify-code'];

        return client.verifyCode(uid, code);
      });
  }

  function openPasswordResetLinkDifferentBrowser(client, email, password) {
    var user = TestHelpers.emailToUser(email);

    return getVerificationHeaders(user, 0)
      .then(function (headers) {
        var code = headers['x-recovery-code'];
        // there is no x-recovery-token header, so we have to parse it
        // out of the link.
        var link = headers['x-link'];
        var search = Url.parse(link).query;
        var queryParams = Querystring.parse(search);
        var token = queryParams.token;

        return client.passwordForgotVerifyCode(code, token);
      })
      .then(function (result) {
        return client.accountReset(email, password, result.accountResetToken);
      });
  }

  function openFxaFromRp(context, page, urlSuffix) {
    return context.get('remote')
      .get(require.toUrl(OAUTH_APP))
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#splash .' + page)
        .click()
      .end()

      // wait until the page fully loads or else the re-load with
      // the suffix will blow its lid when run against latest.
      .findByCssSelector('#fxa-' + page + '-header')
      .end()

      .then(function () {
        if (urlSuffix) {
          return context.get('remote')
            .getCurrentUrl()
            .then(function (url) {
              url += urlSuffix;

              return context.get('remote').get(require.toUrl(url));
            });
        }
      })

      .findByCssSelector('#fxa-' + page + '-header')
      .end();
  }

  function fillOutSignIn(context, email, password) {
    return context.get('remote')
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signin page if not already at a signin page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signin(?:$|\?)/.test(currentUrl)) {
          return context.get('remote')
            .get(require.toUrl(SIGNIN_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .findByCssSelector('form input.email')
        .click()
        .clearValue()
        .type(email)
      .end()

      .findByCssSelector('form input.password')
        .click()
        .clearValue()
        .type(password)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function fillOutSignUp(context, email, password, year, customizeSync) {
    return context.get('remote')
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signup page if not already at a signup page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signup(?:$|\?)/.test(currentUrl)) {
          return context.get('remote')
            .get(require.toUrl(SIGNUP_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .findByCssSelector('form input.email')
        .click()
        .clearValue()
        .type(email)
      .end()

      .findByCssSelector('form input.password')
        .click()
        .clearValue()
        .type(password)
      .end()

      .findByCssSelector('#fxa-age-year')
      .end()

      .findById('fxa-' + year)
        .click()
      .end()

      .then(function () {
        if (customizeSync) {
          return context.get('remote')
            .findByCssSelector('form input.customize-sync')
              .click()
            .end();
        }
      })

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function fillOutResetPassword(context, email) {
    return context.get('remote')
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the reset_password page if not already at
        // the reset_password page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]reset_password(?:$|\?)/.test(currentUrl)) {
          return context.get('remote')
            .get(require.toUrl(RESET_PASSWORD_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .findByCssSelector('#fxa-reset-password-header')
      .end()

      .findByCssSelector('form input.email')
        .click()
        .clearValue()
        .type(email)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function fillOutCompleteResetPassword(context, password, vpassword) {
    return context.get('remote')
      .findById('fxa-complete-reset-password-header')
      .end()

      .findByCssSelector('#password')
        .type(password)
      .end()

      .findByCssSelector('#vpassword')
        .type(vpassword)
      .end()

      .findByCssSelector('button[type=submit]')
        .click()
      .end();
  }

  return {
    clearBrowserState: clearBrowserState,
    clearSessionStorage: clearSessionStorage,
    visibleByQSA: visibleByQSA,
    pollUntil: pollUntil,
    getVerificationLink: getVerificationLink,
    getVerificationHeaders: getVerificationHeaders,
    openExternalSite: openExternalSite,
    openVerificationLinkSameBrowser: openVerificationLinkSameBrowser,
    openVerificationLinkDifferentBrowser: openVerificationLinkDifferentBrowser,
    openPasswordResetLinkDifferentBrowser: openPasswordResetLinkDifferentBrowser,
    openFxaFromRp: openFxaFromRp,

    fillOutSignIn: fillOutSignIn,
    fillOutSignUp: fillOutSignUp,
    fillOutResetPassword: fillOutResetPassword,
    fillOutCompleteResetPassword: fillOutCompleteResetPassword
  };
});
