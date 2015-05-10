/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

'use strict';

define([
  'cocktail',
  'views/base',
  'stache!templates/ready',
  'lib/url',
  'lib/constants',
  'views/mixins/service-mixin',
  'views/marketing_snippet',
  'views/marketing_snippet_ios'
],
function (Cocktail, BaseView, Template, Url, Constants, ServiceMixin,
      MarketingSnippet, MarketingSnippetiOS) {

  var View = BaseView.extend({
    template: Template,
    className: 'ready',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;

      this.type = options.type;
      this.language = options.language;
    },

    context: function () {
      var serviceName = this.relier.get('serviceName');
      var redirectUri = this.relier.get('redirectUri');
      var verificationRedirect = this.relier.get('verificationRedirect');
      var showProceedButton = false;

      // if this is a "signup" flow and the relier uses verification_redirect
      // then show the "Proceed" button
      if (verificationRedirect === Constants.VERIFICATION_REDIRECT_ALWAYS &&
          redirectUri && Url.isNavigable(redirectUri) && this.is('sign_up')) {
        showProceedButton = true;
      }

      return {
        service: this.relier.get('service'),
        serviceName: serviceName,
        showProceedButton: showProceedButton,
        redirectUri: redirectUri,
        signUp: this.is('sign_up'),
        resetPassword: this.is('reset_password'),
        accountUnlock: this.is('account_unlock')
      };
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      return this._createMarketingSnippet();
    },

    _createMarketingSnippet: function () {
      var marketingSnippet;
      var marketingSnippetOpts = {
        type: this.type,
        service: this.relier.get('service'),
        language: this.language,
        el: this.$('.marketing-area'),
        metrics: this.metrics
      };

      // spring campaign scheduled to launch 6/2
      if (this._able.choose('springCampaign2015')) {
        marketingSnippet = new MarketingSnippetiOS(marketingSnippetOpts);
      } else {
        marketingSnippet = new MarketingSnippet(marketingSnippetOpts);
      }

      this.trackSubview(marketingSnippet);

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

  return View;
});
