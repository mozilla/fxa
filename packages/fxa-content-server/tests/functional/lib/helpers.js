/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = intern.getPlugin('chai');
const cp = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const mkdirp = require('mkdirp');
const nodeXMLHttpRequest = require('xmlhttprequest');
const path = require('path');
const pollUntil = require('@theintern/leadfoot/helpers/pollUntil').default;
const Querystring = require('querystring');
const restmail = require('../../lib/restmail');
const selectors = require('./selectors');
const TestHelpers = require('../../lib/helpers');
const UAParser = require('ua-parser-js');
const Url = require('url');

// Default options for TOTP
const otplib = require('otplib');
otplib.authenticator.options = { encoding: 'hex' };

const FxaClient = require('../../../../fxa-js-client/client/FxAccountClient');
const config = intern._config;

const AUTH_SERVER_ROOT = config.fxaAuthRoot;
const CONTENT_SERVER = config.fxaContentRoot;
const EXTERNAL_SITE_LINK_TEXT = 'More information';
const EXTERNAL_SITE_URL = 'http://example.com';
const FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth';
const OAUTH_APP = config.fxaOAuthApp;
const RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password';
const SETTINGS_URL = config.fxaContentRoot + 'settings';
const SIGNIN_URL = config.fxaContentRoot + 'signin';
const SIGNUP_URL = config.fxaContentRoot + 'signup';
const ENABLE_TOTP_URL = `${SETTINGS_URL}/two_step_authentication`;
const UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;
const TEST_PRODUCT_URL = `${config.fxaContentRoot}subscriptions/products/${config.testProductId}`;
const SUBSCRIPTION_MGMT_URL = `${config.fxaContentRoot}subscriptions`;

/**
 * Convert a function to a form that can be used as a `then` callback.
 * If the callback fails a screenshot will be taken.
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
  return function() {
    var args = arguments;
    return function() {
      let capturedError;
      return callback
        .apply(context || this, args)
        .then(null, err => {
          // The error has to be swallowed before a screenshot
          // can be taken or else takeScreenshot is never called
          // because `this.parent` is a promise that has already
          // been rejected.
          capturedError = err;
        })
        .then(function(result) {
          if (capturedError) {
            if (!capturedError.screenshotTaken) {
              capturedError.screenshotTaken = true;
              return this.parent
                .then(takeScreenshot()) //eslint-disable-line no-use-before-define
                .then(() => {
                  throw capturedError;
                });
            } else {
              throw capturedError;
            }
          }
          return result;
        });
    };
  };
}

/**
 * Take a screen shot, write a base64 encoded image to the console
 */
const takeScreenshot = function() {
  return function() {
    return this.parent.takeScreenshot().then(function(buffer) {
      if (process.env.CIRCLECI) {
        const rando = crypto.randomBytes(4).toString('hex');
        mkdirp.sync('/home/circleci/screenshots');
        fs.writeFileSync(`/home/circleci/screenshots/${rando}.png`, buffer);
        // 36831081 is the repo number I think, but it's not available as an env var.
        console.log(
          `Screenshot saved to https://${process.env.CIRCLE_BUILD_NUM}-36831081-gh.circle-artifacts.com/${process.env.CIRCLE_NODE_INDEX}/screenshots/${rando}.png`
        );
      }
    });
  };
};

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
const visibleByQSA = thenify(function(selector, options = {}) {
  var timeout = options.timeout || config.pageLoadTimeout;

  return this.parent
    .then(
      pollUntil(
        function(selector, options) {
          var matchingEls = document.querySelectorAll(selector);

          if (matchingEls.length === 0) {
            return null;
          }

          if (matchingEls.length > 1) {
            throw new Error(
              'Multiple elements matched. Make a more precise selector - ' +
                selector
            );
          }

          var matchingEl = matchingEls[0];

          // Check if the element is visible. This is from jQuery source - see
          // https://github.com/jquery/jquery/blob/e1b1b2d7fe5aff907a9accf59910bc3b7e4d1dec/src/css/hiddenVisibleSelectors.js#L12
          if (
            !(
              matchingEl.offsetWidth ||
              matchingEl.offsetHeight ||
              matchingEl.getClientRects().length
            )
          ) {
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
        },
        [selector, options],
        timeout
      )
    )
    .then(null, function(err) {
      if (/ScriptTimeout/.test(String(err))) {
        throw new Error(`ElementNotVisible - ${selector}`);
      } else {
        throw err;
      }
    });
});

/**
 * Check to ensure an element exists
 *
 * @param {string} selector
 * @returns {promise} rejects if element does not exist
 */
const testElementExists = thenify(function(selector) {
  return this.parent.findByCssSelector(selector).end();
});

/**
 * Click an element defined by `selector`, wait for an optional `readySelector`
 * to be displayed.
 *
 * @param {string} selector
 * @param {string} [readySelector]
 * @returns {promise}
 */
const click = thenify(function(selector, readySelector) {
  return (
    this.parent
      .findByCssSelector(selector)
      // Ensure the element is visible and not animating before attempting to click.
      // Sometimes clicks do not register if the element is in the middle of an animation.
      .then(visibleByQSA(selector))
      .click()
      .then(null, err => {
        // If element is obscured (possibly by a verification message covering it), attempt
        // to scroll to the top of page where it might be visible.
        if (/obscures it/.test(err.message)) {
          return this.parent
            .execute(() => {
              window.scrollTo(0, 0);
            })
            .findByCssSelector(selector)
            .click()
            .then(null, err => {
              // STILL obscured? There may be a status message
              // overlayed on top. Wait a few seconds and try
              // one final time.
              if (/obscures it/.test(err.message)) {
                return this.parent
                  .sleep(6000)
                  .findByCssSelector(selector)
                  .click()
                  .end();
              }

              throw err;
            })
            .end();
        }

        // Check to see if the error is a `stale element exception` and
        // retry clicking if it is. This could happen if a panel on
        // the page is re-rendered causing the element to be removed
        // from the DOM.
        if (
          /either the element is no longer attached to the DOM/.test(
            err.message
          )
        ) {
          return this.parent
            .sleep(2000)
            .findByCssSelector(selector)
            .click()
            .then(null, err => {
              throw err;
            })
            .end();
        }

        // re-throw other errors
        throw err;
      })
      .end()
      .then(function() {
        if (readySelector) {
          return this.parent.then(testElementExists(readySelector));
        }
      })
  );
});

/**
 * Force a focus event to fire on an element.
 *
 * @param {string} [selector] - selector of element - defaults to the window.
 * @returns {promise} - resolves when complete
 */
const focus = thenify(function(selector) {
  return this.parent.execute(
    function(selector) {
      // The only way to reliably cause a Focus Event is to manually create
      // one. Just clicking or focusing the window does not work if the
      // Selenium window is not in focus. This does however. BAM! See the
      // conversation in
      // https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/1671
      // The hint is: "... a hack to work around synthesized events not behaving properly"
      var target = selector ? document.querySelector(selector) : window;
      var event = new FocusEvent('focus');
      target.dispatchEvent(event);
    },
    [selector]
  );
});

/**
 * Type text into an input element
 *
 * @param {string} selector
 * @param {string} text
 * @param {object} [options] options
 *   @param {boolean} [options.clearValue] - clear element value before
 *   typing. Defaults to true.
 * @returns {promise}
 */
const type = thenify(function(selector, text, options = {}) {
  // always clear unless explicitly overridden
  var clearValue = options.clearValue !== false;

  text = String(text);

  return this.parent
    .then(click(selector))
    .findByCssSelector(selector)

    .then(function() {
      if (clearValue) {
        return this.parent.clearValue();
      }
    })

    .getAttribute('type')
    .then(function(type) {
      // xxx: bug in selenium 2.47.1, if firefox is out of
      // focus it will just type 1 number, split the type
      // commands for each character to avoid issues with the
      // test runner
      // calling `type` with more than one character on the "signup_password"
      // screen causes nothing to be written on the second attempt.
      if (type === 'number' || type === 'password') {
        var index = 0;
        var parent = this.parent;

        var typeNext = function() {
          if (index >= text.length) {
            return;
          }
          var charToType = text.charAt(index);
          index++;

          return parent.type(charToType).then(typeNext);
        };

        return typeNext.call(this);
      } else {
        return this.parent.type(text);
      }
    })

    .end();
});

const clearContentServerState = thenify(function(options) {
  options = options || {};
  // clear localStorage to avoid polluting other tests.
  return (
    this.parent
      // always go to the content server so the browser state is cleared,
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .getCurrentUrl()
      .then(function(url) {
        // only load up the content server if we aren't
        // already at the content server.
        if (url.indexOf(CONTENT_SERVER) === -1 || options.force) {
          return this.parent
            .get(CONTENT_SERVER + 'clear')
            .setFindTimeout(config.pageLoadTimeout)
            .findById('fxa-clear-storage-header');
        }
      })

      .clearCookies()
      .execute(function() {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.log('Failed to clearBrowserState');
          // if cookies are disabled, this will blow up some browsers.
        }
        return true;
      }, [])
  );
});

