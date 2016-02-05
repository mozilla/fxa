/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'intern/dojo/node!leadfoot/helpers/pollUntil',
  'intern/node_modules/dojo/lang',
  'intern/node_modules/dojo/node!url',
  'intern/node_modules/dojo/node!querystring',
  'intern/chai!assert'
], function (intern, require, restmail, TestHelpers, pollUntil,
  lang, Url, Querystring, assert) {
  var config = intern.config;
  var CONTENT_SERVER = config.fxaContentRoot;
  var OAUTH_APP = config.fxaOauthApp;
  var UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SIGNUP_URL = config.fxaContentRoot + 'signup';
  var RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';

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

    if (! ('321done' in options)) {
      options['321done'] = false;
    }

    return context.remote
      .then(function () {
        if (options.contentServer) {
          return clearContentServerState(context);
        }
      })
      .then(function () {
        if (options['123done']) {
          return clear123DoneState(context);
        }
      })
      .then(function () {
        if (options['321done']) {
          return clear123DoneState(context, true);
        }
      });
  }

  function clearContentServerState(context) {
    // clear localStorage to avoid polluting other tests.
    return context.remote
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
          return context.remote.get(require.toUrl(CONTENT_SERVER + 'clear'))
                    .setFindTimeout(config.pageLoadTimeout)
                    .findById('fxa-clear-storage-header');
        }
      })

      .clearCookies()
      .execute(function () {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch(e) {
          console.log('Failed to clearBrowserState');
          // if cookies are disabled, this will blow up some browsers.
        }
        return true;
      }, []);
  }

  function clear123DoneState(context, untrusted) {
    var app = untrusted ? UNTRUSTED_OAUTH_APP : OAUTH_APP;
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
    return context.remote
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .get(require.toUrl(app))

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
    return context.remote
      .execute(function () {
        try {
          sessionStorage.clear();
        } catch(e) {
          console.log('Failed to clearSessionStorage');
        }
        return true;
      }, []);
  }

  /**
   * Use document.querySelectorAll to find loaded images.
   * Images that are loading/have loaded without error
   * will have a naturalWidth > 0, so we check for that.
   *
   * Usage:  ".then(FunctionalHelpers.imageLoadedByQSA('img'))"
   *
   * @param {String} selector
   *        QSA compatible selector string
   */
  function imageLoadedByQSA(selector, timeout) {
    timeout = timeout || 10000;

    return pollUntil(function (selector) {
      var match = document.querySelectorAll(selector);

      if (match.length > 1) {
        throw new Error('Multiple elements matched. Make a more precise selector');
      }

      return match[0] && match[0].naturalWidth > 0 ? true : null;
    }, [ selector ], timeout);
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
      var match = document.querySelectorAll(selector);

      if (match.length > 1) {
        throw new Error('Multiple elements matched. Make a more precise selector');
      }

      return match[0] && match[0].offsetWidth > 0 ? true : null;
    }, [ selector ], timeout);
  }

  function noSuchElement(context, selector) {
    return function () {
      return context.remote
        .setFindTimeout(0)

        .findByCssSelector(selector)
          .then(function () {
            throw new Error(selector + ' should not be present');
          }, function (err) {
            if (/NoSuchElement/.test(String(err))) {
              // swallow the error
              return;
            }

            throw err;
          })
        .end()

        .setFindTimeout(config.pageLoadTimeout);
    };
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
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, index + 1)()
      .then(function (emails) {
        return emails[index].headers;
      });
  }

  function openExternalSite(context) {
    return function () {
      return context.remote
        .get(require.toUrl(EXTERNAL_SITE_URL))
          .findByPartialLinkText(EXTERNAL_SITE_LINK_TEXT)
        .end();
    };
  }

  function openVerificationLinkInNewTab(context, email, index, windowName) {
    var user = TestHelpers.emailToUser(email);
    windowName = windowName || 'newwindow';

    return getVerificationLink(user, index)
      .then(function (verificationLink) {
        return context.remote.execute(openWindow, [ verificationLink, windowName ]);
      });
  }

  function openWindow (url, name) {
    var newWindow = window.open(url, name);

    // Hook up the new window to listen for WebChannel messages.
    // XXX TODO: this is pretty gross to do universally like this...
    // XXX TODO: it will go away if we can make the original tab
    //           reliably be the one to complete the oauth flow.
    newWindow.addEventListener('WebChannelMessageToChrome', function (e) {
      var command = e.detail.message.command;
      var data = e.detail.message.data;
      var element = newWindow.document.createElement('div');
      element.setAttribute('id', 'message-' + command.replace(/:/g, '-'));
      element.innerText = JSON.stringify(data);
      newWindow.document.body.appendChild(element);
    });

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

  function openSettingsInNewTab(context, windowName) {
    return context.remote.execute(openWindow, [ SETTINGS_URL, windowName ]);
  }

  function openSignInInNewTab(context, windowName) {
    return context.remote.execute(openWindow, [ SIGNIN_URL, windowName ]);
  }

  function openSignUpInNewTab(context, windowName) {
    return context.remote.execute(openWindow, [ SIGNUP_URL, windowName ]);
  }

  function openUnlockLinkDifferentBrowser(client, email) {
    var user = TestHelpers.emailToUser(email);

    return getVerificationHeaders(user, 0)
      .then(function (headers) {
        var uid = headers['x-uid'];
        var code = headers['x-unlock-code'];

        return client.accountUnlockVerifyCode(uid, code);
      });
  }

  function openFxaFromUntrustedRp(context, page, urlSuffix) {
    return openFxaFromRp(context, page, urlSuffix, true);
  }

  function reOpenWithAdditionalQueryParams(context, additionalQueryParams, waitForSelector) {
    return context.remote
      .getCurrentUrl()
      .then(function (url) {
        var parsedUrl = Url.parse(url);
        var currentQueryParams = Querystring.parse(parsedUrl.search);
        var updatedQueryParams = lang.mixin({}, currentQueryParams, additionalQueryParams);
        var urlToOpen = url + '?' + Querystring.stringify(updatedQueryParams);

        return openPage(context, urlToOpen, waitForSelector);
      });
  }

  function openFxaFromRp(context, page, urlSuffix, untrusted) {
    var app = untrusted ? UNTRUSTED_OAUTH_APP : OAUTH_APP;

    var additionalQueryParams;
    if (urlSuffix) {
      additionalQueryParams = Querystring.parse(urlSuffix.replace(/^\?/, ''));
    }

    // force_auth does not have a button on 123done, instead this is
    // only available programatically. Load the force_auth page
    // with only the email initially, then reload with the full passed
    // in urlSuffix so things like the webChannelId are correctly passed.
    if (page === 'force_auth') {
      var email = additionalQueryParams.email;
      var emailSearchString = '?' + Querystring.stringify({ email: email });
      return openPage(context, app + 'api/force_auth' + emailSearchString, '#fxa-force-auth-header')
        .then(function () {
          return reOpenWithAdditionalQueryParams(context, additionalQueryParams, '#fxa-force-auth-header');
        });
    }

    return openPage(context, app, '.ready #splash .' + page)
      .findByCssSelector('.ready #splash .' + page)
        .click()
      .end()

      // wait until the page fully loads or else the re-load with
      // the suffix will blow its lid when run against latest.
      .findByCssSelector('#fxa-' + page + '-header')
      .end()

      .then(function () {
        if (additionalQueryParams) {
          return reOpenWithAdditionalQueryParams(context, additionalQueryParams, '#fxa-' + page + '-header');
        }
      });
  }

  function fillOutSignIn(context, email, password, alwaysLoad) {
    return context.remote
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signin page if not already at a signin page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signin(?:$|\?)/.test(currentUrl) || alwaysLoad) {
          return context.remote
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

  function fillOutSignUp(context, email, password, options) {
    options = options || {};

    var customizeSync = options.customizeSync || false;
    var optInToMarketingEmail = options.optInToMarketingEmail || false;
    var age = options.age || 24;
    var submit = options.submit !== false;

    return context.remote
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signup page if not already at a signup page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signup(?:$|\?)/.test(currentUrl)) {
          return context.remote
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


      .then(function () {
        // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type 1 number,
        // split the type commands for each character to avoid issues with the test runner
        age = String(age || '24');
        var index = 0;

        function typeNext() {
          if (index >= age.length) {
            return;
          }
          var charToType = age.charAt(index);
          index++;

          return context.remote
            .findByCssSelector('#age')
              .type(charToType)
            .end()

            .then(typeNext);
        }

        return typeNext();
      })

      .then(function () {
        if (customizeSync) {
          return context.remote
            .findByCssSelector('form input.customize-sync')
              .click()
            .end();
        }
      })

      .then(function () {
        if (optInToMarketingEmail) {
          return context.remote
            .findByCssSelector('form input.marketing-email-optin')
              .click()
            .end();
        }
      })

      .then(function () {
        if (submit) {
          return context.remote
            .findByCssSelector('button[type="submit"]')
              .click()
            .end();
        }
      });
  }

  function fillOutResetPassword(context, email, options) {
    options = options || {};

    return context.remote
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the reset_password page if not already at
        // the reset_password page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]reset_password(?:$|\?)/.test(currentUrl) && ! options.skipPageRedirect) {
          return context.remote
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

  function fillOutForceAuth(context, password) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#fxa-force-auth-header')
      .end()

      .findByCssSelector('input[type=password]')
        .click()
        .type(password)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }


  function fillOutCompleteResetPassword(context, password, vpassword) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#fxa-complete-reset-password-header')
      .end()

      .findByCssSelector('#password')
        .type(password)
      .end()

      .findByCssSelector('#vpassword')
        .type(vpassword)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function fillOutChangePassword(context, oldPassword, newPassword) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#old_password')
        .click()
        .type(oldPassword)
      .end()

      .findByCssSelector('#new_password')
        .click()
        .type(newPassword)
      .end()

      .findByCssSelector('#change-password button[type="submit"]')
        .click()
      .end();
  }

  function fillOutDeleteAccount(context, password) {
    return context.remote
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#delete-account form input.password')
        .click()
        .type(password)
      .end()

      // delete account
      .findByCssSelector('#delete-account button[type="submit"]')
        .click()
      .end();
  }

  function listenForWebChannelMessage() {
    // We start listening for web channel messages as soon as
    // openPage is called, before the page is ready. Wait for
    // the prerequisites, then attach.
    function startListening() {
      if (typeof window !== 'undefined' &&
          typeof window.addEventListener === 'function') {
        addEventListener('WebChannelMessageToChrome', function (e) {
          var command = e.detail.message.command;
          var data = e.detail.message.data;

          var element = document.createElement('div');
          element.setAttribute('id', 'message-' + command.replace(/:/g, '-'));
          element.innerText = JSON.stringify(data);
          document.body.appendChild(element);
        });
      } else {
        setImmediate(startListening);
      }
    }

    startListening();
  }

  function respondToWebChannelMessage(context, expectedCommand, response) {
    return function () {
      return context.remote
        .execute(function (expectedCommand, response) {
          addEventListener('WebChannelMessageToChrome', function listener(e) {
            removeEventListener('WebChannelMessageToChrome', listener);

            var command = e.detail.message.command;
            var messageId = e.detail.message.messageId;

            if (command === expectedCommand) {
              var event = new CustomEvent('WebChannelMessageToContent', {
                detail: {
                  id: 'account_updates',
                  message: {
                    command: command,
                    data: response,
                    messageId: messageId
                  }
                }
              });

              dispatchEvent(event);
            }
          });
        }, [ expectedCommand, response ]);
    };
  }

  function commandToCssSelector(command) {
    return '#message-' + command.replace(/:/g, '-');
  }

  function testIsBrowserNotified(context, command, cb) {
    return function () {
      return context.remote
        .findByCssSelector(commandToCssSelector(command))
          .getProperty('innerText')
          .then(function (innerText) {
            var data = JSON.parse(innerText);
            if (cb) {
              cb(data);
            }
          })
        .end();
    };
  }

  function noSuchBrowserNotification(context, command) {
    return noSuchElement(context, commandToCssSelector(command));
  }

  function openPage(context, url, readySelector) {
    return context.remote
      .get(require.toUrl(url))
      .setFindTimeout(config.pageLoadTimeout)

      // WebChannel Messages can sometimes be sent before the page
      // is rendered. Try to attach a listener as early as possible.
      .execute(listenForWebChannelMessage)

      // Wait until the `readySelector` element is found to return.
      .findByCssSelector(readySelector)
      .end()

      .then(null, function (err) {
        return context.remote
          .getCurrentUrl()
            .then(function (resultUrl) {
              console.log('Error fetching %s, now at %s', url, resultUrl);
            })
          .end()

          .then(function () {
            return context.remote.takeScreenshot();
          })
          .then(function (buffer) {
            console.error('Error occurred, capturing base64 screenshot:');
            console.error(buffer.toString('base64'));

            throw err;
          });
      });
  }

  function fetchAllMetrics(context) {
    return context.remote
      .execute(function () {
        var key = '__fxa_storage.metrics_all';
        var item;
        try {
          item = JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }
        return item;
      });
  }

  function testIsEventLogged(context, eventName) {
    return testAreEventsLogged(context, [eventName]);
  }

  function testAreEventsLogged(context, eventsNames) {
    return fetchAllMetrics(context)
      .then(function (metrics) {
        var events = metrics.reduce(function (evts, metrics) {
          var evtsNames = metrics.events.map(function (evt) {
            return evt.type;
          });
          return evts.concat(evtsNames);
        }, []);

        return context.remote
          .execute(function (eventsNames, events) {
            var toFindAll = eventsNames.slice().reverse();
            var toFind = toFindAll.pop();

            events.forEach(function (event) {
              if (event === toFind) {
                toFind = toFindAll.pop();
              }
            });

            return toFindAll.length === 0;
          }, [ eventsNames, events ]);
      })
      .then(function (found) {
        assert.ok(found, 'found the events we were looking for');
      });
  }

  function testSuccessWasShown(context, selector) {
    selector = selector || '.success[data-shown]';
    return testElementWasShown(context, selector);
  }

  function testErrorWasShown(context, selector) {
    selector = selector || '.error[data-shown]';
    return testElementWasShown(context, selector);
  }

  function testElementWasShown(context, selector) {
    return function () {
      return context.remote
        .findByCssSelector(selector)
        .end()

        .executeAsync(function (selector, done) {
          // remove the attribute so subsequent checks can be made
          // against the same element. displaySuccess and displayError
          // will re-add the 'data-shown' attribute.
          $(selector).removeAttr('data-shown');
          done();
        }, [selector]);
    };
  }

  return {
    clearBrowserState: clearBrowserState,
    clearSessionStorage: clearSessionStorage,
    fetchAllMetrics: fetchAllMetrics,
    fillOutChangePassword: fillOutChangePassword,
    fillOutCompleteResetPassword: fillOutCompleteResetPassword,
    fillOutDeleteAccount: fillOutDeleteAccount,
    fillOutForceAuth: fillOutForceAuth,
    fillOutResetPassword: fillOutResetPassword,
    fillOutSignIn: fillOutSignIn,
    fillOutSignUp: fillOutSignUp,
    getVerificationHeaders: getVerificationHeaders,
    getVerificationLink: getVerificationLink,
    imageLoadedByQSA: imageLoadedByQSA,
    listenForWebChannelMessage: listenForWebChannelMessage,
    noSuchBrowserNotification: noSuchBrowserNotification,
    noSuchElement: noSuchElement,
    openExternalSite: openExternalSite,
    openFxaFromRp: openFxaFromRp,
    openFxaFromUntrustedRp: openFxaFromUntrustedRp,
    openPage: openPage,
    openPasswordResetLinkDifferentBrowser: openPasswordResetLinkDifferentBrowser,
    openSettingsInNewTab: openSettingsInNewTab,
    openSignInInNewTab: openSignInInNewTab,
    openSignUpInNewTab: openSignUpInNewTab,
    openUnlockLinkDifferentBrowser: openUnlockLinkDifferentBrowser,
    openVerificationLinkDifferentBrowser: openVerificationLinkDifferentBrowser,
    openVerificationLinkInNewTab: openVerificationLinkInNewTab,
    pollUntil: pollUntil,
    respondToWebChannelMessage: respondToWebChannelMessage,
    testAreEventsLogged: testAreEventsLogged,
    testErrorWasShown: testErrorWasShown,
    testIsBrowserNotified: testIsBrowserNotified,
    testIsEventLogged: testIsEventLogged,
    testSuccessWasShown: testSuccessWasShown,
    visibleByQSA: visibleByQSA
  };
});
