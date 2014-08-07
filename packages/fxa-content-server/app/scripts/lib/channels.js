/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A module to create channels.
// The created channel depends on information tucked away in Session.

define([
  'lib/session',
  'lib/promise',
  'lib/channels/null',
  'lib/channels/fx-desktop',
  'lib/channels/redirect',
  'lib/channels/web',
  'lib/url'
], function (Session, p, NullChannel, FxDesktopChannel, RedirectChannel, WebChannel, Url) {
  'use strict';

  return {
    /**
     * Get a channel.
     *
     * get is a power operation, rarely needed. Use sendExpectResponse instead.
     * If you do get a channel, make sure to call `channel.teardown()` when
     * complete.
     */
    get: function (options) {
      options = options || {};
      var context = options.window || window;

      if (options.channel) {
        return options.channel;
      }

      var channel;
      // try to get the webChannelId from Session and URL params
      var webChannelId = this.getWebChannelId(context);

      if (Session.isDesktopContext()) {
        channel = new FxDesktopChannel();
      } else if (webChannelId) {
        // use WebChannel if "webChannelId" is set
        channel = new WebChannel(webChannelId);
      } else if (Session.isOAuth()) {
        // By default, all OAuth communication happens via redirects.
        channel = new RedirectChannel();
      } else {
        channel = new NullChannel();
      }

      channel.init({
        window: context
      });

      return channel;
    },

    /**
     * Send a message to a channel, expecting a response. Takes care of
     * channel creation and destruction automatically.
     *
     * Returns a promise. Promise will be fulfilled with the channel response
     * on success, and rejected with an error if channel responds with an
     * error.
     */
    sendExpectResponse: function(message, data, options) {
      options = options || {};

      var deferred = p.defer();

      var channel = this.get(options);
      channel.send(message, data, function (err, response) {
        channel.teardown();

        if (err) {
          return deferred.reject(err);
        }

        deferred.resolve(response);
      });

      return deferred.promise;
    },

    /**
     * Returns the WebChannel id if available
     */
    getWebChannelId: function (context) {
      var id = null;
      // check given window context
      if (context && context.location) {
        id = Url.searchParam('webChannelId', context.location.search);
      }

      // fallback to session if context cannot find the id
      if (! id && Session.oauth) {
        id = Session.oauth.webChannelId;
      }

      return id;
    }
  };
});


