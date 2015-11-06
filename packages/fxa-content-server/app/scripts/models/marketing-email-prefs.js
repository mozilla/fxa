/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A user's marketing email preferences. Account preferences are stored
 * on the "Basket" server, not the auth server. Email preferences are
 * loaded on demand, independently of account information.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var p = require('lib/promise');

  var SCOPES = 'basket:write profile:email';

  var MarketingEmailPrefs = Backbone.Model.extend({
    defaults: {
      newsletters: [],
      preferencesUrl: null,
      token: null
    },

    initialize: function (options) {
      options = options || {};

      var self = this;
      self._marketingEmailClient = options.marketingEmailClient;
      self._account = options.account;
    },

    _withMarketingEmailClient: function (method) {
      var self = this;
      var client = self._marketingEmailClient;
      var args = [].slice.call(arguments, 1);
      return p()
        .then(function () {
          return self._account.createOAuthToken(SCOPES);
        })
        .then(function (accessToken) {
          self._accessToken = accessToken;
          args.unshift(accessToken.get('token'));
          return client[method].apply(client, args);
        })
        .fin(function () {
          // immediately destroy the access token when complete
          // so they are not left in the DB. If the user needs
          // to interact with the basket server again, a new
          // access token will be created.
          if (self._accessToken) {
            self._accessToken.destroy();
          }
          self._accessToken = null;
        });
    },

    /**
     * Fetch the preferences from the backend
     *
     * @method fetch
     * @returns {Promise}
     */
    fetch: function () {
      var self = this;
      return self._withMarketingEmailClient('fetch')
        .then(function (response) {
          if (response) {
            response.newsletters = response.newsletters || [];
            for (var key in response) {
              self.set(key, response[key]);
            }
          }
        });
    },

    /**
     * Opt in to a newsletter
     *
     * @method optIn
     * @param {String} newsletterId
     * @returns {Promise}
     */
    optIn: function (newsletterId) {
      var self = this;
      if (self.isOptedIn(newsletterId)) {
        return p();
      }

      return self._withMarketingEmailClient('optIn', newsletterId)
        .then(function () {
          var newsletters = self.get('newsletters');
          newsletters.push(newsletterId);
          self.set('newsletters', newsletters);
        });
    },

    /**
     * Opt out of a newsletter
     *
     * @method optOut
     * @param {String} newsletterId
     * @returns {Promise}
     */
    optOut: function (newsletterId) {
      var self = this;
      if (! self.isOptedIn(newsletterId)) {
        return p();
      }

      return self._withMarketingEmailClient('optOut', newsletterId)
        .then(function () {
          var newsletters = _.without(self.get('newsletters'), newsletterId);
          self.set('newsletters', newsletters);
        });
    },

    /**
     * Check if the user is opted in to a newsletter
     *
     * @method isOptedIn
     * @param {String} newsletterId
     * @returns {Boolean}
     */
    isOptedIn: function (newsletterId) {
      var newsletters = this.get('newsletters');
      return newsletters.indexOf(newsletterId) !== -1;
    }
  });

  module.exports = MarketingEmailPrefs;
});
