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
  var CLEAR_URL = config.fxaContentRoot + 'clear';

  function clearBrowserState(context) {
    // clear localStorage to avoid polluting other tests.
    return context.get('remote')
      .get(require.toUrl(CLEAR_URL))
      .setFindTimeout(intern.config.pageLoadTimeout)
      .findById('fxa-clear-storage-header')
      .end();
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
    visibleByQSA: visibleByQSA,
    pollUntil: pollUntil
  };
});
