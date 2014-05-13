/*!
 * This code comes from Modernizr v2.7.1
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */
(function() {
  'use strict';

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
}());

