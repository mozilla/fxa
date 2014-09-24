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
  'views/progress_indicator'
],
function (p, ProgressIndicator) {

  function showProgressIndicator(handler, _el, _property) {
    var el = _el || 'button[type=submit]';
    var property = _property || '_progressIndicator';

    return function () {
      var self = this;
      var args = arguments;

      var progressIndicator = getProgressIndicator.call(self, property);
      progressIndicator.start(self.$(el));

      return p()
          .then(function () {
            return self.invokeHandler(handler, args);
          })
          .then(function (value) {
            // Stop the progress indicator unless the page is navigating
            if (! (value && value.pageNavigation)) {
              progressIndicator.done();
            }
            return value;
          }, function (err) {
            progressIndicator.done();
            throw err;
          });
    };
  }

  function getProgressIndicator(property) {
    /*jshint validthis: true*/
    var self = this;
    if (! self[property]) {
      self[property] = new ProgressIndicator();
      self.trackSubview(self[property]);
    }

    return self[property];
  }

  return showProgressIndicator;
});
