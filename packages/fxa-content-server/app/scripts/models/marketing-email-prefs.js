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

  const _ = require('underscore');
  const Backbone = require('backbone');
  const p = require('../lib/promise');

  var SCOPES = 'basket:write profile:email';

  var MarketingEmailPrefs = Backbone.Model.extend({
    defaults: {
      newsletters: [],
      preferencesUrl: null,
      token: null
    },

    initialize (options) {
      options = options || {};

      this._marketingEmailClient = options.marketingEmailClient;
      this._account = options.account;
    },

    _withMarketingEmailClient (method) {
      var client = this._marketingEmailClient;
      var args = [].slice.call(arguments, 1);
      return p().then(() => this._account.createOAuthToken(SCOPES))
        .then((accessToken) => {
          this._accessToken = accessToken;
          args.unshift(accessToken.get('token'));
          return client[method].apply(client, args);
        })
        .fin(() => {
          // immediately destroy the access token when complete
          // so they are not left in the DB. If the user needs
          // to interact with the basket server again, a new
          // access token will be created.
          if (this._accessToken) {
            this._accessToken.destroy();
          }
          this._accessToken = null;
        });
    },

    /**
     * Fetch the preferences from the backend
     *
     * @method fetch
     * @returns {Promise}
     */
    fetch () {
      return this._withMarketingEmailClient('fetch')
        .then((response) => {
          if (response) {
            response.newsletters = response.newsletters || [];
            for (var key in response) {
              this.set(key, response[key]);
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
    optIn (newsletterId) {
      if (this.isOptedIn(newsletterId)) {
        return p();
      }

      return this._withMarketingEmailClient('optIn', newsletterId)
        .then(() => {
          var newsletters = this.get('newsletters');
          newsletters.push(newsletterId);
          this.set('newsletters', newsletters);
        });
    },

    /**
     * Opt out of a newsletter
     *
     * @method optOut
     * @param {String} newsletterId
     * @returns {Promise}
     */
    optOut (newsletterId) {
      if (! this.isOptedIn(newsletterId)) {
        return p();
      }

      return this._withMarketingEmailClient('optOut', newsletterId)
        .then(() => {
          var newsletters = _.without(this.get('newsletters'), newsletterId);
          this.set('newsletters', newsletters);
        });
    },

    /**
     * Check if the user is opted in to a newsletter
     *
     * @method isOptedIn
     * @param {String} newsletterId
     * @returns {Boolean}
     */
    isOptedIn (newsletterId) {
      var newsletters = this.get('newsletters');
      return newsletters.indexOf(newsletterId) !== -1;
    }
  });

  module.exports = MarketingEmailPrefs;
});
