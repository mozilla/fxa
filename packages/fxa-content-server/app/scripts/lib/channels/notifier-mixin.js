/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin to provide access to the system notifier through
 * `this.notifier`.
 *
 * ```js
 * this.notifier.triggerRemote('message-name', data);
 * ```
 *
 *
 * A module can declaratively register notification handlers
 * by defining a `notifications` hash:
 *
 * ```js
 * ...
 * notifications: {
 *   'notification-1' () {
 *      // handle notification
 *   },
 *   'notification-2': '_handlerName'
 * },
 * ...
 * ```
 *
 * Any registered handlers are automatically unregistered
 * when the module is destroyed.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');

  function NotifierProxy(options) {
    options = options || {};

    var consumer = this._consumer = options.consumer;

    this._notifier = options.notifier;

    /**
     * A list of handlers registered for this view is kept
     * so all listeners can be unregistered when the view is
     * destroyed.
     */
    this._notifierMessages = [];

    this.delegateNotifications();

    // unbind all listeners on destroy
    consumer.on('destroy', this.off.bind(this, null));
  }

  NotifierProxy.prototype = {
    delegateNotifications (notifications) {
      var consumer = this._consumer;
      // based on delegateEvents from Backbone.View
      if (! (notifications || (notifications = _.result(consumer, 'notifications')))) {
        return false;
      }

      for (let notificationName in notifications) {
        let method = notifications[notificationName];
        if (_.isString(method) && _.isFunction(consumer[method])) {
          this.on(notificationName, (...args) => {
            // The level of indirection is used to allow for
            // late-binding when using sinon spies & stubs.
            // Without indirection, the original function is
            // always called.
            consumer[method](...args);
          });
        } else if (_.isFunction(method)) {
          this.on(notificationName, method.bind(consumer));
        }
      }
    },

    /**
     * Send a local message over the notifications channel. Message
     * is only sent to consumers of this tab.
     *
     * @param {String} eventName
     * @param {Object} [data]
     */
    trigger (eventName, data) {
      this._notifier.trigger(eventName, data, this._consumer);
    },

    /**
     * Send a message to all tabs & webChannels over the
     * notifications channel.
     *
     * @param {String} eventName
     * @param {Object} [data]
     */
    triggerAll (eventName, data) {
      this._notifier.triggerAll(eventName, data, this._consumer);
    },

    /**
     * Send a message to all remote tabs & webChannels.
     *
     * @param {String} eventName
     * @param {Object} [data]
     */
    triggerRemote (eventName, data) {
      this._notifier.triggerRemote(eventName, data);
    },

    /**
     * Register a listener
     *
     * @param {String} eventName
     * @param {Function} callback
     */
    on (eventName, callback) {
      this._notifier.on(eventName, callback);

      this._notifierMessages.push({
        callback: callback,
        name: eventName
      });
    },

    /**
     * Unregister a listener. If `eventName` and `callback` are not given,
     * unregister all callbacks for the consumer.
     *
     * @param {String} [eventName]
     * @param {Function} [callback]
     */
    off (eventName, callback) {
      if (! eventName) {
        // unregister all callbacks for consumer.
        this._notifierMessages.forEach(function (envelope) {
          this._notifier.off(envelope.name, envelope.callback);
        }, this);
        this._notifierMessages = [];
        return;
      }

      this._notifierMessages.forEach(function (envelope, index) {
        if (envelope.name === eventName && envelope.callback === callback) {
          this._notifierMessages.splice(index, 1);
          this._notifier.off(envelope.name, envelope.callback);
        }
      }, this);
    }
  };

  var NotifierMixin = {
    initialize (options) {
      this.notifier = new NotifierProxy({
        consumer: this,
        notifier: options.notifier
      });
    }
  };

  module.exports = NotifierMixin;
});
