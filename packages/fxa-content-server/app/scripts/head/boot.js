/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  'use strict';

  // Add a global namespace that modules in the HEAD can attach
  // to. The namespace will be removed when complete.
  window.FxaHead = {
    unload: function () {
      // We clean up after ourselves when complete.
      window.FxaHead = null;
      try {
        delete window.FxaHead;
      } catch (e) {
        // IE8 will blow up, ignore.
      }
    }
  };
}());

