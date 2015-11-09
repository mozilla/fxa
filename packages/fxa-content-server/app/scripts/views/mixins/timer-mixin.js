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

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');

  var Mixin = {
    setTimeout: function (callback, timeoutMS) {
      if (! this._timeouts) {
        this._timeouts = [];
        // clear all timeouts when the view is destroyed.
        this.on('destroy', clearAllTimeouts.bind(this));
      }

      var win = this.window || window;
      var self = this;

      var timeout = win.setTimeout(function () {
        self.clearTimeout(timeout);
        callback.call(self);
      }, timeoutMS);

      this._timeouts.push(timeout);

      return timeout;
    },

    clearTimeout: function (timeout) {
      var win = this.window || window;
      win.clearTimeout(timeout);

      this._timeouts = _.without(this._timeouts, timeout);
    }
  };

  function clearAllTimeouts() {
    var win = this.window || window;

    _.each(this._timeouts, function (timeout) {
      win.clearTimeout(timeout);
    });

    this._timeouts = null;
  }

  module.exports = Mixin;
});

