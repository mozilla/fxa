/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle sign_up_complete and reset_password_complete.
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

'use strict';

define([
  'underscore',
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
function (_, BaseView, Template, Session, Xss, Strings,
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
        resetPassword: this.is('reset_password')
      };
    },

    events: {
      'click #redirectTo': BaseView.preventDefaultThen('submit')
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      return this._createMarketingSnippet();
    },

    /*
    afterVisible: function () {
      // Finish the WebChannel flow
      var self = this;
      return p()
        .then(function () {
          if (self.isOAuthSameBrowser() && self.relier.get('webChannelId')) {
            // The delay is to give the functional tests time to bind an event
            // handler to listen for the `oauth_complete` message on the
            // web channel.
            return p().delay(100).then(_.bind(self.submit, self));
          }
        });
    },
    */

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

    submit: function () {
      var self = this;
      return p().then(function () {
        if (self.type === 'sign_up') {
          return self.broker.afterSignUpVerified(self);
        } else if (self.type === 'reset_password') {
          return self.broker.afterResetPasswordVerified(self);
        } else {
          // We aren't expecting this case to happen.
          self.displayError(AuthErrors.toError('UNEXPECTED_ERROR'));
        }
      });
    },

    is: function (type) {
      return this.type === type;
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});
