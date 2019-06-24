/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The notifier triggers commands on multiple channels (tabs, browsers, etc).
 */

import _ from 'underscore';
import Backbone from 'backbone';
import Vat from 'lib/vat';
import WebChannel from 'lib/channels/web';

// Commands that have the 'internal:' namespace should only be
// handled by the content server. Other commands may be handled
// both externally and internally to the content server.
var COMMANDS = {
  CHANGE_PASSWORD: {
    name: WebChannel.CHANGE_PASSWORD,
    schema: {
      email: Vat.email().required(),
      keyFetchToken: Vat.keyFetchToken().optional(),
      sessionToken: Vat.sessionToken().required(),
      uid: Vat.uid().required(),
      unwrapBKey: Vat.unwrapBKey().optional(),
      verified: Vat.boolean().required(),
    },
  },
  COMPLETE_RESET_PASSWORD_TAB_OPEN: {
    name: 'fxaccounts:complete_reset_password_tab_open',
    schema: null,
  },
  DELETE: {
    name: WebChannel.DELETE,
    schema: {
      uid: Vat.uid().required(),
    },
  },
  PROFILE_CHANGE: {
    name: WebChannel.PROFILE_CHANGE,
    schema: {
      uid: Vat.uid().required(),
    },
  },
  SESSION_VERIFIED: {
    name: 'internal:session_verified',
  },
  SIGNED_IN: {
    name: 'internal:signed_in',
    schema: {
      // A bug in e10s causes localStorage in about:accounts and content tabs to be isolated from
      // each other. Writes to localStorage from /complete_reset_password are not able to be read
      // from within about:accounts. Because of this, all account data needed to sign in must
      // be passed between windows. See https://github.com/mozilla/fxa-content-server/issues/4763
      // and https://bugzilla.mozilla.org/show_bug.cgi?id=666724
      keyFetchToken: Vat.keyFetchToken().optional(),
      sessionToken: Vat.sessionToken().required(),
      sessionTokenContext: Vat.string().optional(),
      uid: Vat.uid().required(),
      unwrapBKey: Vat.unwrapBKey().optional(),
    },
  },
  SIGNED_OUT: {
    name: WebChannel.LOGOUT,
    schema: {
      uid: Vat.uid().optional(),
    },
  },
};

var COMMAND_NAMES = {};
var SCHEMATA = {};

Object.keys(COMMANDS).forEach(function(key) {
  var command = COMMANDS[key];
  COMMAND_NAMES[key] = command.name;
  SCHEMATA[command.name] = command.schema;
});

var Notifer = Backbone.Model.extend(
  {
    COMMANDS: COMMAND_NAMES,
    SCHEMATA: SCHEMATA,

    initialize(options) {
      options = options || {};

      // internal:* messages are never sent outside of FxA. Messages
      // with the "internal:" prefix are only sent to channels
      // in the internalChannels list.
      this._internalChannels = [];
      this._channels = [];

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
     * @param {String} command
     * @param {Object} data
     * @param {Context} context
     */
    triggerAll(command, data, context) {
      this.triggerRemote(command, data);
      this.trigger(command, data, context);
    },

    /**
     * Send a notification to all interested remote parties,
     * including other FxA tabs.
     *
     * @param {String} command
     * @param {Object} data
     */
    triggerRemote(command, data) {
      // Validation distinguishes between undefined values and values that are
      // set to undefined. And some channels don't serialise their payloads, so
      // values that are set to undefined get sent with the message. Mitigate
      // by explicitly removing those values before processing the data.
      data = eliminateUndefinedProperties(data);

      if (SCHEMATA[command]) {
        const result = Vat.validate(data, SCHEMATA[command]);
        if (result.error) {
          throw new Error(`Invalid data for command ${command}`);
        }
      } else if (!_.isNull(data) && !_.isUndefined(data)) {
        throw new Error(`Unexpected data for command ${command}`);
      }

      // internal:* messages are never sent outside of FxA. Ensure
      // only internal channels receive internal:* messages.
      if (/^internal:/.test(command)) {
        this._internalChannels.forEach(function(channel) {
          channel.send(command, data);
        });
      } else {
        this._channels.forEach(function(channel) {
          channel.send(command, data);
        });
      }
    },

    // Listen for notifications from other fxa tabs
    _listen(tabChannel) {
      _.each(COMMAND_NAMES, name => {
        tabChannel.on(name, this.trigger.bind(this, name));
      });
    },
  },
  COMMAND_NAMES
);

export default Notifer;

function eliminateUndefinedProperties(data) {
  if (!data) {
    return data;
  }

  return _.omit(data, _.isUndefined);
}
