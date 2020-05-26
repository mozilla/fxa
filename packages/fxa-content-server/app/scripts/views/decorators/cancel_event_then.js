/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Function decorator to cancel events
 *
 * Requires the invokeHandler function.
 */

function cancelEventThen(handler) {
  return function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var args = [].slice.call(arguments, 0);
    args.unshift(handler);
    return this.invokeHandler.apply(this, args);
  };
}

export default cancelEventThen;
