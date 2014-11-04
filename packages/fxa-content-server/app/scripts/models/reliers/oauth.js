/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

'use strict';

define([
  'underscore',
  'models/reliers/relier',
  'lib/resume-token'
], function (_, Relier, ResumeToken) {
  var RELIER_FIELDS_IN_RESUME_TOKEN = ['state'];

  var OAuthRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      // standard oauth parameters.
      state: null,
      clientId: null,
      // redirectUri is used by the oauth flow
      redirectUri: null,
      scope: null,
      // redirectTo is for future use by the oauth flow. redirectTo
      // would have redirectUri as its base.
      redirectTo: null
    }),

    initialize: function (options) {
      options = options || {};

      Relier.prototype.initialize.call(this, options);

      this._session = options.session;
      this._oAuthClient = options.oAuthClient;
    },

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(this)
          .then(function () {
            if (self._isVerificationFlow()) {
              self._setupVerificationFlow();
            } else {
              self._setupSigninSignupFlow();
            }

            if (! self.has('service')) {
              self.set('service', self.get('clientId'));
            }

            return self._setupOAuthRPInfo();
          });
    },

    isOAuth: function () {
      return true;
    },

    getResumeToken: function () {
      var resumeObj = {};

      _.each(RELIER_FIELDS_IN_RESUME_TOKEN, function (itemName) {
        if (this.has(itemName)) {
          resumeObj[itemName] = this.get(itemName);
        }
      }, this);

      return ResumeToken.stringify(resumeObj);
    },

    _isVerificationFlow: function () {
      return !! this.getSearchParam('code');
    },

    _setupVerificationFlow: function () {
      var self = this;

      var resumeObj = self._session.oauth;
      if (! resumeObj) {
        // The user is verifying in a second browser. `service` is
        // available in the link. Use it to populate the `service`
        // and `clientId` fields which will allow the user to
        // redirect back to the RP but not sign in.
        resumeObj = {
          service: self.getSearchParam('service'),
          //jshint camelcase: false
          client_id: self.getSearchParam('service')
        };
      }

      self.set({
        state: resumeObj.state,
        //jshint camelcase: false
        clientId: resumeObj.client_id,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope
      });
    },

    _setupSigninSignupFlow: function () {
      var self = this;

      // params listed in:
      // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      self.importSearchParam('state');
      self.importSearchParam('client_id', 'clientId');
      self.importSearchParam('redirect_uri', 'redirectUri');
      self.importSearchParam('scope');

      self.importSearchParam('redirectTo');
    },

    _setupOAuthRPInfo: function () {
      var self = this;
      var clientId = self.get('clientId');

      if (clientId) {
        return this._oAuthClient.getClientInfo(clientId)
          .then(function (serviceInfo) {
            self.set('serviceName', serviceInfo.name);
            //jshint camelcase: false
            // server version always takes precedent over the search parameter
            self.set('redirectUri', serviceInfo.redirect_uri);
          });
      }
    }
  });

  return OAuthRelier;
});


