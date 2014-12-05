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

  // JS check. If Javascript is enabled, the `no-js` class on the
  // html element is replaced with `js`.
  docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, 'js');

  // touch event check.
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch) {
    docElement.className += ' touch';
  } else {
    docElement.className += ' no-touch';
  }
  // END MODERNIZR BASED CODE

  // Code below here is our own.
  var pwElement = document.createElement('input');
  pwElement.setAttribute('type', 'password');

  try {
    // IE8 will blow up here.
    pwElement.setAttribute('type', 'text');
    docElement.className += ' toggle-pw';
  } catch(e) {
    docElement.className += ' no-toggle-pw';
  }

  /**
   * I feel so dirty doing this. I have been unable to find a way
   * to reliably check whether a browser supports the ::-reveal
   * pseudo-element. IE >= 10 has an ::-ms-reveal pseudo-element.
   * If I use window.getComputedStyle(pwElement, '::-ms-reveal'), I get
   * some info back, but info is also returned for
   * window.getComputedStyle(pwElement, '::nonexistent').
   */
  if (document.documentMode && document.documentMode >= 10) {
    docElement.className += ' reveal-pw';
  } else {
    docElement.className += ' no-reveal-pw';
  }

  /**
   * The iframe'd OAuth flow needs special styling applied to it as
   * soon as possible so that it doesn't look terrible.
   */
  if (window.top && window.top !== window) {
    var htmlElement = document.querySelector('html');
    htmlElement.className += ' iframe';
  }
}());
