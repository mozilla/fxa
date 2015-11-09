/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a special channel that communicates between two
 * tabs of the same browser. It uses one of two adapaters to
 * communicate: BroadcastChannelAdapter or LocalStorageAdapter.
 *
 * The preferred adapter is the BroadcastChannelAdapter. It uses
 * the BroadcastChannel API to communicate between browser tabs. See
 * https://developer.mozilla.org/docs/Web/API/Broadcast_Channel_API.
 * The BroadcastChannelAdapter is the prefered way to communicate
 * because it does not write any sensitive data to disk.
 *
 * LocalStorageAdapter uses localStorage and storage events to communicate
 * between tabs. LocalStorageAdapter is used for legacy browsers without
 * BroadcastChannel API support. Any data sent over this channel
 * can be written to disk, so care must be taken to ensure all
 * sensitive data is erased as soon as it is consumed by the receiving tab.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var crosstab = require('crosstab');

  var BROADCAST_CHANNEL_ID = 'firefox_accounts';

  function BroadcastChannelAdapter(options) {
    options = options || {};
    var win = options.window || window;

    this._broadcastChannel = new win.BroadcastChannel(BROADCAST_CHANNEL_ID);
    this._broadcastChannel.onmessage = this.onMessage.bind(this);
  }

  BroadcastChannelAdapter.prototype = {
    onMessage: function (event) {
      var envelope = JSON.parse(event.data);
      this.trigger(envelope.name, envelope.data);
    },

    send: function (name, data) {
      this._broadcastChannel.postMessage(this.stringify(name, data));
    },

    clear: function () {
      // do nothing
    },

    /**
     * stringify a message, exposed for testing
     *
     * @param {string} name
     * @param {object} [data]
     * @returns {string}
     */
    stringify: function (name, data) {
      return JSON.stringify({
        data: data || {},
        name: name
      });
    }
  };

  _.extend(BroadcastChannelAdapter.prototype, Backbone.Events);


  function LocalStorageAdapter(options) {
    this._crosstab = options.crosstab || crosstab;
    this._handlers = {};
    this._sentMessageIds = {};
  }

  LocalStorageAdapter.prototype = {
    send: function (name, data) {
      // Sensitive data is sent across the channel and should only
      // be in localStorage if absolutely necessary. Only send
      // data if another tab is listening.
      try {
        if (this._crosstab.util.tabCount() > 1) {
          // crosstab sends notifications to the the current tab as well
          // as any remote tabs. This behavior is not what we want. Give
          // each message an id, if a message is received in this tab
          // with the same id, ignore it.
          var id = this._crosstab.util.generateId();
          var envelope = {
            data: data,
            id: id
          };
          this._sentMessageIds[id] = true;
          this._crosstab.broadcast(name, envelope, null);
        }
      } catch (e) {
        // this can blow up if the browser does not support localStorage
        // or if on a mobile device. Ignore the error.
      }
    },

    on: function (name, callback) {
      this._handlers[name] = this._handlers[name] || [];
      var sentMessageIds = this._sentMessageIds;

      var callbackWrapper =
        createIgnoreMessagesFromThisTabWrapper(callback, sentMessageIds);

      this._handlers[name].push({
        callback: callback,
        callbackWrapper: callbackWrapper
      });

      this._crosstab.util.events.on(name, callbackWrapper);
    },

    off: function (name, callback) {
      var handlersForName = this._handlers[name] || [];
      handlersForName.forEach(function (handler) {
        if (handler.callback === callback) {
          this._crosstab.util.events.off(name, handler.callbackWrapper);
        }
      }, this);
    },

    clear: function () {
      this._crosstab.util.clearMessages();
    }
  };

  function createIgnoreMessagesFromThisTabWrapper(callback, sentMessageIds) {
    // crosstab sends notifications to the the current tab as well
    // as any remote tabs. This behavior is not what we want. Wrap
    // the supplied callback that checks whether the current tab sent
    // the event, if so, do not call the callback.
    return function (event) {
      var envelope = event.data;
      var id = envelope.id;

      if (! sentMessageIds[id]) {
        callback(envelope.data);
      } else {
        // The event is only triggered once, no need to continue to keep
        // track of the sent message ids.
        delete sentMessageIds[id];
      }
    };
  }

  function InterTabChannel(options) {
    options = options || {};
    var win = options.window || window;

    if (options.adapter) {
      this._adapter = options.adapter;
    } else if (_.isFunction(win.BroadcastChannel)) {
      this._adapter = new BroadcastChannelAdapter(options);
    } else {
      this._adapter = new LocalStorageAdapter(options);
    }
  }

  InterTabChannel.prototype = {
    /**
     * Send a message
     *
     * @method send
     * @param {string} name
     * @param {object} [data]
     */
    send: function (name, data) {
      return this._adapter.send(name, data);
    },

    /**
     * Register a listener
     *
     * @method on
     * @param {string} name
     * @param {function} callback
     *
     * @return {string} key - key used to unregister a listener
     */
    on: function (name, callback) {
      return this._adapter.on(name, callback);
    },

    /**
     * Unregister a listener
     *
     * @method off
     * @param {string} name
     * @param {string} key
     */
    off: function (name, callback) {
      return this._adapter.off(name, callback);
    },

    /**
     * Clear all data.
     *
     * @method clear
     */
    clear: function () {
      return this._adapter.clear();
    }
  };

  InterTabChannel.BroadcastChannelAdapter = BroadcastChannelAdapter;
  InterTabChannel.LocalStorageAdapter = LocalStorageAdapter;


  module.exports = InterTabChannel;
});
