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

import ProgressIndicator from '../progress_indicator';

// Return a promise delayed by ms
function delay(progressIndicator, ms) {
  return new Promise(resolve => {
    progressIndicator.setTimeout(resolve, ms);
  });
}

function showProgressIndicator(
  handler,
  el = 'button[type=submit]',
  delayHandlerByMills = 0
) {
  return function(...args) {
    const target = this.$(el);
    const RADIX = 10;
    const minProgressIndicatorMs = parseInt(
      target.data('minProgressIndicatorMs') || 0,
      RADIX
    );

    const progressIndicator = getProgressIndicator(this, target);
    progressIndicator.start(target);

    const startTime = Date.now();
    return delay(progressIndicator, delayHandlerByMills)
      .then(() => this.invokeHandler(handler, args))
      .then(
        value => {
          // calculate the artificial delay time, if one is set.
          // If the handler took longer than the artificial delay,
          // or if no artificial delay is set, the extra delay is 0.
          const diff = Date.now() - startTime;
          const extraDelayTimeMS = Math.max(minProgressIndicatorMs - diff, 0);
          return delay(progressIndicator, extraDelayTimeMS).then(() => {
            // Stop the progress indicator unless the flow halts.
            if (!(value && value.halt)) {
              progressIndicator.done();
            }
            return value;
          });
        },
        err => {
          progressIndicator.done();
          throw err;
        }
      );
  };
}

function getProgressIndicator(context, target) {
  // use the progress indicator already attached
  // to the button, if one exists.
  var progressIndicator = target.data('progressIndicator');
  if (!progressIndicator) {
    progressIndicator = new ProgressIndicator();
    context.trackChildView(progressIndicator);

    // store a reference to the progress indicator on the button
    // itself. This allows a view's button to be updated and allow
    // the new button to receive a progress indicator. See #2502
    target.data('progressIndicator', progressIndicator);
  }

  return progressIndicator;
}

export default showProgressIndicator;
