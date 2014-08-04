/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// A channel interface.

define([
  'underscore',
  'backbone'
],
function (_, Backbone) {
  function BaseChannel() {
    // nothing to do.
  }

  _.extend(BaseChannel.prototype, Backbone.Events, {
    init: function () {
    },

    teardown: function () {
    },

    send: function (command, data, done) {
      if (done) {
        done();
      }
    }
  });

  return BaseChannel;
});
