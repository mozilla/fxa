/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An AuthenticationBroker mixin that allows
 * the mixin to send messages to a channel.
 *
 * A default channel can be used (useful for testing), if
 * the broker contains this._channel, that will be used, otherwise
 * the this.ChannelConstructor will be used to create a new
 * instance
 */
'use strict';

define([
  'underscore',
  'lib/promise'
], function (_, p) {
  var ChannelMixin = {
    send: function (message, data) {
      var channel = this.getChannel();
      var send = p.denodeify(_.bind(channel.send, channel));
      return send(message, data);
    }
  };

  return ChannelMixin;
});

