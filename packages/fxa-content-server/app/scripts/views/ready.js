/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle sign_in_complete, sign_up_complete,
 * and reset_password_complete.
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
  'lib/strings',
  'lib/oauth-mixin'
],
function (_, BaseView, FormView, Template, Session, Xss, Strings, OAuthMixin) {

  var SURVEY_PERCENTAGE = 10;

  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;

      this._surveyPercentage = 'surveyPercentage' in options ? options.surveyPercentage : SURVEY_PERCENTAGE;
    },

    beforeRender: function () {
      if (this.isOAuthSameBrowser()) {
        // We're continuing an OAuth flow from the same browser
        this.setupOAuth(Session.oauth);
        return this.setServiceInfo();
      } else if (this.isOAuth()) {
        // We're continuing an OAuth flow in a different browser
        this.setupOAuth();
        return this.setServiceInfo();
      }
    },

    context: function () {
      var serviceName = this.serviceName;

      if (this.serviceRedirectURI) {
        serviceName = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(this.serviceRedirectURI), serviceName
        ]);
      }

      var shouldShowSurvey = this._shouldShowSurvey(this._surveyPercentage);
      var shouldShowMarketing = this._shouldShowSignUpMarketing(shouldShowSurvey);

      return {
        service: this.service,
        serviceName: serviceName,
        signIn: this.is('sign_in'),

        signUp: this.is('sign_up'),
        showSignUpSurvey: shouldShowSurvey,
        showSignUpMarketing: shouldShowMarketing,

        resetPassword: this.is('reset_password')
      };
    },

    events: {
      'click #redirectTo': BaseView.preventDefaultThen('submit')
    },

    _shouldShowSurvey: function (surveyPercentage) {
      var isEnglish = /^en/.test(Session.language);

      if (! isEnglish) {
        return false;
      }

      return Math.random() <= (surveyPercentage / 100);
    },

    _shouldShowSignUpMarketing: function (showSurvey) {
      if (! this.is('sign_up') || showSurvey) {
        return false;
      }

      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      var ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      var isMobileFirefox = ua.indexOf('Mobile') > -1 && ua.indexOf('Firefox') > -1;
      var isTabletFirefox = ua.indexOf('Tablet') > -1 && ua.indexOf('Firefox') > -1;

      return ! (isMobileFirefox || isTabletFirefox);
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

    submit: function () {
      if (this.isOAuthSameBrowser()) {
        return this.finishOAuthFlow();
      } else if (this.isOAuth()) {
        return this.oAuthRedirectWithError();
      }
    },

    is: function (type) {
      return this.type === type;
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
