/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Observe the height of an element, trigger the `change` notification
 * if the element's height changes.
 */

'use strict';

import _ from 'underscore';
import Backbone from 'backbone';

function HeightObserver (options) {
  options = options || {};

  this._targetEl = options.target;
  this._window = options.window;

  if ('delayMS' in options) {
    this._delayMS = options.delayMS;
  }
}

_.extend(HeightObserver.prototype, Backbone.Events, {
  _delayMS: 50,

  start () {
    if (this._observer) {
      throw new Error('Already started');
    }

    // For more info, see
    // https://developer.mozilla.org/docs/Web/API/MutationObserver
    var MutationObserver = this._window.MutationObserver;
    if (MutationObserver) {
      var onMutation = _.debounce(this._onMutation.bind(this), this._delayMS);
      this._observer = new MutationObserver(onMutation);

      this._observer.observe(this._targetEl, {
        attributeFilter: ['class', 'style'],
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
      });

      // trigger the initial notification
      this._onMutation();
    }
  },

  _lastHeight: -Infinity,
  _onMutation () {
    var currentHeight = this._targetEl.clientHeight;
    // An element's clientHeight can be misreported on some versions of
    // Fennec - see https://bugzilla.mozilla.org/show_bug.cgi?id=1071620
    // don't make any update unless the clientHeight is actually a number.
    if (typeof currentHeight === 'number' &&
        currentHeight !== this._lastHeight) {
      this.trigger('change', currentHeight);
      this._lastHeight = currentHeight;
    }
  },

  stop () {
    var observer = this._observer;
    if (observer) {
      observer.disconnect();
      delete this._observer;
    }
  }
});

module.exports = HeightObserver;
