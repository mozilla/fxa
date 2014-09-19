/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require',
  'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (intern, require, pollUntil) {
  'use strict';

  var config = intern.config;
  var CONTENT_SERVER = config.fxaContentRoot;

  function clearBrowserState(context) {
    // clear localStorage to avoid polluting other tests.
    return context.get('remote')
      // always go to the content server so the browser state is cleared
      .setFindTimeout(config.pageLoadTimeout)
      .getCurrentUrl()
      .then(function (url) {
        // only load up the content server if we aren't
        // already at the content server.
        if (url.indexOf(CONTENT_SERVER) === -1) {
          return context.get('remote').get(require.toUrl(CONTENT_SERVER));
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

  return {
    clearBrowserState: clearBrowserState,
    clearSessionStorage: clearSessionStorage,
    visibleByQSA: visibleByQSA,
    pollUntil: pollUntil
  };
});
