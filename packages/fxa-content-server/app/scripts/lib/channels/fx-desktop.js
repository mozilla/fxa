/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Firefox for desktop native=>FxA glue code.

define([
  'underscore',
  'lib/channels/base',
  'lib/auth-errors',
  'lib/channels/mixins/postmessage_receiver'
], function (_, BaseChannel, AuthErrors, PostMessageReceiverMixin) {
  function createEvent(command, data) {
    /*jshint validthis: true*/
    return new this.window.CustomEvent('FirefoxAccountsCommand', {
      detail: {
        command: command,
        data: data,
        bubbles: true
      }
    });
  }

  function Channel() {
    // nothing to do here.
  }

  _.extend(Channel.prototype, new BaseChannel(), {
    parseMessage: function (message) {
      var type = message.type;

      if (type !== 'message') {
        return; // not an expected type of message
      }

      var result = message.content;
      if (! result) {
        throw new Error('malformed message');
      }

      return {
        command: result.status,
        data: result
      };
    },

    dispatchCommand: function (command, data) {
      var event = createEvent.call(this, command, data);
      this.window.dispatchEvent(event);
    }
  }, PostMessageReceiverMixin);

  return Channel;

});

