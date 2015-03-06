/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The notifier broadcasts messages across multiple channels (iframe, tabs, browsers, etc).
 */

'use strict';

define([
  'backbone',
  'underscore'
], function (Backbone, _) {

  var EVENTS = {
    PROFILE_CHANGE: 'profile:change'
  };

  var Notifications = Backbone.Model.extend({
    defaults: {
    },
    initialize: function (options) {
      options = options || {};
      this._channels = [
        options.tabChannel,
        options.webChannel
      ];
      // The iframe channel only available when the content is framed, naturally.
      if (options.iframeChannel) {
        this._channels.push(options.iframeChannel);
      }

      this._listen(options.tabChannel);
    },

    broadcast: function (event, data) {
      this._channels.forEach(function (channel) {
        channel.send(event, data);
      });
    },

    profileChanged: function (data) {
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
