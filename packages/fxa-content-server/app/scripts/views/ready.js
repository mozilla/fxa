/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const FormView = require('views/form');
  const MarketingSnippet = require('views/marketing_snippet');
  const p = require('lib/promise');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Template = require('stache!templates/ready');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const t = msg => msg;

  /*eslint-disable camelcase*/

  const FX_SYNC_WILL_BEGIN_MOMENTARILY =
          t('Firefox Sync will begin momentarily');

  /**
   * Some template strings are fetched from JS to keep
   * the template marginally cleaner and easier to read.
   */
  const TEMPLATE_INFO = {
    FORCE_AUTH: {
      headerId: 'fxa-force-auth-complete-header',
      headerTitle: t('Welcome back'),
      readyToSyncText: t('Firefox Sync will resume momentarily'),
    },
    PASSWORD_RESET: {
      headerId: 'fxa-reset-password-complete-header',
      headerTitle: t('Password reset'),
      readyToSyncText: FX_SYNC_WILL_BEGIN_MOMENTARILY
    },
    // signin_confirmed and signin_verified are only shown to Sync for now.
    SIGN_IN: {
      headerId: 'fxa-sign-in-complete-header',
      headerTitle: t('Sign-in confirmed'),
      readyToSyncText: t('You are now ready to use %(serviceName)s')
    },
    SIGN_UP: {
      headerId: 'fxa-sign-up-complete-header',
      headerTitle: t('Account verified'),
      readyToSyncText: t('You are now ready to use %(serviceName)s')
    }
  };

  /*eslint-enable camelcase*/

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'ready',

    initialize (options) {
      options = options || {};

      this._able = options.able;

      this._templateInfo = TEMPLATE_INFO[this.keyOfVerificationReason(options.type)];
    },

    context () {
      return {
        headerId: this._getHeaderId(),
        headerTitle: this._getHeaderTitle(),
        isSync: this.relier.isSync(),
        readyToSyncText: this._getReadyToSyncText(),
        redirectUri: this.relier.get('redirectUri'),
        service: this.relier.get('service'),
        serviceName: this.relier.get('serviceName'),
        shouldShowProceedButton: this._shouldShowProceedButton()
      };
    },

    _getHeaderId () {
      return this._templateInfo.headerId;
    },

    _getHeaderTitle () {
      var title = this._templateInfo.headerTitle;
      return this.translateInTemplate(title);
    },

    _getReadyToSyncText () {
      var readyToSyncText = this._templateInfo.readyToSyncText;
      return this.translateInTemplate(readyToSyncText);
    },

    _submitForProceed () {
      return this.metrics.flush().then(() => {
        this.window.location.href = this.relier.get('redirectUri');
      });
    },

    submit () {
      if (this._shouldShowProceedButton()) {
        return this._submitForProceed();
      }
    },

    /**
     * Determines if the view should show the "Proceed" button in the template.
     * The button links to the redirect_uri of the relier with no extra
     * OAuth information.
     *
     * @returns {Boolean}
     * @private
     */
    _shouldShowProceedButton () {
      var redirectUri = this.relier.get('redirectUri');
      var verificationRedirect = this.relier.get('verificationRedirect');

      return !! (this.isSignUp() &&
                 redirectUri &&
                 verificationRedirect === Constants.VERIFICATION_REDIRECT_ALWAYS);
    },

    afterRender () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      return this._createMarketingSnippet()
        .then(proto.afterRender.bind(this));
    },

    _createMarketingSnippet () {
      if (! this.broker.hasCapability('emailVerificationMarketingSnippet')) {
        return p();
      }

      const marketingSnippetOpts = {
        el: this.$('.marketing-area'),
        lang: this.lang,
        metrics: this.metrics,
        service: this.relier.get('service'),
        type: this.model.get('type')
      };

      const marketingSnippet = new MarketingSnippet(marketingSnippetOpts);

      this.trackChildView(marketingSnippet);

      return marketingSnippet.render();
    }
  });

  Cocktail.mixin(
    View,
    ServiceMixin,
    VerificationReasonMixin
  );

  module.exports = View;
});