const clear123DoneState = thenify(function(options) {
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
  return (
    this.parent
      // switch to the top level frame, if we aren't already. This fixes the
      // iframe flow.
      .switchToFrame(null)
      .setFindTimeout(config.pageLoadTimeout)
      .get(app)

      .then(testElementExists('#footer-main'))

      .execute(function() {
        /* global $ */
        $.post('/api/logout/').always(function() {
          $('body').append('<div id="loggedout">Logged out</div>');
        });
      })
      .then(testElementExists('#loggedout'))
  );
});

/**
 * Close all windows but the first. Used to cleanup after
 * failing functional tests where the test fails when checking
 * the 2nd window.
 *
 * @returns {Promise}
 */
const closeAllButFirstWindow = thenify(function() {
  return this.parent.getAllWindowHandles().then(function(handles) {
    if (handles.length > 1) {
      return this.parent
        .switchToWindow(handles[1])
        .closeCurrentWindow()
        .switchToWindow(handles[0])
        .then(closeAllButFirstWindow());
    }
  });
});

/**
 * Get some memory back
 *
 */
const cleanMemory = thenify(function(selector, attributeName) {
  return (
    this.parent
      .get('about:memory')
      // Click the Minimize Memory Usage button
      .then(click('div.opsRow:nth-child(3) > button:nth-child(4)'))
      .then(testElementExists('.section'))
      .end()
  );
});

const clearBrowserState = thenify(function(options) {
  options = options || {};
  if (!('contentServer' in options)) {
    options.contentServer = true;
  }

  if (!('123done' in options)) {
    options['123done'] = false;
  }

  if (!('321done' in options)) {
    options['321done'] = false;
  }

  return this.parent
    .then(function() {
      if (options.contentServer) {
        return this.parent.then(clearContentServerState(options));
      }
    })
    .then(function() {
      if (options['123done']) {
        return this.parent.then(clear123DoneState());
      }
    })
    .then(function() {
      if (options['321done']) {
        return this.parent.then(clear123DoneState({ untrusted: true }));
      }
    })
    .then(cleanMemory())
    .then(closeAllButFirstWindow());
});

