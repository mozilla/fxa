/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Some polyfills for ES5 functions that are not available in IE8.

'use strict';

define([],
function () {

  // from
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          NoOp = function () {},
          fBound = function () {
            return fToBind.apply(this instanceof NoOp && oThis ? this : oThis,
                                 aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      NoOp.prototype = this.prototype;
      fBound.prototype = new NoOp();

      return fBound;
    };
  }

  return {};
});

