/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The notifier triggers commands on multiple channels (iframe, tabs, browsers, etc).
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var Validate = require('lib/validate');

  // Commands that have the 'internal:' namespace should only be
  // handled by the content server. Other commands may be handled
  // both externally and internally to the content server.
  var COMMANDS = {
    CHANGE_PASSWORD: {
      name: 'fxaccounts:change_password',
      schema: {
        email: 'String',
        keyFetchToken: 'String',
        sessionToken: 'String',
        uid: 'String',
        unwrapBKey: 'String',
        verified: 'Boolean'
      }
    },
    COMPLETE_RESET_PASSWORD_TAB_OPEN: {
      name: 'fxaccounts:complete_reset_password_tab_open',
      schema: null
    },
    DELETE: {
      name: 'fxaccounts:delete',
      schema: { uid: 'String' }
    },
    PROFILE_CHANGE: {
      name: 'profile:change',
      schema: { uid: 'String' }
    },
    SIGNED_IN: {
      name: 'internal:signed_in',
      schema: {
        keyFetchToken: '?String',
        uid: 'String',
        unwrapBKey: '?String'
      }
    },
    SIGNED_OUT: {
      name: 'fxaccounts:logout',
      schema: { uid: '?String' }
    }
  };

  var COMMAND_NAMES = {};
  var SCHEMATA = {};

  Object.keys(COMMANDS).forEach(function (key) {
    var command = COMMANDS[key];
    COMMAND_NAMES[key] = command.name;
    SCHEMATA[command.name] = command.schema;
  });

  var Notifer = Backbone.Model.extend({
    COMMANDS: COMMAND_NAMES,
    SCHEMATA: SCHEMATA,

    initialize: function (options) {
      options = options || {};

      // internal:* messages are never sent outside of FxA. Messages
      // with the "internal:" prefix are only sent to channels
      // in the internalChannels list.
      this._internalChannels = [];
      this._channels = [];

      if (options.iframeChannel) {
        this._channels.push(options.iframeChannel);
      }

      if (options.webChannel) {
        this._channels.push(options.webChannel);
      }

      if (options.tabChannel) {
        this._tabChannel = options.tabChannel;
        this._internalChannels.push(options.tabChannel);
        this._channels.push(options.tabChannel);
        this._listen(options.tabChannel);
      }
    },

    /**
     * Send a notification to all interested parties, local and remote.
     * This includes listeners internal to the app, other FxA tabs, as
     * well as the browser.
     *
     * @param {string} command
     * @param {object} data
     * @param {context} context
     */
    triggerAll: function (command, data, context) {
      this.triggerRemote(command, data);
      this.trigger(command, data, context);
    },

    /**
     * Send a notification to all interested remote parties,
     * including other FxA tabs.
     *
     * @param {string} command
     * @param {object} data
     */
    triggerRemote: function (command, data) {
      // Validation distinguishes between undefined values and values that are
      // set to undefined. And some channels don't serialise their payloads, so
      // values that are set to undefined get sent with the message. Mitigate
      // by explicitly removing those values before processing the data.
      data = eliminateUndefinedProperties(data);

      if (SCHEMATA[command]) {
        if (! Validate.isDataValid(data, SCHEMATA[command])) {
          throw new Error('Invalid data for command ' + command);
        }
      } else if (! _.isNull(data) && ! _.isUndefined(data)) {
        throw new Error('Unexpected data for command ' + command);
      }

      // internal:* messages are never sent outside of FxA. Ensure
      // only internal channels receive internal:* messages.
      if (/^internal:/.test(command)) {
        this._internalChannels.forEach(function (channel) {
          channel.send(command, data);
        });
      } else {
        this._channels.forEach(function (channel) {
          channel.send(command, data);
        });
      }
    },

    // Listen for notifications from other fxa tabs or frames
    _listen: function (tabChannel) {
      var self = this;
      _.each(COMMAND_NAMES, function (name) {
        tabChannel.on(name, self.trigger.bind(self, name));
      });
    },

    clear: function () {
      if (this._tabChannel) {
        this._tabChannel.clear();
      }
    }
  }, COMMAND_NAMES);

  module.exports = Notifer;

  function eliminateUndefinedProperties (data) {
    if (! data) {
      return data;
    }

    return _.omit(data, _.isUndefined);
  }
});
