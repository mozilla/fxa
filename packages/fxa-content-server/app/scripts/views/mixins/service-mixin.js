/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The service-mixin is used in views that know about services, which is mostly
// OAuth services but also Sync.

'use strict';

define([
  'lib/promise',
  'views/base',
  'views/decorators/progress_indicator',
  'lib/url',
  'lib/oauth-client',
  'lib/assertion',
  'lib/oauth-errors',
  'lib/config-loader',
  'lib/session',
  'lib/service-name',
  'lib/channels'
], function (p, BaseView, progressIndicator, Url, OAuthClient, Assertion,
    OAuthErrors, ConfigLoader, Session, ServiceName, Channels) {
  /* jshint camelcase: false */

  // If the user completes an OAuth flow using a different browser than
  // they started with, we redirect them back to the RP with this code
  // in the `error_code` query param.
  var RP_DIFFERENT_BROWSER_ERROR_CODE = 3005;

  var EXPECT_CHANNEL_RESPONSE_TIMEOUT = 5000;

  function shouldSetupOAuthLinksOnError () {
    /*jshint validthis: true*/
    var hasServiceView = this.className && this.className.match('oauth');
    return hasServiceView || this.isOAuthSameBrowser();
  }

  function _notifyChannel(message, data) {
    /*jshint validthis: true*/
    var self = this;
    // Assume the receiver of the channel's notification will either
    // respond or shut the FxA window.
    // If it doesn't, assume there was an error and show a generic
    // error to the user
    if (data && data.timeout) {
      self._expectResponseTimeout = self.setTimeout(function () {
        self.displayError(OAuthErrors.toError('TRY_AGAIN'));
      }, data.timeout);
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
  function _decorateOAuthResult(result, options) {
    options = options || {};
    // jshint validthis: true

    // if specific to the WebChannel flow
    if (this.relier.has('webChannelId')) {
      // set closeWindow
      result.closeWindow = options.viewOptions && options.viewOptions.source === 'signin';
      // if the source is "signin" then set a timeout for a successful WebChannel signin
      if (options.viewOptions && options.viewOptions.source === 'signin') {
        result.timeout = EXPECT_CHANNEL_RESPONSE_TIMEOUT;
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
  function _formatOAuthResult(result) {
    // get code and state from redirect params
    var redirectParams = result.redirect.split('?')[1];
    result.state = Url.searchParam('state', redirectParams);
    result.code = Url.searchParam('code', redirectParams);
    return p(result);
  }

  return {
    setupOAuth: function (deps) {
      deps = deps || {};

      if (! this._configLoader) {
        this._configLoader = new ConfigLoader();
      }

      this._oAuthClient = deps.oAuthClient || new OAuthClient();

      // assertion library to use to generate assertions
      // can be substituted for testing
      this.assertionLibrary = deps.assertionLibrary || new Assertion({ fxaClient: this.fxaClient });
    },

    persistOAuthParams: function () {
      // The OAuth relier reads these out of Session when it starts up.
      Session.set('oauth', {
        webChannelId: this.relier.get('webChannelId'),
        client_id: this.relier.get('clientId'),
        state: this.relier.get('state'),
        scope: this.relier.get('scope'),
        action: this.relier.get('action')
      });
    },

    finishOAuthFlowDifferentBrowser: function () {
      return _notifyChannel.call(this, 'oauth_complete', {
        redirect: this.relier.get('redirectUri'),
        error: RP_DIFFERENT_BROWSER_ERROR_CODE
      });
    },

    finishOAuthFlow: progressIndicator(function (viewOptions) {
      var self = this;
      return this._configLoader.fetch().then(function (config) {
        return self.assertionLibrary.generate(config.oauthUrl);
      })
      .then(function (assertion) {
        var relier = self.relier;
        var oauthParams = {
          assertion: assertion,
          client_id: relier.get('clientId'),
          scope: relier.get('scope'),
          state: relier.get('state')
        };
        return self._oAuthClient.getCode(oauthParams);
      })
      .then(_formatOAuthResult)
      .then(function (result) {
        return _decorateOAuthResult.call(self, result, {
          viewOptions: viewOptions
        });
      })
      .then(function (result) {
        return _notifyChannel.call(self, 'oauth_complete', result);
      })
      .then(function () {
        Session.clear('oauth');
        // on success, keep the button progress indicator going until the
        // window closes.
        return { pageNavigation: true };
      })
      .fail(function (err) {
        Session.clear('oauth');
        self.displayError(err);
      });
    }),

    isOAuthSameBrowser: function () {
      // The signup/signin flow sets Session.oauth with the
      // Oauth parameters. If the user opens the verification
      // link in the same browser, then we check to make sure
      // the service listed in the link is the same as the client_id
      // in the previously saved Oauth params.
      /* jshint camelcase: false */
      return !!(Session.oauth &&
                Session.oauth.client_id === this.relier.get('clientId'));
    },

    isOAuthDifferentBrowser: function () {
      return this.relier.isOAuth() && ! this.isOAuthSameBrowser();
    },

    setupOAuthLinks: function () {
      this.$('a[href~="/signin"]').attr('href', '/oauth/signin');
      this.$('a[href~="/signup"]').attr('href', '/oauth/signup');
    },

    // override this method so we can fix signup/signin links in errors
    displayErrorUnsafe: function (err) {
      var result = BaseView.prototype.displayErrorUnsafe.call(this, err);

      if (shouldSetupOAuthLinksOnError.call(this)) {
        this.setupOAuthLinks();
      }

      return result;
    },

    // exported for testing purposes
    _decorateOAuthResult: _decorateOAuthResult,
    _formatOAuthResult: _formatOAuthResult,
    _notifyChannel: _notifyChannel
  };
});
