/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a special channel that communicates between two
 * tabs of the same browser. It uses localStorage to communicate.
 */

'use strict';

define([
  'crosstab'
], function (crosstab) {

  function InterTabChannel(options) {
    options = options || {};
    this._crosstab = options.crosstab || crosstab;
  }

  InterTabChannel.prototype = {
    send: function (name, data) {
      // Sensitive data is sent across the channel and should only
      // be in localStorage if absolutely necessary. Only send
      // data if another tab is listening.
      try {
        if (this._crosstab.util.tabCount() > 1) {
          this._crosstab.broadcast(name, data, null);
        }
      } catch (e) {
        // this can blow up if the browser does not support localStorage
        // or if on a mobile device. Ignore the error.
      }
    },

    on: function (name, callback) {
      this._crosstab.util.events.on(name, callback);
    },

    off: function (name, callback) {
      this._crosstab.util.events.off(name, callback);
    },

    clearMessages: function () {
      this._crosstab.util.clearMessages();
    }
  };

  return InterTabChannel;
});
