/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The service-mixin is used in views that know about services, which is mostly
// OAuth services but also Sync.

'use strict';

define([
  'lib/promise',
  'views/base',
  'views/decorators/button_progress_indicator',
  'lib/url',
  'lib/oauth-client',
  'lib/assertion',
  'lib/oauth-errors',
  'lib/config-loader',
  'lib/session',
  'lib/service-name',
  'lib/channels'
], function (p, BaseView, buttonProgressIndicator, Url, OAuthClient, Assertion, OAuthErrors,
    ConfigLoader, Session, ServiceName, Channels) {
  /* jshint camelcase: false */

  // If the user completes an OAuth flow using a different browser than
  // they started with, we redirect them back to the RP with this code
  // in the `error_code` query param.
  var RP_DIFFERENT_BROWSER_ERROR_CODE = 3005;

  var SYNC_SERVICE = 'sync';

  var EXPECT_CHANNEL_RESPONSE_TIMEOUT = 5000;

  function shouldSetupOAuthLinksOnError () {
    /*jshint validthis: true*/
    var hasServiceView = this.className && this.className.match('oauth');
    return hasServiceView || this.isOAuthSameBrowser();
  }

  function notifyChannel(message, data) {
    /*jshint validthis: true*/
    var self = this;
    // Assume the receiver of the channel's notification will either
    // respond or shut the FxA window.
    // If it doesn't, assume there was an error and show a generic
    // error to the user
    if (data && data.timeout) {
      self._expectResponseTimeout = self.setTimeout(function () {
        self.displayError(OAuthErrors.toError('TRY_AGAIN'), OAuthErrors);
      }, EXPECT_CHANNEL_RESPONSE_TIMEOUT);
    }

    return Channels.sendExpectResponse(message, data, {
        window: self.window,
        channel: self.channel
      }).then(null, function (err) {
        self.clearTimeout(self._expectResponseTimeout);
        throw err;
      });
  }

  /**
   * Apply additional result data depending on the current channel environment
   *
   * @param {Object} result
   * @param {Object} options
   * @returns {Object}
   */
  function decorateOAuthResult(result, options) {
    options = options || {};

    // if specific to the WebChannel flow
    if (Channels.getWebChannelId(options.context)) {
      // set closeWindow
      result.closeWindow = options.viewOptions && options.viewOptions.source === 'signin';
      // if the source is "signin" then set a timeout for a successful WebChannel signin
      if (options.viewOptions.source === 'signin') {
        result.timeout = 3000;
      }
    }

    return p(result);
  }

  /**
   * Formats the OAuth "result.redirect" url into a {code, state} object
   *
   * @param {Object} result
   * @returns {Object}
   */
  function formatOAuthResult(result) {
    // get code and state from redirect params
    var redirectParams = result.redirect.split('?')[1];
    result.state = Url.searchParam('state', redirectParams);
    result.code = Url.searchParam('code', redirectParams);
    return p(result);
  }

  return {
    setupOAuth: function (params) {
      if (! this._configLoader) {
        this._configLoader = new ConfigLoader();
      }

      this._oAuthClient = new OAuthClient();

      if (! params) {
        // params listed in:
        // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
        params = Url.searchParams(this.window.location.search,
                  ['client_id', 'redirect_uri', 'state', 'scope', 'action', 'webChannelId']);
      }
      this._oAuthParams = params;

      // FxA auth server API expects a 'service' parameter to include in
      // verification emails. Oauth uses 'client_id', so we set 'service'
      // to the 'client_id'.
      this.service = params.client_id || Session.service;

      Session.set('service', this.service);
      // A hint that allows Session to determine whether the user
      // is in the OAuth flow.
      Session.set('client_id', params.client_id);
    },

    persistOAuthParams: function () {
      Session.set('oauth', this._oAuthParams);
    },

    setServiceInfo: function () {
      var self = this;

      if (this.isSync()) {
        self.serviceName = new ServiceName(this.translator).get(this.service);
        return p();
      }

      return this._oAuthClient.getClientInfo(this.service)
        .then(function(clientInfo) {
          self.serviceName = clientInfo.name;
          self.serviceRedirectURI = clientInfo.redirect_uri;
        });
    },

    finishOAuthFlowDifferentBrowser: function () {
      return notifyChannel.call(this, 'oauth_complete', {
            redirect: this.serviceRedirectURI,
            error: RP_DIFFERENT_BROWSER_ERROR_CODE
          });
    },

    finishOAuthFlow: buttonProgressIndicator(function (viewOptions) {
      var self = this;

      return this._configLoader.fetch().then(function(config) {
        return Assertion.generate(config.oauthUrl);
      })
      .then(function(assertion) {
        self._oAuthParams.assertion = assertion;
        return self._oAuthClient.getCode(self._oAuthParams);
      })
      .then(function(result) {

        return formatOAuthResult(result);
      })
      .then(function(result) {

        return decorateOAuthResult(result, {
          context: self.window,
          viewOptions: viewOptions
        });
      })
      .then(function(result) {

        return notifyChannel.call(self, 'oauth_complete', result);
      })
      .then(function() {
        Session.clear('oauth');
        // on success, keep the button progress indicator going until the
        // window closes.
        return { pageNavigation: true };
      })
      .fail(function(err) {
        Session.clear('oauth');
        self.displayError(err, OAuthErrors);
      });
    }),

    hasService: function () {
      return !!Session.service;
    },

    /**
     * Check whether the user is in the OAuth flow.
     */
    isOAuth: function () {
      return Session.isOAuth();
    },

    isOAuthSameBrowser: function () {
      // The signup/signin flow sets Session.oauth with the
      // Oauth parameters. If the user opens the verification
      // link in the same browser, then we check to make sure
      // the service listed in the link is the same as the client_id
      // in the previously saved Oauth params.
      /* jshint camelcase: false */
      return !!Session.oauth && Session.oauth.client_id === Session.service;
    },

    isOAuthDifferentBrowser: function () {
      return this.isOAuth() && ! this.isOAuthSameBrowser();
    },

    setupOAuthLinks: function () {
      this.$('a[href~="/signin"]').attr('href', '/oauth/signin');
      this.$('a[href~="/signup"]').attr('href', '/oauth/signup');
    },

    // override this method so we can fix signup/signin links in errors
    displayErrorUnsafe: function (err, errors) {
      var result = BaseView.prototype.displayErrorUnsafe.call(this, err, errors);

      if (shouldSetupOAuthLinksOnError.call(this)) {
        this.setupOAuthLinks();
      }

      return result;
    },

    isSync: function () {
      return Session.service === SYNC_SERVICE;
    }
  };
});
