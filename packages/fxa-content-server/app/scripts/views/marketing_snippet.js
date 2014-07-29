/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles the marketing snippet on the 'ready' page.
 *
 * Shows `Get Sync on Firefox for Android` for users that complete
 * signup for sync in Firefox Desktop.
 */

'use strict';

define([
  'views/base',
  'stache!templates/marketing_snippet'
], function (BaseView, Template) {

  var View = BaseView.extend({
    template: Template,

    initialize: function (options) {
      options = options || {};

      this._type = options.type;
      this._service = options.service;
      this._language = options.language;
    },

    context: function () {
      var shouldShowMarketing = this._shouldShowSignUpMarketing();

      return {
        showSignUpMarketing: shouldShowMarketing
      };
    },

    events: {
      'click .marketing-link': '_logMarketingClick'
    },

    afterRender: function () {
      var marketingType = this.$('[data-marketing-type]').attr('data-marketing-type');
      var marketingLink = this.$('.marketing-link').attr('href');


      this.metrics.logMarketingImpression(marketingType, marketingLink);
    },

    _shouldShowSignUpMarketing: function () {
      var isSignUp = this._type === 'sign_up';
      var isSync = this._service === 'sync';
      var isFirefoxMobile = this._isFirefoxMobile();

      // user can only be randomly selected for survey if
      // they speak english. If the user is completing a signup for sync and
      // does not speak english, ALWAYS show the marketing snippet.
      return isSignUp && isSync && ! isFirefoxMobile;
    },

    _isFirefoxMobile: function () {
      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      var ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      var isMobileFirefox = /Mobile/.test(ua) && /Firefox/.test(ua);
      var isTabletFirefox = /Tablet/.test(ua) && /Firefox/.test(ua);

      return isMobileFirefox || isTabletFirefox;
    },

    _logMarketingClick: function () {
      this.metrics.logMarketingClick();
    }
  });

  return View;
});


