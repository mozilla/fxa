/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// mock out a DOM event

define(function (require, exports, module) {
  'use strict';


  function DOMEventMock() {
    // nothing to do
  }

  DOMEventMock.prototype = {
    preventDefault: function () {
      this._defaultPrevented = true;
    },

    isDefaultPrevented: function () {
      return !! this._defaultPrevented;
    },

    stopPropagation: function () {
      this._propagationStopped = true;
    },

    isPropagationStopped: function () {
      return !! this._propagationStopped;
    }
  };

  module.exports = DOMEventMock;
});

