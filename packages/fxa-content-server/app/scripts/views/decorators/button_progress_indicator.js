/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Function decorator to show a button progress indicator during
 * asynchronous operations.
 *
 * Progress indicator is removed whenever the handler completes, unless
 * the handler returns a value that that contains `pageNavigation: true`.
 *
 * Requires the invokeHandler function.
 */

'use strict';

define([
  'lib/promise',
  'views/button_progress_indicator'
],
function (p, ButtonProgressIndicator) {

  function showButtonProgressIndicator(handler, _el) {
    var el = _el || 'button[type=submit]';

    return function () {
      var self = this;
      var args = arguments;

      var buttonProgressIndicator = getButtonProgressIndicator.call(self);
      buttonProgressIndicator.start(self.$(el));

      return p()
          .then(function () {
            return self.invokeHandler(handler, args);
          })
          .then(function (value) {
            // Stop the progress indicator unless the page is navigating
            if (! (value && value.pageNavigation)) {
              buttonProgressIndicator.done();
            }
            return value;
          }, function(err) {
            buttonProgressIndicator.done();
            throw err;
          });
    };
  }

  function getButtonProgressIndicator() {
    /*jshint validthis: true*/
    var self = this;
    if (! self._buttonProgressIndicator) {
      self._buttonProgressIndicator = new ButtonProgressIndicator();
      self.trackSubview(self._buttonProgressIndicator);
    }

    return self._buttonProgressIndicator;
  }

  return showButtonProgressIndicator;
});
