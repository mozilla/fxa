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
  'lib/session',
  'lib/xss',
  'lib/strings',
  'lib/auth-errors',
  'lib/promise',
  'views/mixins/service-mixin',
  'views/marketing_snippet'
],
function (Cocktail, BaseView, Template, Session, Xss, Strings,
      AuthErrors, p, ServiceMixin, MarketingSnippet) {

  var View = BaseView.extend({
    template: Template,
    className: 'ready',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
      this.language = options.language;
    },

    context: function () {
      var serviceName = this.relier.get('serviceName');

      return {
        service: this.relier.get('service'),
        serviceName: serviceName,
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
      var marketingSnippet = new MarketingSnippet({
        type: this.type,
        service: this.relier.get('service'),
        language: this.language,
        el: this.$('.marketing-area'),
        metrics: this.metrics
      });
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
