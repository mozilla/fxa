/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'intern/dojo/node!leadfoot/helpers/pollUntil',
  'intern/browser_modules/dojo/node!url',
  'intern/browser_modules/dojo/node!querystring',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'intern/chai!assert',
  'app/bower_components/fxa-js-client/fxa-client',
  'intern/dojo/node!got'
], function (intern, require, restmail, TestHelpers, pollUntil,
  Url, Querystring, nodeXMLHttpRequest, assert, FxaClient, got) {
  const config = intern.config;

  const AUTH_SERVER_ROOT = config.fxaAuthRoot;
  const CONTENT_SERVER = config.fxaContentRoot;
  const EXTERNAL_SITE_LINK_TEXT = 'More information';
  const EXTERNAL_SITE_URL = 'http://example.com';
  const FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth';
  const OAUTH_APP = config.fxaOauthApp;
  const RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password';
  const SETTINGS_URL = config.fxaContentRoot + 'settings';
  const SIGNIN_URL = config.fxaContentRoot + 'signin';
  const SIGNUP_URL = config.fxaContentRoot + 'signup';
  const UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;

  /**
   * Convert a function to a form that can be used as a `then` callback.
   *
   * Example usage:
   *
   * const fillOutSignUp = thenify(function (email, password) {
   *  return this.parent
   *    .then(....
   * });
   *
   * ...
   * .then(fillOutSignUp(email, password))
   * ...
   *
   * @param {function} callback - Function to convert
   * @param {object} [context] - in which to call callback
   * @returns {function} that can be used in a promise
   */
  function thenify(callback, context) {
    return function () {
      var args = arguments;
      return function () {
        return callback.apply(context || this, args);
      };
    };
  }

  /**
   * Take a screen shot, write a base64 encoded image to the console
   */
  const takeScreenshot = thenify(function () {
    return this.parent.takeScreenshot()
      .then(function (buffer) {
        const screenCaptureHost = 'https://screencap.co.uk';
        return got.post(`${screenCaptureHost}/png`, { body: buffer, followRedirect: false })
          .then((res) => {
            console.log(`Screenshot saved at: ${screenCaptureHost}${res.headers.location}`);
          }, (err) => {
            console.error('Capturing base64 screenshot:');
            console.error(`data:image/png;base64,${buffer.toString('base64')}`);
          });
      });
  });

  /**
   * Use document.querySelectorAll to find visible elements
   * used for error and success notification animations.
   *
   *
   * Usage:  ".then(FunctionalHelpers.visibleByQSA('.success'))"
   *
   * @param {String} selector
   *        QSA compatible selector string
   * @param {Object} options
   *        options include polling `timeout`
   */
  const visibleByQSA = thenify(function (selector, options) {
    options = options || {};
    var timeout = options.timeout || config.pageLoadTimeout;
    var pollError;

    return this.parent
      .then(pollUntil(function (selector, options) {
        var matchingEls = document.querySelectorAll(selector);

        if (matchingEls.length === 0) {
          return null;
        }

        if (matchingEls.length > 1) {
          throw new Error('Multiple elements matched. Make a more precise selector - ' + selector);
        }

        var matchingEl = matchingEls[0];

        // Check if the element is visible. This is from jQuery source - see
        // https://github.com/jquery/jquery/blob/e1b1b2d7fe5aff907a9accf59910bc3b7e4d1dec/src/css/hiddenVisibleSelectors.js#L12
        if (! (matchingEl.offsetWidth || matchingEl.offsetHeight || matchingEl.getClientRects().length)) {
          return null;
        }

        // use jQuery if available to check for jQuery animations.
        if (typeof $ !== 'undefined' && $(selector).is(':animated')) {
          // If the element is animating, try again after a delay. Clicks
          // do not always register if the element is in the midst of
          // an animation.
          return null;
        }

        return true;
      }, [ selector, options ], timeout))
      .then(null, function (err) {
        // The error has to be swallowed before a screenshot
        // can be taken or else takeScreenshot is never called
        // because `this.parent` is a promise that has already
        // been rejected.
        pollError = err;
      })
      .then(() => {
        if (pollError) {
          return this.parent.then(takeScreenshot())
            .then(() => {
              throw pollError;
            });
        }
      });
  });


  /**
   * Click an element
   *
   * @param {string} selector
   * @returns {promise}
   */
  const click = thenify(function (selector) {
    return this.parent
      .findByCssSelector(selector)
        // Ensure the element is visible and not animating before attempting to click.
        // Sometimes clicks do not register if the element is in the middle of an animation.
        .then(visibleByQSA(selector))
        .click()
      .end();
  });

  /**
   * Force a focus event to fire on an element.
   *
   * @param {string} [selector] - selector of element - defaults to the window.
   * @returns {promise} - resolves when complete
   */
  const focus = thenify(function (selector) {
    return this.parent
      .execute(function (selector) {
        // The only way to reliably cause a Focus Event is to manually create
        // one. Just clicking or focusing the window does not work if the
        // Selenium window is not in focus. This does however. BAM! See the
        // conversation in
        // https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/1671
        // The hint is: "... a hack to work around synthesized events not behaving properly"
        var target = selector ? document.querySelector(selector) : window;
        var event = new FocusEvent('focus');
        target.dispatchEvent(event);
      }, [ selector ]);
  });

  /**
   * Type text into an input element
   *
   * @param {string} selector
   * @param {string} text
   * @param {object} [options] options
   *   @param {boolean [options.clearValue] - clear element value before
   *   typing. Defaults to true.
   * @returns {promise}
   */
  const type = thenify(function (selector, text, options) {
    options = options || {};

    // always clear unless explicitly overridden
    var clearValue = options.clearValue !== false;

    text = String(text);

    return this.parent
      .then(click(selector))
      .findByCssSelector(selector)

        .then(function () {
          if (clearValue) {
            return this.parent.clearValue();
          }
        })

        .getAttribute('type')
        .then(function (type) {
          // xxx: bug in selenium 2.47.1, if firefox is out of
          // focus it will just type 1 number, split the type
          // commands for each character to avoid issues with the
          // test runner
          if (type === 'number') {
            var index = 0;
            var parent = this.parent;

            var typeNext = function () {
              if (index >= text.length) {
                return;
              }
              var charToType = text.charAt(index);
              index++;

              return parent
                .type(charToType)
                .then(typeNext);
            };

            return typeNext.call(this);
          } else {
            return this.parent.type(text);
          }
        })

      .end();
  });

  /**
   * Check to ensure an element exists
   *
   * @param {string} selector
   * @returns {promise} rejects if element does not exist
   */
  const testElementExists = thenify(function (selector) {
    var findError;
    return this.parent
      .findByCssSelector(selector)
      .then(null, function (err) {
        // The error has to be swallowed before a screenshot
        // can be taken or else takeScreenshot is never called
        // because `this.parent` is a promise that has already
        // been rejected.
        findError = err;
      })
      .then(function () {
        if (findError) {
          return this.parent.then(takeScreenshot())
            .then(() => {
              throw findError;
            });
        }
      })
      .end();
  });

  const clearContentServerState = thenify(function (options) {
    options = options || {};
    // clear localStorage to avoid polluting other tests.
    return this.parent
      // always go to the content server so the browser state is cleared,
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .getCurrentUrl()
      .then(function (url) {
        // only load up the content server if we aren't
        // already at the content server.
        if (url.indexOf(CONTENT_SERVER) === -1 || options.force) {
          return this.parent.get(require.toUrl(CONTENT_SERVER + 'clear'))
                    .setFindTimeout(config.pageLoadTimeout)
                    .findById('fxa-clear-storage-header');
        }
      })

      .clearCookies()
      .execute(function () {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.log('Failed to clearBrowserState');
          // if cookies are disabled, this will blow up some browsers.
        }
        return true;
      }, []);
  });

  const clear123DoneState = thenify(function (options) {
    options = options || {};

    var app = options.untrusted ? UNTRUSTED_OAUTH_APP : OAUTH_APP;
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
    return this.parent
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .get(require.toUrl(app))

      .then(testElementExists('#footer-main'))

      .execute(function () {
        /* global $ */
        $.post('/api/logout/')
            .always(function () {
              $('body').append('<div id="loggedout">Logged out</div>');
            });
      })
      .then(testElementExists('#loggedout'));
  });

  /**
   * Close all windows but the first. Used to cleanup after
   * failing functional tests where the test fails when checking
   * the 2nd window.
   *
   * @returns {Promise}
   */
  const closeAllButFirstWindow = thenify(function () {
    return this.parent
      .getAllWindowHandles()
      .then(function (handles) {
        if (handles.length > 1) {
          return this.parent
            .switchToWindow(handles[1])
            .closeCurrentWindow()
            .switchToWindow('')
            .then(closeAllButFirstWindow());
        }
      });
  });

  const clearBrowserState = thenify(function (options) {
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

    return this.parent
      .then(function () {
        if (options.contentServer) {
          return this.parent
            .then(clearContentServerState(options));
        }
      })
      .then(function () {
        if (options['123done']) {
          return this.parent
            .then(clear123DoneState());
        }
      })
      .then(function () {
        if (options['321done']) {
          return this.parent
            .then(clear123DoneState( { untrusted: true }));
        }
      })
      .then(closeAllButFirstWindow());
  });

  const clearSessionStorage = thenify(function () {
    // clear sessionStorage to avoid polluting other tests.
    return this.parent
      .execute(function () {
        try {
          sessionStorage.clear();
        } catch (e) {
          console.log('Failed to clearSessionStorage');
        }
        return true;
      }, []);
  });

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
   * Use document.querySelectorAll and poll until to find loaded images.
   *
   * Usage:  ".then(FunctionalHelpers.pollUntilGoneByQSA('.disabled'))"
   *
   * @param {String} selector
   *        QSA compatible selector string
   * @param {Number} [timeout]
   *        Timeout to wait until element is gone
   */
  function pollUntilGoneByQSA(selector, timeout) {
    timeout = timeout || 10000;

    return pollUntil(function (selector) {
      return document.querySelectorAll(selector).length === 0 ? true : null;
    }, [ selector ], timeout);
  }

  /**
   * Ensure no such element exists.
   *
   * @param   {string} selector of element to ensure does not exist.
   * @returns {promise} resolves when complete, fails if element exists.
   */
  const noSuchElement = thenify(function (selector) {
    return this.parent
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
  });

  /**
   * Get an fxa-js-client instance
   *
   * @returns {Object}
   */
  function getFxaClient () {
    return new FxaClient(AUTH_SERVER_ROOT, {
      xhr: nodeXMLHttpRequest.XMLHttpRequest
    });
  }

  /**
   * Get the value of a query parameter
   *
   * @param {String} paramName
   * @returns {promise} that resolves to the query parameter's value
   */
  const getQueryParamValue = thenify(function (paramName) {
    return this.parent
      .getCurrentUrl()
      .then(function (url) {
        var parsedUrl = Url.parse(url);
        var parsedQueryString = Querystring.parse(parsedUrl.query);
        return parsedQueryString[paramName];
      });
  });

  /**
   * Get an email
   *
   * @param {string} user - username or email address
   * @param {number} index - email index.
   * @param {object} [options]
   *   @param {number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   * @returns {promise} resolves with the email if email is found.
   */
  const getEmail = thenify(function (user, index, options) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    // restmail takes a count, not an index. Add 1.
    return this.parent
      .then(() => restmail.waitForEmail(user, index + 1, options))
      .then((emails) => emails[index]);
  });

  /**
   * Delete all emails for `user`
   *
   * @param {String} user - username or email address
   * @returns {Promise} resolves when complete
   */
  const deleteAllEmails = thenify(function (user) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    return this.parent
      .then(() => restmail.deleteAllEmails(user));
  });

  /**
   * Tests that send an SMS should be wrapped by `disableInProd`. This will
   * prevent the tests from running in stage/prod where we should not
   * send SMSs to random people.
   *
   * @param {Function} test
   * @returns {Function}
   */
  function disableInProd(test) {
    if (intern.config.fxaProduction) {
      return function () {
      };
    }

    return test;
  }

  /**
   * Get SMS message `index` for `phoneNumber`.
   *
   * @param {String} phoneNumber
   * @param {Number} index
   * @param {Object} [options={}]
   *   @param {Number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   * @returns {Promise} resolves with the SMS, if found.
   */
  const getSms = thenify(function (phoneNumber, index, options) {
    return this.parent
      .then(getEmail(phoneNumberToEmailAddress(phoneNumber), index, options))
      .then((email) => {
        return email.text.trim();
      });
  });

  /**
   * Delete all SMS messages for `phoneNumber`
   *
   * @param {String} phoneNumber
   * @returns {Promise} resolves when complete
   */
  const deleteAllSms = thenify(function (phoneNumber) {
    return this.parent
      .then(deleteAllEmails(phoneNumberToEmailAddress(phoneNumber)));
  });

  /**
   * Convert a phone number to an email address
   *
   * @param {String} phoneNumber
   * @returns {String}
   */
  function phoneNumberToEmailAddress(phoneNumber) {
    return `sms.+1${phoneNumber}`;
  }

  /**
   * Ensure SMS message `index` for `phoneNumber` matches `smsFormatRegExp`
   *
   * @param {String} phoneNumber
   * @param {Number} index
   * @param {RegExp} smsFormatRegExp
   * @returns {Promise} resolves when complete
   */
  const testSmsFormat = thenify(function (phoneNumber, index, smsFormatRegExp) {
    return this.parent
      .then(getSms(phoneNumber, index))
      .then((sms) => {
        assert.isTrue(smsFormatRegExp.test(sms));
      });
  });

  const SIGNIN_CODE_SMS_FORMAT = /m\/([a-zA-Z0-9_-]{8,8})$/;

  /**
   * Get a signinCode from the SMS message `index` for `phoneNumber`
   *
   * @param {String} phoneNumber
   * @param {Number} index
   * @param {RegExp} smsFormatRegExp
   * @returns {Promise} resolves with the signinCode when complete
   */
  const getSmsSigninCode = thenify(function (phoneNumber, index, options) {
    return this.parent
      .then(testSmsFormat(phoneNumber, index, SIGNIN_CODE_SMS_FORMAT))
      .then(getSms(phoneNumber, index, options))
      .then((sms) => {
        return SIGNIN_CODE_SMS_FORMAT.exec(sms)[1];
      });
  });

  /**
   * Get the email headers
   *
   * @param {string} user - username or email address
   * @param {number} index - email index.
   * @param {object} [options]
   *   @param {number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   * @returns {promise} resolves with the email headers if email is found.
   */
  const getEmailHeaders = thenify(function(user, index, options) {
    return this.parent
      .then(getEmail(user, index, options))
      .then((email) => email.headers);
  });

  /**
   * Get an email verification link
   *
   * @param   {string} user username or email
   * @param   {number} index email index
   * @returns {promise} resolves with verification link
   */
  const getVerificationLink = thenify(function(user, index) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    return this.parent
      .then(getEmailHeaders(user, index))
      .then(function (headers) {
        const link = headers['x-link'];
        if (! link) {
          throw new Error('Email does not contain verification link: ' + headers['x-template-name']);
        }
        return require.toUrl(link);
      });
  });

  /**
   * Get the code, uid and reportSignInLink from the unblock email.
   *
   * @param {string} user or email
   * @param {number} index
   * @returns {promise} that resolves with object containing
   * `code`, `uid`, and `reportSignInLink`
   */
  const getUnblockInfo = thenify(function (user, index) {
    if (/@/.test(user)) {
      user = TestHelpers.emailToUser(user);
    }

    return this.parent
      .then(getEmailHeaders(user, index))
      .then(function (headers) {
        const unblockCode = headers['x-unblock-code'];
        if (! unblockCode) {
          throw new Error('Email does not contain unblock code: ' + headers['x-template-name']);
        }
        return {
          reportSignInLink: require.toUrl(headers['x-report-signin-link']),
          uid: headers['x-uid'],
          unblockCode: unblockCode
        };
      });
  });


  /**
   * Test to ensure an expected email arrives
   *
   * @param {string} user - username or email address
   * @param {number} index - email index.
   * @param {object} [options]
   *   @param {number} [options.maxAttempts] - number of email fetch attempts to make.
   *   Defaults to 10.
   * Defaults to 10.
   */
  const testEmailExpected = thenify(function (user, index, options) {
    return this.parent
      .then(getEmailHeaders(user, index, options))
      .then(function () {
        return true;
      }, function (err) {
        if (/EmailTimeout/.test(String(err))) {
          throw new Error('EmailExpected');
        }

        throw err;
      });
  });

  /**
   * Test to ensure an unexpected email does not arrive
   *
   * @param {string} user - username or email address
   * @param {number} index - email index.
   * @param {object} [options]
   *   @param {number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   */
  const noEmailExpected = thenify(function (user, index, options) {
    return this.parent
      .then(getEmailHeaders(user, index, options))
      .then(function () {
        throw new Error('NoEmailExpected');
      }, function (err) {
        if (/EmailTimeout/.test(String(err))) {
          return true;
        }

        throw err;
      });
  });

  /**
   * Open an external site.
   *
   * @returns {promise} resolves when complete
   */
  const openExternalSite = thenify(function () {
    return this.parent
      .get(require.toUrl(EXTERNAL_SITE_URL))
        .findByPartialLinkText(EXTERNAL_SITE_LINK_TEXT)
      .end();
  });

  /**
   * Open a verification link in a new tab of the same browser.
   * @param {string} email user's email
   * @param {number} index verification email index
   * @param {object} [options] options
   *   @param {object} [options.query] extra query parameters to add to the verification link
   * @returns {promise} resolves when complete
   */
  const openVerificationLinkInNewTab = thenify(function (email, index, options) {
    var user = TestHelpers.emailToUser(email);
    options = options || {};

    return this.parent
      .then(getVerificationLink(user, index))
      .then(function (verificationLink) {
        const verificationLinkWithParams = addQueryParamsToLink(verificationLink, options.query);
        return this.parent
          .execute(openWindow, [ verificationLinkWithParams ]);
      });
  });

  const openVerificationLinkInSameTab = thenify(function (email, index, options) {
    var user = TestHelpers.emailToUser(email);
    options = options || {};

    return this.parent
      .then(getVerificationLink(user, index))
      .then(function (verificationLink) {
        const verificationLinkWithParams = addQueryParamsToLink(verificationLink, options.query);
        return this.parent.get(verificationLinkWithParams);
      });
  });

  const openTab = thenify(function (url, name) {
    return this.parent.execute(openWindow, [ url, name ]);
  });

  /**
   * Switch to a new window/tab
   *
   * @param {Number} which - tab index to switch to
   * @returns {Promise}
   */
  const switchToWindow = thenify(function (which) {
    return this.parent
      .getAllWindowHandles()
      .then(function (handles) {
        if (handles[which]) {
          return this.parent.switchToWindow(handles[which]);
        } else {
          // give a little time to open the browser tab, otherwise
          // geckodriver sometimes attempts to switch to the tab
          // before it's open. See #4740
          return this.parent
            .sleep(1000)
            .then(switchToWindow(which));
        }
      });
  });

  /**
   * Respond to a web channel message.
   *
   * @param   {string} expectedCommand command to respond to
   * @param   {object} response response
   * @returns {promise} resolves when complete
   */
  const respondToWebChannelMessage = thenify(function (expectedCommand, response) {
    var attachedId = Math.floor(Math.random() * 10000);
    return this.parent
      .execute(function (expectedCommand, response, attachedId) {
        function startListening() {
          try {
            addEventListener('WebChannelMessageToChrome', function listener(e) {
              var command = e.detail.message.command;
              var messageId = e.detail.message.messageId;

              if (command === expectedCommand) {
                removeEventListener('WebChannelMessageToChrome', listener);
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
            $('body').append('<div>').addClass('attached' + attachedId);
          } catch (e) {
            // problem adding the listener, window may not be
            // ready, try again.
            setTimeout(startListening, 0);
          }
        }

        startListening();
      }, [ expectedCommand, response, attachedId ])
      // once the event is attached it adds a div with an attachedId.
      .then(testElementExists('.attached' + attachedId));
  });

  function openWindow (url, name) {
    var newWindow = window.open(url, name || 'newwindow');

    // Hook up the new window to listen for WebChannel messages.
    // XXX TODO: this is pretty gross to do universally like this...
    // XXX TODO: it will go away if we can make the original tab
    //           reliably be the one to complete the oauth flow.
    // We start listening for web channel messages as soon as
    // openPage is called, before the page is ready. Wait for
    // the prerequisites, then attach.
    function startListening() {
      try {
        newWindow.addEventListener('WebChannelMessageToChrome', function (e) {
          var command = e.detail.message.command;
          var data = e.detail.message.data;

          var element = document.createElement('div');
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
      } catch (e) {
        // problem adding the listener, window may not be ready, try again.
        setTimeout(startListening, 0);
      }
    }

    startListening();
  }

  /**
   * Synthesize opening the verification link in a different browser.
   *
   * @param   {string} email - email to verify
   * @param   {number} [emailNumber] - email number with the verification link. Defaults to `0`.
   * @returns {promise} resolves when complete
   */
  const openVerificationLinkInDifferentBrowser = thenify(function (email, emailNumber) {
    var client = getFxaClient();
    var user = TestHelpers.emailToUser(email);

    return this.parent
      .then(getEmailHeaders(user, emailNumber || 0))
      .then(function (headers) {
        var uid = headers['x-uid'];
        var code = headers['x-verify-code'];
        if (! code) {
          throw new Error('Email does not contain verify code: ' + headers['x-template-name']);
        }

        return client.verifyCode(uid, code);
      });
  });

  /**
   * Synthesize completing a password reset in a different browser.
   *
   * @param {string} email - email to verify
   * @param {string} password - new password
   * @returns {promise} - resolves when complete
   */
  const openPasswordResetLinkInDifferentBrowser = thenify(function (email, password) {
    var client = getFxaClient();

    var user = TestHelpers.emailToUser(email);

    return this.parent
      .then(getEmailHeaders(user, 0))
      .then(function (headers) {
        var code = headers['x-recovery-code'];
        // there is no x-recovery-token header, so we have to parse it
        // out of the link.
        var link = headers['x-link'];
        var search = Url.parse(link).query;
        var queryParams = Querystring.parse(search);
        var token = queryParams.token;
        if (! code) {
          throw new Error('Email does not contain reset password code: ' + headers['x-template-name']);
        }
        return client.passwordForgotVerifyCode(code, token);
      })
      .then(function (result) {
        return client.accountReset(email, password, result.accountResetToken);
      });
  });

  /**
   * Open the settings page in a new tab.
   *
   * @param   {string} windowName name of new tab
   * @param   {string} [panel] pathname of panel to open. Open `/settings` if not given.
   * @returns {promise} resolves when complete
   */
  const openSettingsInNewTab = thenify(function (windowName, panel) {
    var url = SETTINGS_URL;
    if (panel) {
      url += '/' + panel;
    }
    return this.parent
      .execute(openWindow, [ url, windowName ]);
  });

  /**
   * Open the signin page in a new tab.
   *
   * @param   {string} windowName name of tab
   * @returns {promise} resolves when complete
   */
  const openSignInInNewTab = thenify(function (windowName) {
    return this.parent
      .execute(openWindow, [ SIGNIN_URL, windowName ]);
  });

  /**
   * Open the signup page in a new tab.
   *
   * @param   {string} windowName name of tab
   * @returns {promise} resolves when complete
   */
  const openSignUpInNewTab = thenify(function (windowName) {
    return this.parent
      .execute(openWindow, [ SIGNUP_URL, windowName ]);
  });

  /**
   * Open `url` in the current tab, wait for `readySelector`
   *
   * @param {String} url - url to open
   * @param {String} readySelector - selector that indicates page is loaded
   * @param {Object} [options]
   *  @param {Object} [options.query] - extra query parameters to add
   * @returns {Promise} - resolves when complete
   */
  const openPage = thenify(function (url, readySelector, options) {
    options = options || {};

    url = addQueryParamsToLink(url, options.query);

    return this.parent
      .get(require.toUrl(url))
      .setFindTimeout(config.pageLoadTimeout)

      .then(function () {
        const webChannelResponses = options.webChannelResponses;
        if (webChannelResponses) {
          return Object.keys(webChannelResponses).reduce((parent, webChannelMessage) => {
            return parent.then(respondToWebChannelMessage(webChannelMessage, webChannelResponses[webChannelMessage]));
          }, this.parent);
        }
      })

      // Wait until the `readySelector` element is found to return.
      .then(testElementExists(readySelector))

      .then(null, function (err) {
        return this.parent
          .getCurrentUrl()
            .then(function (resultUrl) {
              console.log('Error fetching %s, now at %s', url, resultUrl);
            })
          .end()

          .then(function () {
            throw err;
          });
      });
  });

  /**
   * Open the force auth page
   *
   * @param {object} [options]
   * @param {string} [options.header] - element selector that indicates
   *  "page is loaded". Defaults to `#fxa-force-auth-header`
   * @param {object} [options.query] - query strings to open page with
   */
  const openForceAuth = thenify(function (options) {
    options = options || {};

    var urlToOpen = FORCE_AUTH_URL + '?' + Querystring.stringify(options.query || {});
    return this.parent
      .then(openPage(urlToOpen, options.header || '#fxa-force-auth-header'));
  });

  /**
   * Add query parameters to a link
   *
   * @param {String} link
   * @param {Object} query
   * @returns {String}
   */
  function addQueryParamsToLink(link, query) {
    query = query || {};
    const parsedLink = Url.parse(link, true);
    for (var paramName in query) {
      parsedLink.query[paramName] = query[paramName];
    }
    parsedLink.search = undefined;
    return require.toUrl(Url.format(parsedLink));
  }

  /**
   * Re-open the same page with additional query parameters.
   *
   * @param   {object} additionalQueryParams key/value pairs of query parameters
   * @param   {string} waitForSelector query selector that indicates load is complete
   * @returns {promise} resolves when complete.
   */
  const reOpenWithAdditionalQueryParams = thenify(function (additionalQueryParams, waitForSelector) {
    return this.parent
      .getCurrentUrl()
      .then(function (url) {
        var urlToOpen = addQueryParamsToLink(url, additionalQueryParams);

        return this.parent
          .then(openPage(urlToOpen, waitForSelector));
      });
  });

  /**
   * Open FxA from an OAuth relier.
   *
   * @param {string} page - page to open
   * @param {object} [options]
   * @param {string} [options.header] - element selector that indicates
   *  "page is loaded". Defaults to `#fxa-force-auth-header`
   * @param {object} [options.query] - query strings to open page with
   * @param {boolean} [options.untrusted] - if `true`, opens the Untrusted
   * relier. Defaults to `true`
   */
  const openFxaFromRp = thenify(function (page, options) {
    options = options || {};
    var app = options.untrusted ? UNTRUSTED_OAUTH_APP : OAUTH_APP;
    var expectedHeader = options.header || '#fxa-' + page.replace('_', '-') + '-header';
    var queryParams = options.query || {};

    // force_auth does not have a button on 123done, instead this is
    // only available programatically. Load the force_auth page
    // with only the email initially, then reload with the full passed
    // in urlSuffix so things like the webChannelId are correctly passed.
    if (page === 'force_auth') {
      var emailSearchString = '?' + Querystring.stringify({ email: queryParams.email });
      var endpoint = app + 'api/force_auth' + emailSearchString;
      return this.parent
        .then(openPage(endpoint, expectedHeader))
        .then(function () {
          var numQueryParams = Object.keys(queryParams).length;
          if (! numQueryParams || (numQueryParams === 1 && queryParams.email)) {
            // email will already have been added, if passed in. email is
            // not passed in for some functional tests to ensure query parameter
            // validation is working properly.
            return;
          }
          return this.parent
            .then(reOpenWithAdditionalQueryParams(queryParams, expectedHeader));
        });
    }

    return this.parent
      .then(openPage(app, '.ready #splash .' + page))
      .then(click('.ready #splash .' + page))

      // wait until the page fully loads or else the re-load with
      // the suffix will blow its lid when run against latest.
      .then(testElementExists(expectedHeader))

      .then(function () {
        if (Object.keys(queryParams).length) {
          return this.parent
            .then(reOpenWithAdditionalQueryParams(queryParams, expectedHeader));
        }
      });
  });

  /**
   * Open FxA from the untrusted OAuth relier.
   *
   * @param {string} page - page to open
   * @param {object} [options]
   * @param {string} [options.header] - element selector that indicates
   *  "page is loaded". Defaults to `#fxa-force-auth-header`
   * @param {object} [options.query] - query strings to open page with
   */
  function openFxaFromUntrustedRp(page, options) {
    options = options || {};
    options.untrusted = true;
    return openFxaFromRp(page, options);
  }

  const fillOutSignIn = thenify(function (email, password, alwaysLoad) {
    return this.parent
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signin page if not already at a signin page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signin(?:$|\?)/.test(currentUrl) || alwaysLoad) {
          return this.parent
            .get(require.toUrl(SIGNIN_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .then(type('input[type=email]', email))
      .then(type('input[type=password]', password))
      .then(click('button[type="submit"]'));
  });

  const fillOutSignInUnblock = thenify(function (email, number) {
    return this.parent
      .then(getUnblockInfo(email, number))
      .then(function (unblockInfo) {
        return this.parent
          .then(type('#unblock_code', unblockInfo.unblockCode));
      })
      .then(click('button[type=submit]'));
  });

  const fillOutSignUp = thenify(function (email, password, options) {
    options = options || {};

    var customizeSync = options.customizeSync || false;
    var enterEmail = options.enterEmail !== false;
    var optInToMarketingEmail = options.optInToMarketingEmail || false;
    var age = options.age || 24;
    var submit = options.submit !== false;

    return this.parent
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the signup page if not already at a signup page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]signup(?:$|\?)/.test(currentUrl)) {
          return this.parent
            .get(require.toUrl(SIGNUP_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .then(function () {
        if (enterEmail) {
          return type('input[type=email]', email).call(this);
        }
      })
      .then(type('input[type=password]', password))
      .then(type('#age', age || '24'))

      .then(function () {
        if (customizeSync) {
          return click('form input.customize-sync').call(this);
        }
      })

      .then(function () {
        if (optInToMarketingEmail) {
          return click('form input.marketing-email-optin').call(this);
        }
      })
      .then(function () {
        if (submit) {
          return click('button[type="submit"]').call(this);
        }
      });
  });

  const fillOutResetPassword = thenify(function (email, options) {
    options = options || {};

    return this.parent
      .getCurrentUrl()
      .then(function (currentUrl) {
        // only load the reset_password page if not already at
        // the reset_password page.
        // the leading [\/#] allows for either the standard redirect or iframe
        // flow. The iframe flow must use the window hash for routing.
        if (! /[\/#]reset_password(?:$|\?)/.test(currentUrl) && ! options.skipPageRedirect) {
          return this.parent
            .get(require.toUrl(RESET_PASSWORD_URL))
            .setFindTimeout(intern.config.pageLoadTimeout);
        }
      })

      .then(testElementExists('#fxa-reset-password-header'))
      .then(type('form input.email', email))
      .then(click('button[type="submit"]'));
  });

  /**
   * Fill out and submit the force auth page.
   *
   * @param {string} password
   */
  const fillOutForceAuth = thenify(function (password) {
    return this.parent
      .setFindTimeout(intern.config.pageLoadTimeout)
      .then(testElementExists('#fxa-force-auth-header'))
      .then(type('input[type=password]', password))
      .then(click('button[type=submit]'));
  });

  /**
   * Fill out and submit the complete reset password form
   * @param {String} password - new password
   * @param {String} vpassword - new verification password
   * @returns {promise}
   */
  const fillOutCompleteResetPassword = thenify(function (password, vpassword) {
    return this.parent
    .setFindTimeout(intern.config.pageLoadTimeout)

    .then(testElementExists('#fxa-complete-reset-password-header'))
    .then(type('#password', password))
    .then(type('#vpassword', vpassword))
    .then(click('button[type="submit"]'));
  });

  /**
   * Fill out and submit the change password form.
   *
   * @param   {string} oldPassword user's old password
   * @param   {string} newPassword user's new password
   * @returns {promise} resolves when complete
   */
  const fillOutChangePassword = thenify(function (oldPassword, newPassword) {
    return this.parent
      .setFindTimeout(intern.config.pageLoadTimeout)

      .then(type('#old_password', oldPassword))
      .then(type('#new_password', newPassword))
      .then(click('#change-password button[type="submit"]'));
  });

  /**
   * Fill out and submit the delete account form.
   *
   * @param   {string} password user's password
   * @returns {promise} resolves when complete
   */
  const fillOutDeleteAccount = thenify(function (password) {
    return this.parent
      .setFindTimeout(intern.config.pageLoadTimeout)

      .then(type('#delete-account form input.password', password))
      // delete account
      .then(click('#delete-account button[type="submit"]'));
  });

  function mouseevent(eventType) {
    return thenify(function (selector) {
      return this.parent
        .execute(function (selector, eventType) {
          var target = selector ? document.querySelector(selector) : window;
          var event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            view: window
          });
          target.dispatchEvent(event);
        }, [ selector, eventType ]);
    });
  }

  var mousedown = mouseevent('mousedown');
  var mouseout = mouseevent('mouseout');
  var mouseup = mouseevent('mouseup');

  const clearBrowserNotifications = thenify(function () {
    return this.parent
      .execute(function (command, done) {
        sessionStorage.removeItem('webChannelEvents');
      });
  });

  /**
   * Test to ensure the browser has received a web channel notification.
   *
   * @param {string} command to ensure was received
   * @returns {promise} rejects if message has not been received.
   */
  const testIsBrowserNotified = thenify(function (command) {
    return this.parent
      // Allow 5 seconds for the event to come through.
      .setExecuteAsyncTimeout(5000)
      .executeAsync(function (command, done) {
        function check() {
          var storedEvents;
          try {
            storedEvents = JSON.parse(sessionStorage.getItem('webChannelEvents')) || [];
          } catch (e) {
            storedEvents = [];
          }

          if (storedEvents.indexOf(command) > -1) {
            done();
          } else {
            setTimeout(check, 50);
          }
        }

        check();
      }, [command])
      .then(null, function (err) {
        if (/ScriptTimeout/.test(String(err))) {
          var noSuchNotificationError = new Error('NoSuchBrowserNotification');
          noSuchNotificationError.command = command;
          throw noSuchNotificationError;
        } else {
          throw err;
        }
      });
  });

  /**
   * Test to ensure the browser has not received a web channel notification.
   *
   * @param   {string} command command that should not be received.
   * @returns {promise} rejects if command has been received
   */
  const noSuchBrowserNotification = thenify(function (command) {
    return this.parent
      .then(testIsBrowserNotified(command))
      .then(function () {
        var unexpectedNotificationError = new Error('UnexpectedBrowserNotification');
        unexpectedNotificationError.command = command;
        throw unexpectedNotificationError;
      }, function (err) {
        if (! /NoSuchBrowserNotification/.test(String(err))) {
          throw err;
        }
      });
  });

  /**
   * Check to ensure the page does not transition
   *
   * @param {String} selector
   * @param {Number} [timeout] time to wait in ms. Defaults to 2000ms
   * @returns {promise} that resolves if the selector is found
   * before and after the timeout.
   */
  const noPageTransition = thenify(function (selector, timeout) {
    return this.parent
      .then(testElementExists(selector))
      .sleep(timeout || 2000)
      .then(testElementExists(selector));
  });

  /**
   * Fetch all the metrics that have been logged by the front end.
   *
   * @returns {promise} resolves with the logged metrics.
   */
  const fetchAllMetrics = thenify(function () {
    return this.parent
      .execute(function () {
        var key = '__fxa_storage.metrics_all';
        var item;
        try {
          item = JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }
        return item;
      });
  });

  /**
   * Test to ensure all events in the list have been logged.
   *
   * @param   {string[]} eventsNames
   * @returns {promise} rejects if all events are not logged
   */
  const testAreEventsLogged = thenify(function (eventsNames) {
    return this.parent
      .then(fetchAllMetrics())
      .then(function (metrics) {
        var events = metrics.reduce(function (evts, metrics) {
          var evtsNames = metrics.events.map(function (evt) {
            return evt.type;
          });
          return evts.concat(evtsNames);
        }, []);

        return this.parent
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
  });

  /**
   * Test whether a status element (success or error) was shown.
   * Done by looking for the `data-shown` attribute.
   *
   * @param {string} selector
   * @returns {promise} rejects if fails
   */
  const testElementWasShown = thenify(function (selector) {
    return this.parent
      .then(testElementExists(selector))
      .executeAsync(function (selector, done) {
        // remove the attribute so subsequent checks can be made
        // against the same element. displaySuccess and displayError
        // will re-add the 'data-shown' attribute.
        $(selector).removeAttr('data-shown');
        done();
      }, [selector]);
  });

  /**
   * Test whether the success message was shown.
   *
   * @param {string} [selector] defaults to `.success[data-shown]`
   * @returns {promise} rejects if error element was not shown.
   */
  function testSuccessWasShown(selector) {
    selector = selector || '.success[data-shown]';
    return testElementWasShown(selector);
  }

  /**
   * Test whether the error message was shown.
   *
   * @param {string} [selector] defaults to `.error[data-shown]`
   * @returns {promise} rejects if error element was not shown.
   */
  function testErrorWasShown(selector) {
    selector = selector || '.error[data-shown]';
    return testElementWasShown(selector);
  }

  /**
   * Check to ensure an element has a `disabled` attribute.
   *
   * @param {string} selector
   * @returns {promise} rejects if test fails
   */
  const testElementDisabled = thenify(function (selector) {
    return this.parent
      .findByCssSelector(selector)
        .getAttribute('disabled')
        .then(function (disabledValue) {
          // attribute value is null if it does not exist
          assert.notStrictEqual(disabledValue, null);
        })
      .end();
  });

  /**
   * Check to ensure an element is displayed.
   *
   * @param {string} selector
   * @returns {promise} rejects if test fails
   */
  const testElementDisplayed = thenify(function (selector) {
    return this.parent
      .then(visibleByQSA(selector))
      .findByCssSelector(selector)
        .isDisplayed()
        .then(function (isDisplayed) {
          assert.isTrue(isDisplayed);
        })
      .end();
  });

  /**
   * Ensure the element is not displayed
   *
   * @param {string} selector
   * @returns {promise} rejects if element is displayed
   */
  const noSuchElementDisplayed = thenify(function (selector) {
    return this.parent
      .findByCssSelector(selector)
        .isDisplayed()
        .then(function (isDisplayed) {
          assert.isFalse(isDisplayed);
        })
      .end();
  });

  /**
   * Check whether an input element's text equals the expected value.
   * Comparison is case sensitive
   *
   * @param {string} selector
   * @param {string} expected
   * @returns {promise} rejects if test fails.
   */
  const testElementTextEquals = thenify(function (selector, expected) {
    return this.parent
      .findByCssSelector(selector)
      .then(visibleByQSA(selector))
      .getVisibleText()
      .then(function (resultText) {
        assert.equal(resultText, expected);
      })
      .end();
  });

  /**
   * Check whether an input element's text includes the expected value.
   * Comparison is case insensitive
   *
   * @param {string} selector
   * @param {string} expected
   * @param {object} [options]
   * @returns {promise} rejects if test fails.
   */
  const testElementTextInclude = thenify(function (selector, expected) {
    return this.parent
      .findByCssSelector(selector)
      .then(visibleByQSA(selector))
      .getVisibleText()
      .then(function (resultText) {
        assert.include(resultText.toLowerCase(), expected.toLowerCase());
      })
      .end();
  });

  /**
   * Check whether the `.error` element includes the expected text
   *
   * @param {string} expected
   * @returns {promise} rejects if test fails.
   */
  function testErrorTextInclude(expected) {
    return testElementTextInclude('.error', expected);
  }

  /**
   * Check whether an input element's value equals the expected value
   *
   * @param {string} selector
   * @param {string} expected
   * @returns {promise} rejects if test fails.
   */
  const testElementValueEquals = thenify(function (selector, expected) {
    return this.parent
      .findByCssSelector(selector)
      .getProperty('value')
      .then(function (resultText) {
        assert.equal(resultText, expected);
      })
      .end();
  });

  /**
   * Check whether an anchor has a href that equals to the expected url
   *
   * @param {string} selector
   * @param {string} expected
   * @returns {promise} rejects if test fails.
   */
  const testHrefEquals = thenify(function (selector, expected) {
    return this.parent
      .then(testAttributeEquals(selector, 'href', expected));
  });

  /**
   * Check whether the current URL matches the expected value
   *
   * @param {string} expected
   * @returns {promise} fails if url does not equal expected value
   */
  const testUrlEquals = thenify(function (expected) {
    return this.parent
      .getCurrentUrl()
        .then(function (url) {
          assert.equal(url, expected);
        })
      .end();
  });

  /**
   * Check whether the current URL's pathname matches the expected value
   *
   * @param {string} expected
   * @returns {promise} fails if url pathname does not equal expected value
   */
  const testUrlPathnameEquals = thenify(function (expected) {
    return this.parent
      .getCurrentUrl()
        .then(function (url) {
          assert.equal(Url.parse(url).pathname, expected);
        })
      .end();
  });

  /**
   * Ensure the current URL includes `expected`
   *
   * @param   {string} expected
   * @returns {promise} fails if url does not include expected value
   */
  const testUrlInclude = thenify(function (expected) {
    return this.parent
      .getCurrentUrl()
      .then(function (url) {
        assert.include(url, expected);
      })
      .end();
  });

  /**
   * Create a user on the backend
   *
   * @param {string} email
   * @param {string} password
   * @param {object} [options]
   * @param {object} [options.preVerified] pre-verify the user?
   *   Defaults to false.
   * @returns {promise} resolves with account info when complete.
   */
  const createUser = thenify(function (email, password, options) {
    options = options || {};
    return this.parent.then(function () {
      var client = getFxaClient();

      return client.signUp(
        email, password, { lang: 'en', preVerified: options.preVerified });
    });
  });

  /**
   * Close the current window and switch to the named tab. If
   * The window will only be closed if it's not the last open window.
   *
   * @param {string} [tabName] - defaults to ''
   * @returns {promise}
   */
  const closeCurrentWindow = thenify(function (tabName) {
    return this.parent
      .getAllWindowHandles()
      .then(function (handles) {
        if (handles.length <= 1) {
          throw new Error('LastWindowError');
        } else {
          return this.parent
            .closeCurrentWindow()
            .switchToWindow(tabName || handles[0]);
        }
      });
  });

  /**
   * Assert the value of an attribute
   *
   * @param {string} selector CSS selector for the element
   * @param {string} attributeName Name of attribute
   * @param {string} assertion Name of the chai assertion to invoke
   * @param {string} value Expected value of the attribute
   * @returns {promise}
   */
  const testAttribute = thenify(function (selector, attributeName, assertion, value) {
    return this.parent
      .findByCssSelector(selector)
        .getAttribute(attributeName)
        .then(function (attributeValue) {
          assert[assertion](attributeValue, value);
        })
      .end();
  });

  /**
   * Assert that an attribute value === expected value
   *
   * @param {string} selector CSS selector for the element
   * @param {string} attributeName Name of attribute
   * @param {string} value Expected value of the attribute
   * @returns {promise}
   */
  function testAttributeEquals (selector, attributeName, value) {
    return testAttribute(selector, attributeName, 'strictEqual', value);
  }

  /**
   * Assert that an attribute value matches a regex
   *
   * @param {string} selector CSS selector for the element
   * @param {string} attributeName Name of attribute
   * @param {regex} regex Expression for the attribute value to be matched against
   * @returns {promise}
   */
  function testAttributeMatches (selector, attributeName, regex) {
    return testAttribute(selector, attributeName, 'match', regex);
  }

  /**
   * Check that an element has an attribute
   *
   * @param {string} selector CSS selector for the element
   * @param {string} attributeName Name of attribute
   * @returns {promise} resolves to true if attribute exists, false otw.
   */
  const testAttributeExists = thenify(function (selector, attributeName) {
    return this.parent
      .findByCssSelector(selector)
        .getAttribute(attributeName)
        .then(function (attributeValue) {
          assert.notStrictEqual(attributeValue, null);
        })
      .end();
  });

  /**
   * Get some memory back
   *
   */
  const cleanMemory = thenify(function (selector, attributeName) {
    return this.parent
      .get(require.toUrl('about:memory'))
      // Click the Minimize Memory Usage button
      .then(click('div.opsRow:nth-child(3) > button:nth-child(4)'))
      .then(testElementExists('.section'))
      .end();
  });

  /**
   * Denormalize the email stored in an account. Sets the email to be all uppercase.
   *
   * @param   {string} email - email address to denormalize
   * @returns {promise}
   */
  const denormalizeStoredEmail = thenify(function (email) {
    return this.parent
      .execute((email) => {
        // synthesize the user signing in before the email normalization fix went in (#4470)
        var accounts = JSON.parse(localStorage.getItem('__fxa_storage.accounts'));
        console.log('looking for email', email);

        for (var uid in accounts) {
          var account = accounts[uid];
          if (account.email === email) {
            console.log('will change email', email);
            account.email = email.toUpperCase();
          }
        }
        localStorage.setItem('__fxa_storage.accounts', JSON.stringify(accounts));
      }, [ email ]);
  });

  /**
   * Get account data from localStorage.
   *
   * @param {string} email - email of account
   * @returns {promise} resolves with the account data, if exists,
   *  resolves with `undefined` if not.
   */
  function getStoredAccountByEmail (email) {
    return function () {
      return this.parent
        .execute((email) => {
          // synthesize the user signing in before the email normalization fix went in (#4470)
          var accounts = JSON.parse(localStorage.getItem('__fxa_storage.accounts'));
          console.log('looking for email', email);

          for (var uid in accounts) {
            var account = accounts[uid];
            if (account.email === email) {
              return account;
            }
          }
        }, [ email ]);
    };
  }

  /**
   * Ensure no such account is stored with the `email`
   *
   * @param {string} email - email of account
   * @returns {promise} resolves if no account with `email`, rejects otherwise.
   */
  function noSuchStoredAccountByEmail (email) {
    return function () {
      return this.parent
        .then(getStoredAccountByEmail(email))
        .then((account) => {
          if (account) {
            throw new Error('Account data should have been removed: ' + email);
          }
        });
    };
  }

  /**
   * Wait for the given `url`
   *
   * @param {string} url - url to wait for
   * @returns {promise} resolves when true
   */

  const waitForUrl = thenify(function (url) {
    return this.parent
      .getCurrentUrl()
      .then(function (currentUrl) {
        if (currentUrl !== url) {
          return this.parent
            .sleep(500)
            .then(waitForUrl(url));
        }
      });
  });

  return {
    cleanMemory,
    clearBrowserNotifications: clearBrowserNotifications,
    clearBrowserState: clearBrowserState,
    clearSessionStorage: clearSessionStorage,
    click: click,
    closeCurrentWindow: closeCurrentWindow,
    createUser: createUser,
    deleteAllEmails,
    deleteAllSms,
    denormalizeStoredEmail: denormalizeStoredEmail,
    disableInProd,
    fetchAllMetrics: fetchAllMetrics,
    fillOutChangePassword: fillOutChangePassword,
    fillOutCompleteResetPassword: fillOutCompleteResetPassword,
    fillOutDeleteAccount: fillOutDeleteAccount,
    fillOutForceAuth: fillOutForceAuth,
    fillOutResetPassword: fillOutResetPassword,
    fillOutSignIn: fillOutSignIn,
    fillOutSignInUnblock: fillOutSignInUnblock,
    fillOutSignUp: fillOutSignUp,
    focus: focus,
    getEmail,
    getEmailHeaders: getEmailHeaders,
    getFxaClient: getFxaClient,
    getQueryParamValue: getQueryParamValue,
    getSms,
    getSmsSigninCode,
    getStoredAccountByEmail: getStoredAccountByEmail,
    getUnblockInfo: getUnblockInfo,
    getVerificationLink: getVerificationLink,
    imageLoadedByQSA: imageLoadedByQSA,
    mousedown: mousedown,
    mouseevent: mouseevent,
    mouseout: mouseout,
    mouseup: mouseup,
    noEmailExpected: noEmailExpected,
    noPageTransition: noPageTransition,
    noSuchBrowserNotification: noSuchBrowserNotification,
    noSuchElement: noSuchElement,
    noSuchElementDisplayed: noSuchElementDisplayed,
    noSuchStoredAccountByEmail: noSuchStoredAccountByEmail,
    openExternalSite: openExternalSite,
    openForceAuth: openForceAuth,
    openFxaFromRp: openFxaFromRp,
    openFxaFromUntrustedRp: openFxaFromUntrustedRp,
    openPage: openPage,
    openPasswordResetLinkInDifferentBrowser: openPasswordResetLinkInDifferentBrowser,
    openSettingsInNewTab: openSettingsInNewTab,
    openSignInInNewTab: openSignInInNewTab,
    openSignUpInNewTab: openSignUpInNewTab,
    openTab: openTab,
    openVerificationLinkInDifferentBrowser: openVerificationLinkInDifferentBrowser,
    openVerificationLinkInNewTab: openVerificationLinkInNewTab,
    openVerificationLinkInSameTab: openVerificationLinkInSameTab,
    pollUntil: pollUntil,
    pollUntilGoneByQSA: pollUntilGoneByQSA,
    reOpenWithAdditionalQueryParams: reOpenWithAdditionalQueryParams,
    respondToWebChannelMessage: respondToWebChannelMessage,
    switchToWindow: switchToWindow,
    takeScreenshot: takeScreenshot,
    testAreEventsLogged: testAreEventsLogged,
    testAttribute: testAttribute,
    testAttributeEquals: testAttributeEquals,
    testAttributeExists: testAttributeExists,
    testAttributeMatches: testAttributeMatches,
    testElementDisabled: testElementDisabled,
    testElementDisplayed: testElementDisplayed,
    testElementExists: testElementExists,
    testElementTextEquals: testElementTextEquals,
    testElementTextInclude: testElementTextInclude,
    testElementValueEquals: testElementValueEquals,
    testEmailExpected: testEmailExpected,
    testErrorTextInclude: testErrorTextInclude,
    testErrorWasShown: testErrorWasShown,
    testHrefEquals: testHrefEquals,
    testIsBrowserNotified: testIsBrowserNotified,
    testSmsFormat,
    testSuccessWasShown: testSuccessWasShown,
    testUrlEquals: testUrlEquals,
    testUrlInclude: testUrlInclude,
    testUrlPathnameEquals: testUrlPathnameEquals,
    thenify: thenify,
    type: type,
    visibleByQSA: visibleByQSA,
    waitForUrl: waitForUrl
  };
});
