/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The notifier broadcasts messages across multiple channels (iframe, tabs, browsers, etc).
 */

define([
  'backbone',
  'underscore'
], function (Backbone, _) {
  'use strict';

  var EVENTS = {
    PROFILE_CHANGE: 'profile:change'
  };

  var Notifications = Backbone.Model.extend({
    EVENTS: EVENTS,

    defaults: {
    },

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
        this._channels.push(options.tabChannel);
        this._listen(options.tabChannel);
      }
    },

    broadcast: function (event, data) {
      this._channels.forEach(function (channel) {
        channel.send(event, data);
      });
      this.trigger(event, data);
    },

    profileUpdated: function (data) {
      this.broadcast(EVENTS.PROFILE_CHANGE, data);
    },

    // Listen for notifications from other fxa tabs or frames
    _listen: function (tabChannel) {
      var self = this;
      _.each(EVENTS, function (name) {
        tabChannel.on(name, self._handleNotification.bind(self));
      });
    },

    _handleNotification: function (message) {
      this.trigger(message.event, message.data);
    }
  }, Backbone.Events);

  return Notifications;
});
