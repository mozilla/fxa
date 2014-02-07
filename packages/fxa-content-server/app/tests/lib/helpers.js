/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
], function() {
  function requiresFocus(callback, done) {
    if (document.hasFocus && document.hasFocus()) {
      callback();
    } else {
      var message =
          'Cannot check for focus - document does not have focus.\n' +
          'If this is in PhantomJS, Travis-CI, Sauce Labs, or Opera, this is expected.\n' +
          'Otherwise, try focusing the test document instead of \n' +
          'another window or dev tools.';

      console.warn(message);
      if (done) {
        done();
      }
    }
  }

  return {
    requiresFocus: requiresFocus
  };
});
