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
  'underscore',
  'views/marketing_snippet',
  'lib/constants',
  'stache!templates/marketing_snippet_ios'
], function (_, MarketingSnippetView, Constants, Template) {

  var appStoreImageLanguages = [
    'da',
    'de',
    'en',
    'es',
    'et',
    'fr',
    'he',
    'hu',
    'id',
    'it',
    'ja',
    'ko',
    'lt',
    'nb-NO',
    'nl',
    'pl',
    'pt-BR',
    'pt',
    'ru',
    'sk',
    'sl',
    'sv-SE',
    'tr',
    'zh-CN',
    'zh-TW'
  ];

  var playStoreImageLanguages = [
    'ca',
    'cs',
    'da',
    'de',
    'en',
    'es',
    'et',
    'fr',
    'hu',
    'id',
    'it',
    'ja',
    'ko',
    'lt',
    'nb-NO',
    'nl',
    'pl',
    'pt-BR',
    'pt',
    'ru',
    'sk',
    'sl',
    'sv',
    'tr',
    'uk',
    'zh-CN',
    'zh-TW'
  ];

  var View = MarketingSnippetView.extend({
    template: Template,

    initialize: function (options) {
      options = options || {};

      MarketingSnippetView.prototype.initialize.call(this, options);

      this._language = options.language;
      this._able = options.able;
    },

    context: function () {
      // fallback in case experiment has not concluded
      var fxIos = this._able.choose('fxIos') || {};

      // app store links come from experiments
      // allows us to update after prod push
      var appStoreLinkDirect = fxIos.appStoreLinkDirect;
      var appStoreLinkWeb = fxIos.appStoreLinkWeb;

      var shouldShowMarketing = this._shouldShowSignUpMarketing();
      var isIos = this._isIos();
      var isAndroid = this._isAndroid();
      var appStoreImage = this._appStoreImage();
      var playStoreImage = this._playStoreImage();

      return {
        showSignUpMarketing: shouldShowMarketing,
        isIos: isIos,
        isAndroid: isAndroid,
        isOther: (!isIos && !isAndroid),
        appStoreLinkDirect: appStoreLinkDirect,
        appStoreLinkWeb: appStoreLinkWeb,
        appStoreImage: appStoreImage,
        playStoreImage: playStoreImage
      };
    },

    _isIos: function () {
      var plat = this.window.navigator.platform;

      return /i(Phone|Pad|Pod)/.test(plat);
    },

    _isAndroid: function () {
      return /android/i.test(this.window.navigator.userAgent);
    },

    _appStoreImage: function () {
      // fall back to en image if user's language is not supported
      var buttonLang = _.contains(appStoreImageLanguages, this._language) ?
                          this._language : 'en';

      // images without cache-busting URLs are used since most users will
      // only ever see these images one time. This can be updated if
      // requirements change.
      return '/images/apple_app_store_button/' + buttonLang + '.svg';
    },

    _playStoreImage: function () {
      var buttonPath = _.contains(playStoreImageLanguages, this._language) ?
                          this._language : 'en';

      if (this._isHighRes()) {
        buttonPath += '@2x';
      }

      return '/images/google_play_store_button/' + buttonPath + '.png';
    },

    _isHighRes: function () {
      var win = this.window;

      return !!(win.matchMedia && win.matchMedia('(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx), (min-resolution: 144dpi)'));
    }
  });

  return View;
});
