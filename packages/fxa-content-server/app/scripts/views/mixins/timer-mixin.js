/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A View Mixin to handle setTimeouts. When the view is destroyed,
 * any outstanding timers associated with the view will be cleared.
 *
 * callbacks passed to setTimeout will be called in the context of
 * the view.
 */

import { each, without } from 'underscore';

const Mixin = {
  setTimeout(callback, timeoutMS) {
    if (!this._timeouts) {
      this._timeouts = [];
    }

    if (!this._isListeningForDestroy) {
      this._isListeningForDestroy = true;
      this.on('destroy', clearAllTimeouts.bind(this));
    }

    const win = this.window || window;
    const timeout = win.setTimeout(() => {
      this.clearTimeout(timeout);
      callback.call(this);
    }, timeoutMS);

    this._timeouts.push(timeout);

    return timeout;
  },

  clearTimeout(timeout) {
    if (!timeout) {
      return;
    }
    const win = this.window || window;
    win.clearTimeout(timeout);
    this._timeouts = without(this._timeouts, timeout);
  },
};

function clearAllTimeouts() {
  const win = this.window || window;

  each(this._timeouts, function(timeout) {
    win.clearTimeout(timeout);
  });

  this._timeouts = null;
}

export default Mixin;
