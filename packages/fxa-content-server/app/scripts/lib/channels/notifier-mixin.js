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
 *   'notification-2': '_handlerName',
 *   'once!notification-3': '_handlerOnlyCalledOnce'
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

  const ONCE_PREFIX = /^once!/;

  function NotifierProxy({ consumer, notifier }) {
    this._consumer = consumer;
    this._notifier = notifier;

    /**
     * A list of handlers registered for this view is kept
     * so all listeners can be unregistered when the view is
     * destroyed.
     */
    this._notifierMessages = [];

    this.delegateNotifications();

    // unbind all listeners on destroy
    consumer.on('destroy', () => this.off());
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
        let attachMethod = 'on';

        if (ONCE_PREFIX.test(notificationName)) {
          attachMethod = 'once';
          notificationName = notificationName.replace(ONCE_PREFIX, '');
        }

        if (_.isString(method) && _.isFunction(consumer[method])) {
          this[attachMethod](notificationName, (...args) => {
            // The level of indirection is used to allow for
            // late-binding when using sinon spies & stubs.
            // Without indirection, the original function is
            // always called.
            consumer[method](...args);
          });
        } else if (_.isFunction(method)) {
          this[attachMethod](notificationName, method.bind(consumer));
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
      this._trackListener(eventName, callback);
    },

    /**
     * Register a listener that is called at most once
     *
     * @param {String} eventName
     * @param {Function} callback
     */
    once (eventName, callback) {
      this._notifier.once(eventName, callback);
      this._trackListener(eventName, callback);
    },

    /**
     * Track a listener.
     *
     * @param {String} eventName
     * @param {Function} callback
     * @private
     */
    _trackListener (eventName, callback) {
      this._notifierMessages.push({
        callback,
        eventName
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
        this._notifierMessages.forEach(({ callback, eventName }) => {
          this._notifier.off(eventName, callback);
        });
        this._notifierMessages = [];
        return;
      }

      // To simplify the code, the notification is not removed
      // from this._notifierMessages. _notifierMessages is cleared
      // when the object is destroyed, there is no negative
      // side effect to attempting to remove a non-existent handler
      this._notifier.off(eventName, callback);
    }
  };

  var NotifierMixin = {
    initialize (options = {}) {
      // if no notifier is passed in, don't bother setting up
      // the mixin. This avoids breaking all kinds of unit tests.
      if (options.notifier) {
        this.notifier = new NotifierProxy({
          consumer: this,
          notifier: options.notifier
        });
      }
    }
  };

  module.exports = NotifierMixin;
});
