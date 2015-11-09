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

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');
  var ProgressIndicator = require('views/progress_indicator');

  function showProgressIndicator(handler, _el) {
    var el = _el || 'button[type=submit]';

    return function () {
      var self = this;
      var args = arguments;
      var target = self.$(el);

      var progressIndicator = getProgressIndicator(self, target);
      progressIndicator.start(target);

      return p()
        .then(function () {
          return self.invokeHandler(handler, args);
        })
        .then(function (value) {
          // Stop the progress indicator unless the flow halts.
          if (! (value && value.halt)) {
            progressIndicator.done();
          }
          return value;
        }, function (err) {
          progressIndicator.done();
          throw err;
        });
    };
  }

  function getProgressIndicator(context, target) {
    // use the progress indicator already attached
    // to the button, if one exists.
    var progressIndicator = target.data('progressIndicator');
    if (! progressIndicator) {
      progressIndicator = new ProgressIndicator();
      context.trackChildView(progressIndicator);

      // store a reference to the progress indicator on the button
      // itself. This allows a view's button to be updated and allow
      // the new button to receive a progress indicator. See #2502
      target.data('progressIndicator', progressIndicator);
    }

    return progressIndicator;
  }

  module.exports = showProgressIndicator;
});
