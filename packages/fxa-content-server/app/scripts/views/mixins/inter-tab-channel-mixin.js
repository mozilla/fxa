/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view mixin to interface with the inter tab channel.
 *
 * Any inter-tab channel messages registered are automatically unregistered
 * when the view is destroyed.
 */

define([
], function () {
  'use strict';

  var InterTabChannelMixin = {
    initialize: function (options) {
      options = options || {};

      this._interTabChannel = options.interTabChannel;

      /**
       * A list of handlers registered for this view is kept
       * so all listeners can be unregistered when the view is
       * destroyed.
       */
      this._interTabMessages = [];

      this.on('destroy', this.interTabOffAll.bind(this));
    },

    /**
     * Register a listener
     *
     * @method interTabOn
     * @param {string} eventName
     * @param {function} callback
     */
    interTabOn: function (eventName, callback) {
      // The interTabChannel returns a key that can be used
      // to unregister a callback. Save a reference to this to
      // unregister. All other event emitters allow a function
      // to be used to unregister, so we allow that too by saving
      // a reference to both the key and the function.
      var key = this._interTabChannel.on(eventName, callback);

      this._interTabMessages.push({
        name: eventName,
        key: key,
        callback: callback
      });
    },


    /**
     * Unregister a listener
     *
     * @method interTabOff
     * @param {string} eventName
     * @param {function} callback
     */
    interTabOff: function (eventName, callback) {
      this._interTabMessages.forEach(function (envelope, index) {
        if (envelope.name === eventName && envelope.callback === callback) {
          this._interTabMessages.splice(index, 1);
          this._interTabChannel.off(envelope.name, envelope.key);
        }
      }, this);
    },

    /**
     * Unregister all listeners for this view
     *
     * @method interTabOffAll
     */
    interTabOffAll: function () {
      this._interTabMessages.forEach(function (envelope) {
        this._interTabChannel.off(envelope.name, envelope.key);
      }, this);
      this._interTabMessages = [];
    },

    /**
     * Send a message over the inter tab channel
     *
     * @method interTabSend
     * @param {string} eventName
     * @param {object} [data]
     */
    interTabSend: function (eventName, data) {
      this._interTabChannel.send(eventName, data);
    },

    /**
     * Clear any inter tab channel data
     *
     * @method interTabClear
     */
    interTabClear: function () {
      this._interTabChannel.clearMessages();
    }
  };

  return InterTabChannelMixin;
});
