/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require',
  'tests/lib/restmail',
  'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (intern, require, restmail, pollUntil) {
  'use strict';

  var config = intern.config;
  var CONTENT_SERVER = config.fxaContentRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var OAUTH_APP = config.fxaOauthApp;

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
      // always go to the content server so the browser state is cleared
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
      .execute(function () {
        try {
          /* global document, localStorage, sessionStorage */
          localStorage.clear();
          sessionStorage.clear();
          document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
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
  function visibleByQSA(selector) {
    return pollUntil(function (selector) {
      /* global document */
      var match = document.querySelectorAll(selector);

      if (match.length > 1) {
        throw new Error('Multiple elements matched. Make a more precise selector');
      }

      return match[0] && match[0].offsetWidth > 0 ? true : null;
    }, [ selector ], 10000);
  }

  function getVerificationLink(user, index) {
    return getVerificationHeaders(user, index)
      .then(function (headers) {
        return require.toUrl(headers['x-link']);
      });
  }

  function getVerificationHeaders(user, index) {
    // restmail takes an index that is 1 based instead of 0 based.
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, index + 1)
      .then(function (emails) {
        return emails[index].headers;
      });
  }

  return {
    clearBrowserState: clearBrowserState,
    clearSessionStorage: clearSessionStorage,
    visibleByQSA: visibleByQSA,
    pollUntil: pollUntil,
    getVerificationLink: getVerificationLink,
    getVerificationHeaders: getVerificationHeaders
  };
});
