/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  'use strict';

  // BEGIN MODERNIZR BASED CODE
  /*!
   * This code comes from Modernizr v2.7.1
   * www.modernizr.com
   *
   * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
   * Available under the BSD and MIT licenses: www.modernizr.com/license/
   */
  var docElement = document.documentElement;

  // touch event check.
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch) {
    docElement.className += ' touch';
  } else {
    docElement.className += ' no-touch';
  }
  // END MODERNIZR BASED CODE

  // Code below here is our own.

  function parseQueryParams() {
    var search = document.location.search.replace(/^\?/, '');
    var paramPairs = search.split('&');
    var params = {};

    // Use old school for instead of Array.prototype.forEach because
    // env-test still has to run in IE8 even if the rest of the
    // app doesn't.
    for (var i = 0; i < paramPairs.length; ++i) {
      var paramPair = paramPairs[i].split('=');
      params[paramPair[0]] = paramPair[1] || 'undefined';
    }

    return params;
  }

  function isStyleAllowed(style) {
    var queryParams = parseQueryParams();
    var service = queryParams.service;
    var context = queryParams.context;

    // The 'chromeless' style is only opened up
    // to Sync when using an iframe.
    if (style === 'chromeless') {
      return (service === 'sync' && context === 'iframe');
    }

    return false;
  }

  if (document.documentMode && document.documentMode >= 10) {
    docElement.className += ' reveal-pw';
  } else {
    docElement.className += ' no-reveal-pw';
  }

  /**
   * The iframe'd OAuth flow needs special styling applied to it as
   * soon as possible so that it doesn't look terrible.
   *
   * We also need to make sure that the iframe name is not 'remote', that is used by 'about:accounts'.
   */
  if (window.top && window.top !== window && window.name !== 'remote') {
    docElement.className += ' iframe';
  }

  /**
   * A relier can add the `style=x` query parameter to indicate
   * an alternative styling should be used.
   * Allowed styles:
   *   * chromeless
   */
  var style = parseQueryParams().style;
  if (isStyleAllowed(style)) {
    docElement.className += (' ' + style);
  }

  /**
   * Check if the user is signing in to Sync on Firefox for iOS. User agent sniff. Yuck.
   */
  if (/FxiOS/.test(navigator.userAgent) && parseQueryParams().service === 'sync') {
    docElement.className += ' fx-ios-sync';
  }
}());
