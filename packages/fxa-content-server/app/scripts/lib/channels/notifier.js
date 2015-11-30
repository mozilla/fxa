/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The notifier triggers events on multiple channels (iframe, tabs, browsers, etc).
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');

  // Events that have the 'internal:' namespace should only be
  // handled by the content server. Other events may be handled
  // both externally and internally to the content server.
  var EVENTS = {
    COMPLETE_RESET_PASSWORD_TAB_OPEN: 'fxaccounts:complete_reset_password_tab_open',
    DELETE: 'fxaccounts:delete',
    PROFILE_CHANGE: 'profile:change',
    SIGNED_IN: 'internal:signed_in',
    SIGNED_OUT: 'fxaccounts:logout'
  };

  var Notifer = Backbone.Model.extend({
    EVENTS: EVENTS,

    initialize: function (options) {
      options = options || {};
      this._channels = [];

      if (options.iframeChannel) {
        this._channels.push(options.iframeChannel);
      }

      if (options.webChannel) {
        this._channels.push(options.webChannel);
      }

      if (options.tabChannel) {
        this._tabChannel = options.tabChannel;
        this._channels.push(options.tabChannel);
        this._listen(options.tabChannel);
      }
    },

    triggerAll: function (event, data, context) {
      this.triggerRemote(event, data);
      this.trigger(event, data, context);
    },

    triggerRemote: function (event, data) {
      this._channels.forEach(function (channel) {
        channel.send(event, data);
      });
    },

    // Listen for notifications from other fxa tabs or frames
    _listen: function (tabChannel) {
      var self = this;
      _.each(EVENTS, function (name) {
        tabChannel.on(name, self.trigger.bind(self, name));
      });
    },

    clear: function () {
      if (this._tabChannel) {
        this._tabChannel.clear();
      }
    }
  }, EVENTS);

  module.exports = Notifer;
});