const clearSessionStorage = thenify(function() {
  // clear sessionStorage to avoid polluting other tests.
  return this.parent.execute(function() {
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
const imageLoadedByQSA = thenify(function(selector, timeout = 10000) {
  return this.parent.then(
    pollUntil(
      function(selector) {
        var match = document.querySelectorAll(selector);

        if (match.length > 1) {
          throw new Error(
            'Multiple elements matched. Make a more precise selector'
          );
        }

        return match[0] && match[0].naturalWidth > 0 ? true : null;
      },
      [selector],
      timeout
    )
  );
});

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
const pollUntilGoneByQSA = thenify(function(selector, timeout = 10000) {
  return this.parent.then(
    pollUntil(
      function(selector) {
        return document.querySelectorAll(selector).length === 0 ? true : null;
      },
      [selector],
      timeout
    )
  );
});

/**
 * Poll until an element is either removed from the DOM or hidden.
 *
 * @param {String} selector
 *        QSA compatible selector string
 * @param {Number} [timeout=config.pageLoadTimeout]
 *        Timeout to wait until element is gone or hidden
 */
const pollUntilHiddenByQSA = thenify(function(
  selector,
  timeout = config.pageLoadTimeout
) {
  return this.parent
    .then(
      pollUntil(
        function(selector) {
          const matchingEls = document.querySelectorAll(selector);

          if (matchingEls.length === 0) {
            return true;
          }

          if (matchingEls.length > 1) {
            throw new Error(
              'Multiple elements matched. Make a more precise selector - ' +
                selector
            );
          }

          const matchingEl = matchingEls[0];

          // Check if the element is visible. This is from jQuery source - see
          // https://github.com/jquery/jquery/blob/e1b1b2d7fe5aff907a9accf59910bc3b7e4d1dec/src/css/hiddenVisibleSelectors.js#L12
          if (
            !(
              matchingEl.offsetWidth ||
              matchingEl.offsetHeight ||
              matchingEl.getClientRects().length
            )
          ) {
            return true;
          }

          // use jQuery if available to check for jQuery animations.
          if (typeof $ !== 'undefined' && $(selector).is(':animated')) {
            // If the element is animating, try again after a delay. Clicks
            // do not always register if the element is in the midst of
            // an animation.
            return null;
          }

          return null;
        },
        [selector],
        timeout
      )
    )
    .then(null, function(err) {
      if (/ScriptTimeout/.test(String(err))) {
        throw new Error(`ElementNotHidden - ${selector}`);
      } else {
        throw err;
      }
    });
});

/**
 * Ensure no such element exists.
 *
 * @param   {string} selector of element to ensure does not exist.
 * @param   {number} [timeoutMS] number of ms to wait for the element. Defaults to 0.
 * @returns {promise} resolves when complete, fails if element exists.
 */
const noSuchElement = thenify(function(selector, timeoutMS = 0) {
  return this.parent
    .setFindTimeout(timeoutMS)

    .findByCssSelector(selector)
    .then(
      function() {
        throw new Error(selector + ' should not be present');
      },
      function(err) {
        if (/NoSuchElement/.test(String(err))) {
          // swallow the error
          return;
        }

        throw err;
      }
    )
    .end()

    .setFindTimeout(config.pageLoadTimeout);
});

/**
 * Get an fxa-js-client instance
 *
 * @returns {Object}
 */
function getFxaClient() {
  return new FxaClient(AUTH_SERVER_ROOT, {
    xhr: nodeXMLHttpRequest.XMLHttpRequest,
  });
}

/**
 * Get the value of a query parameter
 *
 * @param {String} paramName
 * @returns {promise} that resolves to the query parameter's value
 */
const getQueryParamValue = thenify(function(paramName) {
  return this.parent.getCurrentUrl().then(function(url) {
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
const getEmail = thenify(function(user, index, options) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  // restmail takes a count, not an index. Add 1.
  return this.parent
    .then(() => restmail.waitForEmail(user, index + 1, options))
    .then(emails => emails[index]);
});

/**
 * Delete all emails for `user`
 *
 * @param {String} user - username or email address
 * @returns {Promise} resolves when complete
 */
const deleteAllEmails = thenify(function(user) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  return this.parent.then(() => restmail.deleteAllEmails(user));
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
  if (intern._config.fxaProduction) {
    return function() {};
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
const getSms = thenify(function(phoneNumber, index, options) {
  return this.parent
    .then(getEmail(phoneNumberToEmailAddress(phoneNumber), index, options))
    .then(email => {
      return email.text.trim();
    });
});

/**
 * Delete all SMS messages for `phoneNumber`
 *
 * @param {String} phoneNumber
 * @returns {Promise} resolves when complete
 */
const deleteAllSms = thenify(function(phoneNumber) {
  return this.parent.then(
    deleteAllEmails(phoneNumberToEmailAddress(phoneNumber))
  );
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
const testSmsFormat = thenify(function(phoneNumber, index, smsFormatRegExp) {
  return this.parent.then(getSms(phoneNumber, index)).then(sms => {
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
const getSmsSigninCode = thenify(function(phoneNumber, index, options) {
  return this.parent
    .then(testSmsFormat(phoneNumber, index, SIGNIN_CODE_SMS_FORMAT))
    .then(getSms(phoneNumber, index, options))
    .then(sms => {
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
    .then(email => email.headers);
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

  return this.parent.then(getEmailHeaders(user, index)).then(function(headers) {
    const link = headers['x-link'];
    if (!link) {
      throw new Error(
        'Email does not contain verification link: ' +
          headers['x-template-name']
      );
    }
    return link;
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
const getUnblockInfo = thenify(function(user, index) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  return this.parent.then(getEmailHeaders(user, index)).then(function(headers) {
    const unblockCode = headers['x-unblock-code'];
    if (!unblockCode) {
      throw new Error(
        'Email does not contain unblock code: ' + headers['x-template-name']
      );
    }
    return {
      reportSignInLink: headers['x-report-signin-link'],
      uid: headers['x-uid'],
      unblockCode: unblockCode,
    };
  });
});

/**
 * Get the token code from the verify sign-in email.
 *
 * @param {string} user or email
 * @param {number} index
 * @returns {promise} that resolves with token code  cc0
 */
const getTokenCode = thenify(function(user, index) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  return this.parent.then(getEmailHeaders(user, index)).then(headers => {
    const code =
      headers['x-signin-verify-code'] || headers['x-verify-short-code'];
    if (!code) {
      throw new Error(
        'Email does not contain token code: ' + headers['x-template-name']
      );
    }
    return code;
  });
});

/**
 * Get the signup code from the verify sign-up email.
 *
 * @param {string} user or email
 * @param {number} index
 * @returns {promise} that resolves with token code
 */
const getSignupCode = thenify(function(user, index) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  return this.parent.then(getEmailHeaders(user, index)).then(headers => {
    const code = headers['x-verify-short-code'];
    if (!code) {
      throw new Error(
        'Email does not contain signup code: ' + headers['x-template-name']
      );
    }
    return code;
  });
});

/**
 * Get the code to verify a secondary email.
 *
 * @param {string} user or email
 * @param {number} index
 * @returns {promise} that resolves with code
 */
const getEmailCode = thenify(function(user, index) {
  if (/@/.test(user)) {
    user = TestHelpers.emailToUser(user);
  }

  return this.parent.then(getEmailHeaders(user, index)).then(headers => {
    const code = headers['x-verify-code'];
    if (!code) {
      throw new Error(
        'Email does not contain code: ' + headers['x-template-name']
      );
    }
    return code;
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
const testEmailExpected = thenify(function(user, index, options) {
  return this.parent.then(getEmailHeaders(user, index, options)).then(
    function() {
      return true;
    },
    function(err) {
      if (/EmailTimeout/.test(String(err))) {
        throw new Error('EmailExpected');
      }

      throw err;
    }
  );
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
const noEmailExpected = thenify(function(user, index, options) {
  return this.parent.then(getEmailHeaders(user, index, options)).then(
    function() {
      throw new Error('NoEmailExpected');
    },
    function(err) {
      if (/EmailTimeout/.test(String(err))) {
        return true;
      }

      throw err;
    }
  );
});

/**
 * Open an external site.
 *
 * @returns {promise} resolves when complete
 */
const openExternalSite = thenify(function() {
  return this.parent
    .get(EXTERNAL_SITE_URL)
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
const openVerificationLinkInNewTab = thenify(function(
  email,
  index,
  options = {}
) {
  var user = TestHelpers.emailToUser(email);

  return this.parent
    .then(getVerificationLink(user, index))
    .then(function(verificationLink) {
      const verificationLinkWithParams = addQueryParamsToLink(
        verificationLink,
        options.query
      );
      return this.parent.execute(openWindow, [verificationLinkWithParams]);
    });
});

const openVerificationLinkInSameTab = thenify(function(
  email,
  index,
  options = {}
) {
  var user = TestHelpers.emailToUser(email);

  return this.parent
    .then(getVerificationLink(user, index))
    .then(function(verificationLink) {
      const verificationLinkWithParams = addQueryParamsToLink(
        verificationLink,
        options.query
      );
      return this.parent.get(verificationLinkWithParams);
    });
});

/**
 * Open a new tab to `url`
 *
 * @param {String} url to open
 * @returns {Promise}
 */
const openTab = thenify(function(url) {
  return this.parent.execute(openWindow, [url]);
});

/**
 * Switch to a new window/tab
 *
 * @param {Number} which - tab index to switch to
 * @returns {Promise}
 */
const switchToWindow = thenify(function(which) {
  if (typeof which !== 'number') {
    throw new Error('`which` must be a number');
  }
  return this.parent.getAllWindowHandles().then(function(handles) {
    if (handles.length >= which && handles[which]) {
      return this.parent.switchToWindow(handles[which]);
    } else {
      // give a little time to open the browser tab, otherwise
      // geckodriver sometimes attempts to switch to the tab
      // before it's open. See #4740
      return this.parent.sleep(1000).then(switchToWindow(which));
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
const respondToWebChannelMessage = thenify(function(expectedCommand, response) {
  var attachedId = Math.floor(Math.random() * 10000);
  return (
    this.parent
      .execute(
        function(expectedCommand, response, attachedId) {
          function listener(e) {
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
                    messageId: messageId,
                  },
                },
              });

              dispatchEvent(event);
            }
          }

          function startListening() {
            try {
              addEventListener('WebChannelMessageToChrome', listener);
            } catch (e) {
              // problem adding the listener, window may not be
              // ready, try again.
              setTimeout(startListening, 0);
            }

            const el = document.createElement('div');
            el.classList.add(`attached${attachedId}`);
            document.body.appendChild(el);
          }

          startListening();
        },
        [expectedCommand, response, attachedId]
      )
      // once the event is attached it adds a div with an attachedId.
      .then(testElementExists('.attached' + attachedId))
  );
});

/**
 * Respond to web channel messages
 *
 * @param {Object} webChannelMessages
 *  key->value pairs of message->response. Example:
 *    {
 *      'fxaccounts:fxa_status`: {
 *        signedInUser: {
 *          uid: '132142sfecd',
 *          email: 'testuser@testuser.com'
 *        }
 *      }
 *    }
 * @returns {Promise}
 */
const respondToWebChannelMessages = thenify(function(webChannelResponses) {
  return this.parent.then(function() {
    if (webChannelResponses) {
      return Object.keys(webChannelResponses).reduce(
        (parent, webChannelMessage) => {
          return parent.then(
            respondToWebChannelMessage(
              webChannelMessage,
              webChannelResponses[webChannelMessage]
            )
          );
        },
        this.parent
      );
    }
  });
});

/**
 * Store the data sent for a WebChannel event into sessionStorage.
 *
 * @param {string} expectedCommand command to store data for.
 * @returns {promise}
 */
const storeWebChannelMessageData = thenify(function(expectedCommand) {
  return this.parent.executeAsync(
    function(expectedCommand, callback) {
      function listener(e) {
        var command = e.detail.message.command;
        if (command === expectedCommand) {
          const storedEvents =
            JSON.parse(sessionStorage.getItem('webChannelEventData')) || {};
          storedEvents[command] = e.detail.message;
          sessionStorage.setItem(
            'webChannelEventData',
            JSON.stringify(storedEvents)
          );
          removeEventListener('WebChannelMessageToChrome', listener);
        }
      }

      function startListening() {
        try {
          addEventListener('WebChannelMessageToChrome', listener);
          callback();
        } catch (e) {
          // problem adding the listener, window may not be
          // ready, try again.
          removeEventListener('WebChannelMessageToChrome', listener);
          setTimeout(startListening, 0);
        }
      }

      startListening();
    },
    [expectedCommand]
  );
});

/**
 * Get the data stored for a WebChannel message. Data is only stored
 * if the message is listened for using `storeWebChannelMessageData`
 *
 * @param {string} command
 * @returns {object}
 */
const getWebChannelMessageData = thenify(function(command) {
  return this.parent.execute(
    function(command) {
      const storedEvents =
        JSON.parse(sessionStorage.getItem('webChannelEventData')) || {};
      return storedEvents[command];
    },
    [command]
  );
});

/**
 * Open a new tab to `url`. Meant to be called in a remote's `execute` function.
 *
 * @param {String} url
 */
function openWindow(url) {
  let newWindow;

  // Hook up the new window to listen for WebChannel messages.
  // XXX TODO: this is pretty gross to do universally like this...
  // XXX TODO: it will go away if we can make the original tab
  //           reliably be the one to complete the oauth flow.
  // We start listening for web channel messages as soon as
  // openPage is called, before the page is ready. Wait for
  // the prerequisites, then attach.
  function startListening() {
    try {
      newWindow.addEventListener('WebChannelMessageToChrome', function(e) {
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

  // The setTimeout is a workaround for geckodriver 0.19 & Fx >= 56. Without
  // the setTimeout the call to `execute(openWindow)` always times out.
  setTimeout(() => {
    newWindow = window.open(url);

    startListening();
  }, 0);
}

/**
 * Synthesize opening the verification link in a different browser.
 *
 * @param   {string} email - email to verify
 * @param   {number} [emailNumber] - email number with the verification link. Defaults to `0`.
 * @returns {promise} resolves when complete
 */
const openVerificationLinkInDifferentBrowser = thenify(function(
  email,
  emailNumber
) {
  var client = getFxaClient();
  var user = TestHelpers.emailToUser(email);

  return this.parent
    .then(getEmailHeaders(user, emailNumber || 0))
    .then(function(headers) {
      var uid = headers['x-uid'];
      var code = headers['x-verify-code'];
      if (!code) {
        throw new Error(
          'Email does not contain verify code: ' + headers['x-template-name']
        );
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
const openPasswordResetLinkInDifferentBrowser = thenify(function(
  email,
  password,
  emailNumber = 0
) {
  var client = getFxaClient();

  var user = TestHelpers.emailToUser(email);

  return this.parent
    .then(getEmailHeaders(user, emailNumber))
    .then(function(headers) {
      var code = headers['x-recovery-code'];
      // there is no x-recovery-token header, so we have to parse it
      // out of the link.
      var link = headers['x-link'];
      var search = Url.parse(link).query;
      var queryParams = Querystring.parse(search);
      var token = queryParams.token;
      if (!code) {
        throw new Error(
          'Email does not contain reset password code: ' +
            headers['x-template-name']
        );
      }
      return client.passwordForgotVerifyCode(code, token);
    })
    .then(function(result) {
      return client.accountReset(email, password, result.accountResetToken);
    });
});

/**
 * Open the settings page in a new tab.
 *
 * @param   {string} [panel] pathname of panel to open. Open `/settings` if not given.
 * @returns {promise} resolves when complete
 */
const openSettingsInNewTab = thenify(function(panel) {
  var url = SETTINGS_URL;
  if (panel) {
    url += '/' + panel;
  }
  return this.parent.execute(openWindow, [url]);
});

/**
 * Open the signin page in a new tab.
 *
 * @returns {promise} resolves when complete
 */
const openSignInInNewTab = thenify(function() {
  return this.parent.execute(openWindow, [SIGNIN_URL]);
});

/**
 * Open the signup page in a new tab.
 *
 * @returns {promise} resolves when complete
 */
const openSignUpInNewTab = thenify(function() {
  return this.parent.execute(openWindow, [SIGNUP_URL]);
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
const openPage = thenify(function(url, readySelector, options = {}) {
  url = addQueryParamsToLink(url, options.query || {});

  function isWebChannelSync() {
    return (
      /context=fx_desktop_v3/.test(url) || /context=fx_fennec_v1/.test(url)
    );
  }

  function isUAWithWebChannelSupport() {
    const forceUARegExp = /forceUA=([^&]+)/;
    const matches = forceUARegExp.exec(url);
    if (matches) {
      const uap = UAParser(decodeURIComponent(matches[1]));

      return (
        uap.browser.name === 'Firefox' &&
        uap.os.name !== 'iOS' &&
        parseInt(uap.browser.major, 10) > 40
      );
    }
    return false;
  }

  if (isWebChannelSync() || isUAWithWebChannelSupport()) {
    if (!options.webChannelResponses) {
      options.webChannelResponses = {};
    }

    if (!options.webChannelResponses['fxaccounts:can_link_account']) {
      options.webChannelResponses['fxaccounts:can_link_account'] = { ok: true };
    }

    if (!options.webChannelResponses['fxaccounts:fxa_status']) {
      options.webChannelResponses['fxaccounts:fxa_status'] = {
        capabilities: null,
        signedInUser: null,
      };
    }
  }
  if (options.webChannelResponses) {
    // If there are webChannelResponses, the automatedBrowser
    // query param introduces a short delay so that the web
    // channel response listeners can be hooked up before FxA
    // sends the fxaccounts:fxa_status message.
    options.query = {
      automatedBrowser: true,
      ...options.query,
    };
  }

  url = addQueryParamsToLink(url, options.query);

  return (
    this.parent
      .get(url)
      .setFindTimeout(config.pageLoadTimeout)

      .then(respondToWebChannelMessages(options.webChannelResponses))

      // Wait until the `readySelector` element is found to return.
      .then(() => {
        if (readySelector) {
          return this.parent.then(testElementExists(readySelector));
        }
      })

      .then(null, function errorOpenPage(err) {
        return this.parent
          .getCurrentUrl()
          .then(function(resultUrl) {
            console.log('Error fetching %s, now at %s', url, resultUrl);
          })
          .end()

          .then(function() {
            throw err;
          });
      })
  );
});

/**
 * Open the force auth page
 *
 * @param {object} [options]
 * @param {string} [options.header] - element selector that indicates
 *  "page is loaded". Defaults to `#fxa-force-auth-header`
 * @param {object} [options.query] - query strings to open page with
 */
const openForceAuth = thenify(function(options) {
  options = options || {};

  var urlToOpen =
    FORCE_AUTH_URL + '?' + Querystring.stringify(options.query || {});
  return this.parent.then(
    openPage(urlToOpen, options.header || '#fxa-force-auth-header', options)
  );
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
  return Url.format(parsedLink);
}

/**
 * Open FxA from an OAuth relier.
 *
 * @param {string} page - page to open
 * @param {object} [options]
 * @param {string} [options.header] - element selector that indicates
 *  "page is loaded". Defaults to `#fxa-force-auth-header`
 * @param {object} [options.query] - query parameters to open page with
 * @param {boolean} [options.untrusted] - if `true`, opens the Untrusted
 * relier. Defaults to `true`
 */
const openFxaFromRp = thenify(function(page, options = {}) {
  const expectedHeader =
    options.header || `#fxa-${page.replace('_', '-')}-header`;
  let buttonSelector = `.ready .${page}`;
  if (page === 'enter-email') {
    buttonSelector = '.email-first-button';
  }
  return (
    this.parent
      .then(
        //eslint-disable-next-line no-use-before-define
        openRP({
          // any query parameters that are meant for FxA are added
          // onto the RP URL, the RP propagates query parameters to FxA.
          ...options,
          header: buttonSelector,
        })
      )
      .then(click(buttonSelector))
      .then(respondToWebChannelMessages(options.webChannelResponses))

      // wait until the page fully loads or else the re-load with
      // the suffix will blow its lid when run against latest.
      .then(testElementExists(expectedHeader))
  );
});

/**
 * Open FxA from the untrusted OAuth relier.
 *
 * @param {string} page - page to open
 * @param {object} [options]
 * @param {string} [options.header] - element selector that indicates
 *  "page is loaded". Defaults to `#fxa-force-auth-header`
 * @param {object} [options.query] - query parameters to open page with
 */
function openFxaFromUntrustedRp(page, options) {
  options = options || {};
  options.untrusted = true;
  return openFxaFromRp(page, options);
}

/**
 * Open 123done.
 *
 * @param {object} [options={}]
 * @param {string} [options.header=selectors['123DONE'].BUTTON_SIGNIN] - element selector that indicates the page is loaded
 * @param {object} [options.query={}] - query parameters to open the page with
 */
const openRP = thenify(function(options = {}) {
  const app = options.untrusted ? UNTRUSTED_OAUTH_APP : OAUTH_APP;
  let queryString = '';
  if (options.query) {
    queryString = '?' + Querystring.stringify(options.query);
  }

  const endpoint = `${app}${queryString}`;
  return this.parent.then(
    openPage(endpoint, options.header || selectors['123DONE'].BUTTON_SIGNIN, {
      ...options,
      // never hook up web channel listeners on the RP.
      // 123done doesn't send WebChannel messages to the browser,
      // and we certainly don't expect a response. Hooking up
      // webChannelMessages here just slows down the test.
      webChannelResponses: null,
    })
  );
});

const fillOutSignIn = thenify(function(email, password, alwaysLoad) {
  return this.parent
    .getCurrentUrl()
    .then(function(currentUrl) {
      // only load the signin page if not already at a signin page.
      if (!/\/signin(?:$|\?)/.test(currentUrl) || alwaysLoad) {
        return this.parent
          .get(SIGNIN_URL)
          .setFindTimeout(intern._config.pageLoadTimeout);
      }
    })

    .then(type('input[type=email]', email))
    .then(type('input[type=password]', password))
    .then(click('button[type="submit"]'));
});

const fillOutSignInUnblock = thenify(function(email, number) {
  return this.parent
    .then(getUnblockInfo(email, number))
    .then(function(unblockInfo) {
      return this.parent.then(type('#unblock_code', unblockInfo.unblockCode));
    })
    .then(click('button[type=submit]'));
});

const fillOutSignInTokenCode = thenify(function(email, number) {
  return this.parent
    .then(getTokenCode(email, number))
    .then(tokenCode => {
      return this.parent.then(
        type(selectors.SIGNIN_TOKEN_CODE.INPUT, tokenCode)
      );
    })
    .then(click('button[type=submit]'));
});

const fillOutSignUpCode = thenify(function(email, number) {
  return this.parent
    .then(getSignupCode(email, number))
    .then(code => {
      return this.parent.then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, code));
    })
    .then(click('button[type=submit]'));
});

const fillOutPostVerifySecondaryEmailCode = thenify(function(email, number) {
  return this.parent
    .then(getEmailCode(email, number))
    .then(code => {
      return this.parent.then(
        type(selectors.POST_VERIFY_CONFIRM_SECONDARY_EMAIL.INPUT, code)
      );
    })
    .then(click('button[type=submit]'));
});

/**
 * Fill out the email-first enter-email screen
 *
 * @param {String} email
 * @param {String} expectedHeader - selector of expected header after submit is pressed
 */
const fillOutEmailFirstEmail = thenify(function(email, expectedHeader) {
  return this.parent
    .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
    .then(type(selectors.ENTER_EMAIL.EMAIL, email))
    .then(click(selectors.ENTER_EMAIL.SUBMIT))
    .then(testElementExists(expectedHeader));
});

/**
 * Fill out the email-first signup flow
 *
 * @param {String} email
 * @param {String} password
 * @param {Object} [options]
 *   @param {boolean} [options.enterEmail=true] Set to false to only fill out the password screen.
 */
const fillOutEmailFirstSignUp = thenify(function(
  email,
  password,
  options = {}
) {
  var age = options.age || 24;
  const vpassword = options.vpassword || password;

  return this.parent
    .then(() => {
      if (options.enterEmail !== false) {
        return this.parent.then(
          fillOutEmailFirstEmail(email, selectors.SIGNUP_PASSWORD.HEADER)
        );
      }
    })

    .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, password))
    .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, vpassword))
    .then(type(selectors.SIGNUP_PASSWORD.AGE, age))
    .then(click(selectors.SIGNUP_PASSWORD.SUBMIT));
});

const fillOutSignUp = thenify(function(email, password, options) {
  options = options || {};

  var enterEmail = options.enterEmail !== false;
  var age = options.age || 24;
  var submit = options.submit !== false;
  const vpassword = options.vpassword || password;

  return this.parent
    .getCurrentUrl()
    .then(function(currentUrl) {
      // only load the signup page if not already at a signup page.
      if (!/\/signup(?:$|\?)/.test(currentUrl)) {
        return this.parent
          .get(SIGNUP_URL)
          .setFindTimeout(intern._config.pageLoadTimeout);
      }
    })

    .then(function() {
      if (enterEmail) {
        return type(selectors.SIGNUP.EMAIL, email).call(this);
      }
    })
    .then(type(selectors.SIGNUP.PASSWORD, password))
    .then(() => {
      return type(selectors.SIGNUP.VPASSWORD, vpassword).call(this);
    })
    .then(type(selectors.SIGNUP.AGE, age))

    .then(function() {
      if (submit) {
        return click(selectors.SIGNUP.SUBMIT).call(this);
      }
    });
});

const fillOutRecoveryKey = thenify(function(recoveryKey) {
  return this.parent
    .then(
      testElementExists(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER)
    )
    .then(
      type(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.INPUT, recoveryKey)
    )
    .then(click(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.SUBMIT));
});

const fillOutResetPassword = thenify(function(email, options) {
  options = options || {};

  return this.parent
    .getCurrentUrl()
    .then(function(currentUrl) {
      // only load the reset_password page if not already at
      // the reset_password page.
      if (
        !/\/reset_password(?:$|\?)/.test(currentUrl) &&
        !options.skipPageRedirect
      ) {
        return this.parent
          .get(RESET_PASSWORD_URL)
          .setFindTimeout(intern._config.pageLoadTimeout);
      }
    })

    .then(testElementExists('#fxa-reset-password-header'))
    .then(type('form input.email', email))
    .then(click('button[type="submit"]'));
});

/**
 * Fill out the email-first signin flow
 */
const fillOutEmailFirstSignIn = thenify(function(email, password) {
  return this.parent
    .then(fillOutEmailFirstEmail(email, selectors.SIGNIN_PASSWORD.HEADER))
    .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, password))
    .then(click(selectors.SIGNIN_PASSWORD.SUBMIT));
});

/**
 * Fill out and submit the force auth page.
 *
 * @param {string} password
 */
const fillOutForceAuth = thenify(function(password) {
  return this.parent
    .setFindTimeout(intern._config.pageLoadTimeout)
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
const fillOutCompleteResetPassword = thenify(function(password, vpassword) {
  return this.parent
    .setFindTimeout(intern._config.pageLoadTimeout)

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
 * @param   {object} [options]
 *   @param {boolean} [options.expectSuccess=true] if set to `true`, tests whether
 *     the password change succeeds.
 *   @param {string} [options.vpassword=newPassword] If set, used as the verification password. If
 *     not specified, `newPassword` is used.
 * @returns {promise} resolves when complete
 */
const fillOutChangePassword = thenify(function(
  oldPassword,
  newPassword,
  options = {}
) {
  return this.parent
    .setFindTimeout(intern._config.pageLoadTimeout)

    .then(type(selectors.CHANGE_PASSWORD.OLD_PASSWORD, oldPassword))
    .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, newPassword))
    .then(
      type(
        selectors.CHANGE_PASSWORD.NEW_VPASSWORD,
        'vpassword' in options ? options.vpassword : newPassword
      )
    )
    .then(click(selectors.CHANGE_PASSWORD.SUBMIT))
    .then(function() {
      if (options.expectSuccess !== false) {
        return this.parent
          .then(pollUntilHiddenByQSA(selectors.CHANGE_PASSWORD.DETAILS))
          .then(testSuccessWasShown())
          .then(testIsBrowserNotified('fxaccounts:change_password')); //eslint-disable-line no-use-before-define
      }
    });
});

/**
 * Fill out and submit the delete account form.
 *
 * @param   {string} password user's password
 * @returns {promise} resolves when complete
 */
const fillOutDeleteAccount = thenify(function(password) {
  return (
    this.parent
      .setFindTimeout(intern._config.pageLoadTimeout)
      // check all required checkboxes
      .findAllByCssSelector(selectors.SETTINGS_DELETE_ACCOUNT.CHECKBOXES)
      .then(checkboxes => checkboxes.map(checkbox => checkbox.click()))
      .end()
      .then(type(selectors.SETTINGS_DELETE_ACCOUNT.INPUT_PASSWORD, password))
      // delete account
      .then(click(selectors.SETTINGS_DELETE_ACCOUNT.SUBMIT))
  );
});

function mouseevent(eventType) {
  return thenify(function(selector) {
    return this.parent.execute(
      function(selector, eventType) {
        var target = selector ? document.querySelector(selector) : window;
        var event = new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        target.dispatchEvent(event);
      },
      [selector, eventType]
    );
  });
}

var mousedown = mouseevent('mousedown');
var mouseout = mouseevent('mouseout');
var mouseup = mouseevent('mouseup');

const clearBrowserNotifications = thenify(function() {
  return this.parent.execute(function(command, done) {
    sessionStorage.removeItem('webChannelEvents');
    sessionStorage.removeItem('webChannelEventData');
  });
});

function waitForWebChannelCommand(command, done) {
  function check() {
    var storedEvents;
    try {
      storedEvents =
        JSON.parse(sessionStorage.getItem('webChannelEvents')) || [];
    } catch (e) {
      storedEvents = [];
    }

    const event = storedEvents.find(event => event.command === command);
    if (event) {
      done(event);
    } else {
      setTimeout(check, 50);
    }
  }

  check();
}

/**
 * Test to ensure the browser has received a web channel notification.
 *
 * @param {string} command to ensure was received
 * @param [{function<{command:string,data:object}>}] additionalTests -
 *   function to call with the stored event data, can be used to
 *   perform additional tests.
 * @returns {promise} rejects if message has not been received.
 */
const testIsBrowserNotified = thenify(function(
  command,
  additionalTests = null
) {
  return (
    this.parent
      // Allow some time for the event to come through.
      .setExecuteAsyncTimeout(4000)
      .executeAsync(waitForWebChannelCommand, [command])
      .then(additionalTests, function(err) {
        if (/ScriptTimeout/.test(String(err))) {
          var noSuchNotificationError = new Error('NoSuchBrowserNotification');
          noSuchNotificationError.command = command;
          throw noSuchNotificationError;
        } else {
          throw err;
        }
      })
  );
});

/**
 * Test to ensure the browser has not received a web channel notification.
 *
 * @param   {string} command command that should not be received.
 * @returns {promise} rejects if command has been received
 */
const noSuchBrowserNotification = thenify(function(command) {
  return (
    this.parent
      // Allow some time for the event to come through.
      .setExecuteAsyncTimeout(4000)
      .executeAsync(waitForWebChannelCommand, [command])
      .then(
        function() {
          var unexpectedNotificationError = new Error(
            'UnexpectedBrowserNotification'
          );
          unexpectedNotificationError.command = command;
          throw unexpectedNotificationError;
        },
        function(err) {
          if (!/ScriptTimeout/.test(String(err))) {
            // script timeouts are expected here!
            throw err;
          }
        }
      )
  );
});

/**
 * Check to ensure the page does not transition
 *
 * @param {String} selector
 * @param {Number} [timeout] time to wait in ms. Defaults to 5000ms
 * @returns {promise} that resolves if the selector is found
 * before and after the timeout.
 */
const noPageTransition = thenify(function(selector, timeout) {
  return this.parent
    .then(testElementExists(selector))
    .sleep(timeout || 5000)
    .then(testElementExists(selector));
});

/**
 * Fetch all the metrics that have been logged by the front end.
 *
 * @returns {promise} resolves with the logged metrics.
 */
const fetchAllMetrics = thenify(function() {
  return this.parent.execute(function() {
    var key = '__fxa_storage.metrics_all';
    var item;
    try {
      item = JSON.parse(localStorage.getItem(key));
    } catch (e) {}
    return item;
  });
});

/**
 * Test to ensure all events in the list have been logged.
 *
 * @param   {string[]} eventsNames
 * @returns {promise} rejects if all events are not logged
 */
const testAreEventsLogged = thenify(function(eventsNames) {
  return this.parent
    .then(fetchAllMetrics())
    .then(function(metrics) {
      var events = metrics.reduce(function(evts, metrics) {
        var evtsNames = metrics.events.map(function(evt) {
          return evt.type;
        });
        return evts.concat(evtsNames);
      }, []);

      return this.parent.execute(
        function(eventsNames, events) {
          var toFindAll = eventsNames.slice().reverse();
          var toFind = toFindAll.pop();

          events.forEach(function(event) {
            if (event === toFind) {
              toFind = toFindAll.pop();
            }
          });

          return toFindAll.length === 0;
        },
        [eventsNames, events]
      );
    })
    .then(function(found) {
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
const testElementWasShown = thenify(function(selector, message) {
  function messageCheck() {
    return message
      ? // eslint-disable-next-line no-use-before-define
        testElementTextEquals(selector, message)
      : Promise.resolve();
  }

  return this.parent
    .then(testElementExists(selector))
    .then(messageCheck)
    .executeAsync(
      function(selector, done) {
        // remove the attribute so subsequent checks can be made
        // against the same element. displaySuccess and displayError
        // will re-add the 'data-shown' attribute.
        $(selector).removeAttr('data-shown');
        done();
      },
      [selector]
    );
});

/**
 * Test whether the success message was shown.
 *
 * @param {string} [selector] defaults to `.success[data-shown]`
 * @returns {promise} rejects if error element was not shown.
 */
function testSuccessWasShown(message, selector) {
  selector = selector || '.success[data-shown]';
  return testElementWasShown(selector, message);
}

/**
 * Test whether the success message was not shown.
 *
 * @param {string} [selector] defaults to `.success[data-shown]`
 * @returns {promise} rejects if error element was shown.
 */
function testSuccessWasNotShown(selector) {
  selector = selector || '.success[data-shown]';
  return noSuchElement(selector);
}

/**
 * Test whether the error message was shown.
 *
 * @param {string} [selector] defaults to `.error[data-shown]`
 * @returns {promise} rejects if error element was not shown.
 */
function testErrorWasShown(message, selector) {
  selector = selector || '.error[data-shown]';
  return testElementWasShown(selector);
}

/**
 * Test whether the error message was not shown.
 *
 * @param {string} [selector] defaults to `.error[data-shown]`
 * @returns {promise} rejects if error element was shown.
 */
function testErrorWasNotShown(selector) {
  selector = selector || '.error[data-shown]';
  return noSuchElement(selector);
}

/**
 * Check to ensure an element has a `disabled` attribute.
 *
 * @param {string} selector
 * @returns {promise} rejects if test fails
 */
const testElementDisabled = thenify(function(selector) {
  return this.parent
    .findByCssSelector(selector)
    .getAttribute('disabled')
    .then(function(disabledValue) {
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
const testElementDisplayed = thenify(function(selector) {
  return this.parent
    .then(visibleByQSA(selector))
    .findByCssSelector(selector)
    .isDisplayed()
    .then(function(isDisplayed) {
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
const noSuchElementDisplayed = thenify(function(selector) {
  return this.parent
    .findByCssSelector(selector)
    .isDisplayed()
    .then(function(isDisplayed) {
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
const testElementTextEquals = thenify(function(selector, expected) {
  return this.parent
    .findByCssSelector(selector)
    .then(visibleByQSA(selector))
    .getVisibleText()
    .then(function(resultText) {
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
const testElementTextInclude = thenify(function(selector, expected) {
  return this.parent
    .findByCssSelector(selector)
    .then(visibleByQSA(selector))
    .getVisibleText()
    .then(function(resultText) {
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
const testElementValueEquals = thenify(function(selector, expected) {
  return this.parent
    .findByCssSelector(selector)
    .getProperty('value')
    .then(function(resultText) {
      assert.equal(resultText, expected);
    })
    .end();
});

/**
 * Check whether an element text is not empty
 *
 * @param {string} selector
 * @param {string} expected
 * @param {object} [options]
 * @returns {promise} rejects if test fails.
 */
const testElementTextNotEmpty = thenify(function(selector) {
  return this.parent
    .findByCssSelector(selector)
    .then(visibleByQSA(selector))
    .getVisibleText()
    .then(function(resultText) {
      assert.notEqual(resultText, '');
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
const testHrefEquals = thenify(function(selector, expected) {
  return this.parent.then(testAttributeEquals(selector, 'href', expected));
});

/**
 * Check whether the current URL matches the expected value
 *
 * @param {string} expected
 * @returns {promise} fails if url does not equal expected value
 */
const testUrlEquals = thenify(function(expected) {
  return this.parent
    .getCurrentUrl()
    .then(function(url) {
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
const testUrlPathnameEquals = thenify(function(expected) {
  return this.parent
    .getCurrentUrl()
    .then(function(url) {
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
const testUrlInclude = thenify(function(expected) {
  return this.parent
    .getCurrentUrl()
    .then(function(url) {
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
const createUser = thenify(function(email, password, options) {
  options = options || {};
  return this.parent.then(function() {
    var client = getFxaClient();

    return client.signUp(email, password, {
      lang: 'en',
      preVerified: options.preVerified,
    });
  });
});

/**
 * Close the current window and switch to the named tab. If
 * The window will only be closed if it's not the last open window.
 *
 * @returns {promise}
 */
const closeCurrentWindow = thenify(function() {
  return this.parent.getAllWindowHandles().then(function(handles) {
    if (handles.length <= 1) {
      throw new Error('LastWindowError');
    } else {
      return this.parent.closeCurrentWindow().switchToWindow(handles[0]);
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
const testAttribute = thenify(function(
  selector,
  attributeName,
  assertion,
  value
) {
  return this.parent
    .findByCssSelector(selector)
    .getAttribute(attributeName)
    .then(function(attributeValue) {
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
function testAttributeEquals(selector, attributeName, value) {
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
function testAttributeMatches(selector, attributeName, regex) {
  return testAttribute(selector, attributeName, 'match', regex);
}
/**
 * Assert that an attribute value includes `needle`
 * @param {string} selector CSS selector for the element
 * @param {string} attributeName Name of attribute
 * @param {string} needle value that should be included in the attribute's value
 * @returns {promise}
 */
function testAttributeIncludes(selector, attributeName, needle) {
  return testAttribute(selector, attributeName, 'include', needle);
}

/**
 * Check that an element has an attribute
 *
 * @param {string} selector CSS selector for the element
 * @param {string} attributeName Name of attribute
 * @returns {promise} resolves to true if attribute exists, false otw.
 */
const testAttributeExists = thenify(function(selector, attributeName) {
  return this.parent
    .findByCssSelector(selector)
    .getAttribute(attributeName)
    .then(function(attributeValue) {
      assert.notStrictEqual(attributeValue, null);
    })
    .end();
});

/**
 * Ensure `attributeName` does not exist on element
 * selected by `selector`.
 *
 * @param {string} selector CSS selector for the element
 * @param {string} attributeName Name of attribute
 * @returns {promise} resolves if attribute does not exist, rejects otherwise.
 */
const noSuchAttribute = thenify(function(selector, attributeName) {
  return this.parent
    .findByCssSelector(selector)
    .getAttribute(attributeName)
    .then(function(attributeValue) {
      // Older Firefoxes return an attribute value of `null`,
      // Newer Firefoxes return an attribute value of ''.
      assert.isTrue(attributeValue === '' || attributeValue === null);
    })
    .end();
});

/**
 * Denormalize the email stored in an account. Sets the email to be all uppercase.
 *
 * @param   {string} email - email address to denormalize
 * @returns {promise}
 */
const denormalizeStoredEmail = thenify(function(email) {
  return this.parent.execute(
    email => {
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
    },
    [email]
  );
});

/**
 * Get account data from localStorage.
 *
 * @param {string} email - email of account
 * @returns {promise} resolves with the account data, if exists,
 *  resolves with `undefined` if not.
 */
function getStoredAccountByEmail(email) {
  return function() {
    return this.parent.execute(
      email => {
        // synthesize the user signing in before the email normalization fix went in (#4470)
        var accounts = JSON.parse(
          localStorage.getItem('__fxa_storage.accounts')
        );
        console.log('looking for email', email);

        for (var uid in accounts) {
          var account = accounts[uid];
          if (account.email === email) {
            return account;
          }
        }
      },
      [email]
    );
  };
}

/**
 * Ensure no such account is stored with the `email`
 *
 * @param {string} email - email of account
 * @returns {promise} resolves if no account with `email`, rejects otherwise.
 */
function noSuchStoredAccountByEmail(email) {
  return function() {
    return this.parent.then(getStoredAccountByEmail(email)).then(account => {
      if (account) {
        throw new Error('Account data should have been removed: ' + email);
      }
    });
  };
}

/**
 * Wait for the given `url`
 *
 * @param {string|function} url - url to wait for, or a function that takes the URL and returns true when ready to continue
 * @returns {promise} resolves when true
 */

const waitForUrl = thenify(function(url) {
  return this.parent.getCurrentUrl().then(function(currentUrl) {
    if (typeof url === 'function' ? url(currentUrl) : currentUrl !== url) {
      return this.parent.sleep(500).then(waitForUrl(url));
    }
  });
});

const generateTotpCode = secret => {
  secret = secret.replace(/[- ]*/g, '');
  const authenticator = new otplib.authenticator.Authenticator();
  authenticator.options = otplib.authenticator.options;
  return authenticator.generate(secret);
};

const confirmRecoveryCode = thenify(function() {
  return this.parent
    .findByCssSelector(selectors.SIGNIN_RECOVERY_CODE.FIRST_CODE)
    .getVisibleText()
    .then(code => {
      return this.parent
        .then(click(selectors.TOTP.RECOVERY_CODES_DONE))
        .then(type(selectors.TOTP.CONFIRM_RECOVERY_INPUT, code))
        .then(click(selectors.TOTP.CONFIRM_RECOVERY_BUTTON));
    });
});

const confirmTotpCode = thenify(function(secret) {
  return this.parent
    .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, generateTotpCode(secret)))
    .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
    .then(testElementExists(selectors.SIGNIN_RECOVERY_CODE.MODAL))
    .then(confirmRecoveryCode());
});

const enableTotp = thenify(function() {
  let secret;

  return (
    this.parent
      .then(openPage(ENABLE_TOTP_URL, selectors.TOTP.ENABLE_BUTTON))
      .then(click(selectors.TOTP.ENABLE_BUTTON, selectors.TOTP.QR_CODE))
      .then(click(selectors.TOTP.SHOW_CODE_LINK))
      .then(testElementExists(selectors.TOTP.MANUAL_CODE))

      // Store the secret key to recalculate the code later
      .findByCssSelector(selectors.TOTP.MANUAL_CODE)
      .getVisibleText()
      .then(secretKey => {
        secret = secretKey;
      })
      .then(() => this.parent.then(click(selectors.TOTP.KEY_OK_BUTTON)))
      .then(() => this.parent.then(confirmTotpCode(secret)))
      .then(() => secret)
  );
});
/**
 * Destroy the session for the given `email`. Only destroys
 * the first session for the given email address.
 *
 * @param {string} email - email of the session to destroy.
 * @returns {promise} resolves when complete
 */
const destroySessionForEmail = thenify(function(email) {
  return this.parent.then(getStoredAccountByEmail(email)).then(account => {
    if (!account) {
      return false;
    }
    const client = getFxaClient();
    return client.sessionDestroy(account.sessionToken);
  });
});

/**
 * Subscribe to the test product. The user should be signed in at this point.
 *
 * @returns {promise} resolves when complete
 */
const subscribeToTestProduct = thenify(function() {
  const nextYear = (new Date().getFullYear() + 1).toString().substr(2);
  return this.parent
    .then(openPage(TEST_PRODUCT_URL, 'div.product-payment'))
    .then(getQueryParamValue('device_id'))
    .then(deviceId => assert.ok(deviceId))
    .then(getQueryParamValue('flow_begin_time'))
    .then(flowBeginTime => assert.ok(flowBeginTime))
    .then(getQueryParamValue('flow_id'))
    .then(flowId => assert.ok(flowId))
    .then(type('input[name=name]', 'Testo McTestson'))
    .switchToFrame(2)
    .then(type('input[name=cardnumber]', '4242 4242 4242 4242'))
    .switchToParentFrame()
    .end(Infinity)
    .switchToFrame(3)
    .then(type('input[name=exp-date]', `12${nextYear}`))
    .switchToParentFrame()
    .end(Infinity)
    .switchToFrame(4)
    .then(type('.InputElement', '123'))
    .switchToParentFrame()
    .end(Infinity)
    .then(type('input[name=zip]', '12345'))
    .then(click('input[type=checkbox]'))
    .then(click('button[name=submit]'))
    .then(testElementExists('.download-link'))
    .then(openPage(SUBSCRIPTION_MGMT_URL, '.subscription-management'))
    .then(testElementExists('div[data-testid="subscription-item"]'));
});

/**
+ * Send verification reminder emails
+ */
const sendVerificationReminders = thenify(function() {
  return this.parent.then(() => {
    const cwd = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'fxa-auth-server',
      'scripts'
    );
    return cp.execSync('node verification-reminders.js', {
      cwd,
      env: {
        ...process.env,
        NODE_ENV: 'dev',
      },
      stdio: 'ignore',
      timeout: this.timeout,
    });
  });
});

module.exports = {
  ...TestHelpers,
  cleanMemory,
  clearBrowserNotifications,
  clearBrowserState,
  clearSessionStorage,
  click,
  closeCurrentWindow,
  confirmTotpCode,
  createUser,
  deleteAllEmails,
  deleteAllSms,
  denormalizeStoredEmail,
  destroySessionForEmail,
  disableInProd,
  enableTotp,
  confirmRecoveryCode,
  fetchAllMetrics,
  fillOutChangePassword,
  fillOutCompleteResetPassword,
  fillOutDeleteAccount,
  fillOutEmailFirstEmail,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutForceAuth,
  fillOutPostVerifySecondaryEmailCode,
  fillOutRecoveryKey,
  fillOutResetPassword,
  fillOutSignIn,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  fillOutSignUp,
  fillOutSignUpCode,
  focus,
  generateTotpCode,
  getEmail,
  getEmailHeaders,
  getEmailCode,
  getFxaClient,
  getQueryParamValue,
  getSignupCode,
  getSms,
  getSmsSigninCode,
  getStoredAccountByEmail,
  getUnblockInfo,
  getVerificationLink,
  getWebChannelMessageData,
  imageLoadedByQSA,
  mousedown,
  mouseevent,
  mouseout,
  mouseup,
  noEmailExpected,
  noPageTransition,
  noSuchAttribute,
  noSuchBrowserNotification,
  noSuchElement,
  noSuchElementDisplayed,
  noSuchStoredAccountByEmail,
  openExternalSite,
  openForceAuth,
  openFxaFromRp,
  openFxaFromUntrustedRp,
  openPage,
  openPasswordResetLinkInDifferentBrowser,
  openRP,
  openSettingsInNewTab,
  openSignInInNewTab,
  openSignUpInNewTab,
  openTab,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  pollUntil,
  pollUntilGoneByQSA,
  pollUntilHiddenByQSA,
  respondToWebChannelMessage,
  sendVerificationReminders,
  storeWebChannelMessageData,
  subscribeToTestProduct,
  switchToWindow,
  takeScreenshot,
  testAreEventsLogged,
  testAttribute,
  testAttributeEquals,
  testAttributeExists,
  testAttributeIncludes,
  testAttributeMatches,
  testElementDisabled,
  testElementDisplayed,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testElementTextNotEmpty,
  testElementValueEquals,
  testEmailExpected,
  testErrorTextInclude,
  testErrorWasShown,
  testErrorWasNotShown,
  testHrefEquals,
  testIsBrowserNotified,
  testSmsFormat,
  testSuccessWasShown,
  testSuccessWasNotShown,
  testUrlEquals,
  testUrlInclude,
  testUrlPathnameEquals,
  thenify,
  type,
  visibleByQSA,
  waitForUrl,
};
