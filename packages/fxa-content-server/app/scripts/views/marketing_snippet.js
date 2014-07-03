/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles the marketing snippet on the 'ready' page.
 *
 * Shows `Get Sync on Firefox for Android` for most users that complete
 * signup for sync in Firefox Desktop.
 *
 * 10% of english speaking users from the above group are diverted to
 * take a survey.
 *
 * For sign in and reset password, the survey is always shown to english
 * speaking users, and nothing is displayed to non-english speakers.
 */

'use strict';

define([
  'views/base',
  'stache!templates/marketing_snippet'
], function (BaseView, Template) {
  var SURVEY_PERCENTAGE = 0;

  var View = BaseView.extend({
    template: Template,

    initialize: function (options) {
      options = options || {};

      this._type = options.type;
      this._service = options.service;
      this._language = options.language;

      this._surveyPercentage = 'surveyPercentage' in options ? options.surveyPercentage : SURVEY_PERCENTAGE;
    },

    context: function () {
      var shouldShowMarketing = this._shouldShowSignUpMarketing();
      var shouldShowSurvey = this._shouldShowSurvey(shouldShowMarketing);

      return {
        showSignUpSurvey: shouldShowSurvey,
        showSignUpMarketing: shouldShowMarketing
      };
    },

    _shouldShowSignUpMarketing: function () {
      var isSignUp = this._type === 'sign_up';
      var isSync = this._service === 'sync';
      var isFirefoxMobile = this._isFirefoxMobile();
      var isSelectedForSurvey = this._isSelectedForSurvey();

      // user can only be randomly selected for survey if
      // they speak english. If the user is completing a signup for sync and
      // does not speak english, ALWAYS show the marketing snippet.
      return isSignUp && isSync && ! isFirefoxMobile && ! isSelectedForSurvey;
    },

    _isSelectedForSurvey: function () {
      // user can only be randomly selected for survey if
      // they are elgible to see the survey.
      return Math.random() <= (this._surveyPercentage / 100) &&
                  this._canShowSurvey();
    },

    // user can only be see survey if they speak english.
    _canShowSurvey: function () {
      return /^en/.test(this._language);
    },

    _shouldShowSurvey: function (isMarketingVisible) {
      if (isMarketingVisible) {
        return false;
      }

      return this._canShowSurvey();
    },

    _isFirefoxMobile: function () {
      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      var ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      var isMobileFirefox = /Mobile/.test(ua) && /Firefox/.test(ua);
      var isTabletFirefox = /Tablet/.test(ua) && /Firefox/.test(ua);

      return isMobileFirefox || isTabletFirefox;
    }
  });

  return View;
});


