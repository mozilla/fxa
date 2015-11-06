/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the router object for testing.

define(function (require, exports, module) {
  'use strict';


  function CanvasMock() {
    // nothing to do here.
  }

  CanvasMock.prototype = {
    getContext: function () {
      this._context = {
        translate: function () { },
        rotate: function () { },
        drawImage: function () {
          this._args = arguments;
        }
      };

      return this._context;
    },
    toDataURL: function () {
      this._args = arguments;
      return 'data:image/jpeg';
    },
    toBlob: function (cb) {
      this._args = arguments;
      setTimeout(function () {
        cb({ type: 'image/jpeg' });
      }, 0);
    }
  };

  module.exports = CanvasMock;
});
