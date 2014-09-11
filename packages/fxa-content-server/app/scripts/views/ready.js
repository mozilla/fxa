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
  'views/form',
  'stache!templates/ready',
  'lib/session',
  'lib/xss',
  'lib/url',
  'lib/strings',
  'lib/auth-errors',
  'views/mixins/service-mixin',
  'views/marketing_snippet'
],
function (_, BaseView, FormView, Template, Session, Xss, Url, Strings, AuthErrors, ServiceMixin, MarketingSnippet) {

  var View = BaseView.extend({
    template: Template,
    className: 'ready',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
      this.language = options.language;
    },

    beforeRender: function () {
      if (this.relier.has('service')) {
        this.setupOAuth();
      }
    },

    context: function () {
      var serviceName = this.relier.get('serviceName');
      var redirectUri = this.relier.get('redirectUri');

      // if the given redirect uri is an URN based uri, such as
      // "urn:ietf:wg:oauth:2.0:fx:webchannel" then we don't show
      // clickable service links. The flow should be completed
      // automatically depending on the flow it is using
      // (such as iFrame or WebChannel).
      if (redirectUri && Url.isHTTP(redirectUri)) {
        serviceName = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(redirectUri), serviceName
        ]);
      }

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

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
      // Finish the WebChannel flow
      if (Session.oauth && Session.oauth.webChannelId) {
        this.submit();
      }

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

    submit: function () {
      if (this.isOAuthSameBrowser()) {
        return this.finishOAuthFlow({
          source: this.type
        });
      } else if (this.isOAuthDifferentBrowser()) {
        return this.finishOAuthFlowDifferentBrowser();
      } else {
        // We aren't expecting this case to happen.
        this.displayError(AuthErrors.toError('UNEXPECTED_ERROR'));
      }
    },

    is: function (type) {
      return this.type === type;
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});
