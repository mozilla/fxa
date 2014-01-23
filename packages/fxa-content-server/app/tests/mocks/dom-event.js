/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// mock out a DOM event

'use strict';

define([
], function () {
  function DOMEventMock() {
    // nothing to do
  }

  DOMEventMock.prototype = {
    preventDefault: function () {
      this._defaultPrevented = true;
    },

    isDefaultPrevented: function () {
      return !!this._defaultPrevented;
    }
  };

  return DOMEventMock;
});

