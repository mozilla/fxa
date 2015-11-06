/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Observe the height of an element, trigger the `change` notification
 * if the element's height changes.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');

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

    start: function () {
      var self = this;

      if (self._observer) {
        throw new Error('Already started');
      }

      // For more info, see
      // https://developer.mozilla.org/docs/Web/API/MutationObserver
      var MutationObserver = self._window.MutationObserver;
      if (MutationObserver) {
        var onMutation = _.debounce(self._onMutation.bind(self), self._delayMS);
        self._observer = new MutationObserver(onMutation);

        self._observer.observe(self._targetEl, {
          attributeFilter: ['class', 'style'],
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true
        });

        // trigger the initial notification
        self._onMutation();
      }
    },

    _lastHeight: -Infinity,
    _onMutation: function () {
      var self = this;
      var currentHeight = self._targetEl.clientHeight;
      // An element's clientHeight can be misreported on some versions of
      // Fennec - see https://bugzilla.mozilla.org/show_bug.cgi?id=1071620
      // don't make any update unless the clientHeight is actually a number.
      if (typeof currentHeight === 'number' &&
          currentHeight !== self._lastHeight) {
        self.trigger('change', currentHeight);
        self._lastHeight = currentHeight;
      }
    },

    stop: function () {
      var observer = this._observer;
      if (observer) {
        observer.disconnect();
        delete this._observer;
      }
    }
  });

  module.exports = HeightObserver;
});

