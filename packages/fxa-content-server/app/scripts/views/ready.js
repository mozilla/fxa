/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

define(function (require, exports, module) {
  'use strict';

  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var FormView = require('views/form');
  var MarketingSnippet = require('views/marketing_snippet');
  var MarketingSnippetiOS = require('views/marketing_snippet_ios');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/ready');
  var Url = require('lib/url');

  function t(msg) {
    return msg;
  }

  /*eslint-disable camelcase*/

  var FX_SYNC_WILL_BEGIN_MOMENTARILY =
          t('Firefox Sync will begin momentarily');

  /**
   * Some template strings are fetched from JS to keep
   * the template marginally cleaner and easier to read.
   */
  var TEMPLATE_INFO = {
    account_unlock: {
      headerId: 'fxa-account-unlock-complete-header',
      headerTitle: t('Account unlocked'),
      readyToSyncText: FX_SYNC_WILL_BEGIN_MOMENTARILY
    },
    force_auth: {
      headerId: 'fxa-force-auth-complete-header',
      headerTitle: t('Welcome back'),
      readyToSyncText: t('Firefox Sync will resume momentarily'),
    },
    reset_password: {
      headerId: 'fxa-reset-password-complete-header',
      headerTitle: t('Password reset'),
      readyToSyncText: FX_SYNC_WILL_BEGIN_MOMENTARILY
    },
    // sign_in_complete is only shown to sync for now.
    sign_in: {
      headerId: 'fxa-sign-in-complete-header',
      headerTitle: t('Welcome to Sync'),
      readyToSyncText: FX_SYNC_WILL_BEGIN_MOMENTARILY
    },
    sign_up: {
      headerId: 'fxa-sign-up-complete-header',
      headerTitle: t('Account verified'),
      readyToSyncText: t('You are now ready to use %(serviceName)s')
    }
  };

  /*eslint-enable camelcase*/

  var View = FormView.extend({
    template: Template,
    className: 'ready',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;

      this.type = options.type;
      this.language = options.language;

      if (this._shouldShowProceedButton()) {
        this.submit = this._submitForProceed.bind(this);
      } else if (this._shouldShowSyncPreferencesButton()) {
        this.submit = this._submitForSyncPreferences.bind(this);
      }
    },

    context: function () {
      return {
        headerId: this._getHeaderId(),
        headerTitle: this._getHeaderTitle(),
        isSync: this.relier.isSync(),
        readyToSyncText: this._getReadyToSyncText(),
        redirectUri: this.relier.get('redirectUri'),
        service: this.relier.get('service'),
        serviceName: this.relier.get('serviceName'),
        shouldShowProceedButton: this._shouldShowProceedButton(),
        shouldShowSyncPreferencesButton: this._shouldShowSyncPreferencesButton()
      };
    },

    _getHeaderId: function () {
      return TEMPLATE_INFO[this.type].headerId;
    },

    _getHeaderTitle: function () {
      var title = TEMPLATE_INFO[this.type].headerTitle;
      return this.translateInTemplate(title);
    },

    _getReadyToSyncText: function () {
      var readyToSyncText = TEMPLATE_INFO[this.type].readyToSyncText;
      return this.translateInTemplate(readyToSyncText);
    },

    _submitForProceed: function () {
      var self = this;
      return this.metrics.flush().then(function () {
        self.window.location.href = self.relier.get('redirectUri');
      });
    },

    _submitForSyncPreferences: function () {
      var self = this;
      return this.metrics.flush().then(function () {
        return self.broker.openSyncPreferences();
      });
    },

    /**
     * Determines if the view should show the "Proceed" button in the template.
     * The button links to the redirect_uri of the relier with no extra
     * OAuth information.
     *
     * @returns {boolean}
     * @private
     */
    _shouldShowProceedButton: function () {
      var redirectUri = this.relier.get('redirectUri');
      var verificationRedirect = this.relier.get('verificationRedirect');

      return !! (this.is('sign_up') &&
                 redirectUri &&
                 Url.isNavigable(redirectUri) &&
                 verificationRedirect === Constants.VERIFICATION_REDIRECT_ALWAYS);
    },

    /**
     * Determine whether the `Sync Preferences` button should be shown.
     *
     * @returns {boolean}
     * @private
     */
    _shouldShowSyncPreferencesButton: function () {
      return !! (this.relier.isSync() &&
                 this.broker.hasCapability('syncPreferencesNotification'));
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      return this._createMarketingSnippet();
    },

    _createMarketingSnippet: function () {
      if (! this.broker.hasCapability('emailVerificationMarketingSnippet')) {
        return;
      }

      var marketingSnippetOpts = {
        el: this.$('.marketing-area'),
        language: this.language,
        metrics: this.metrics,
        service: this.relier.get('service'),
        type: this.type
      };

      var marketingSnippet;
      if (this._able.choose('springCampaign2015')) {
        marketingSnippet = new MarketingSnippetiOS(marketingSnippetOpts);
      } else {
        marketingSnippet = new MarketingSnippet(marketingSnippetOpts);
      }

      this.trackChildView(marketingSnippet);

      return marketingSnippet.render();
    },

    is: function (type) {
      return this.type === type;
    }
  });

  Cocktail.mixin(
    View,
    ServiceMixin
  );

  module.exports = View;
});
