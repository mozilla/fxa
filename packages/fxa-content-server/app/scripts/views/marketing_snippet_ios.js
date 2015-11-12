/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles the marketing snippet on the 'ready' page.
 *
 * Shows `Get Sync on Firefox for Android` for users that complete
 * signup for sync in Firefox Desktop.
 */

define(function (require, exports, module) {
  'use strict';

  var APP_STORE_BUTTON = 'apple_app_store_button';
  var PLAY_STORE_BUTTON = 'google_play_store_button';

  var FORMAT_SVG = 'svg';
  var FORMAT_PNG = 'png';

  var _ = require('underscore');
  var MarketingSnippetView = require('views/marketing_snippet');
  var Template = require('stache!templates/marketing_snippet_ios');

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
    },

    context: function () {
      var shouldShowMarketing = this._shouldShowSignUpMarketing();
      var isIos = this._isIos();
      var isAndroid = this._isAndroid();
      var playStoreImage = this._storeImage(PLAY_STORE_BUTTON, FORMAT_PNG);
      var appStoreImage = this._storeImage(APP_STORE_BUTTON, FORMAT_SVG);

      return {
        appStoreImage: appStoreImage,
        isAndroid: isAndroid,
        isIos: isIos,
        isOther: ! isIos && ! isAndroid,
        playStoreImage: playStoreImage,
        showSignUpMarketing: shouldShowMarketing
      };
    },

    _isIos: function () {
      var plat = this.window.navigator.platform;

      return /i(Phone|Pad|Pod)/.test(plat);
    },

    _isAndroid: function () {
      return /android/i.test(this.window.navigator.userAgent);
    },

    _storeImage: function (buttonDir, imageFormat) {
      var buttonPath = _.contains(playStoreImageLanguages, this._language) ?
                          this._language : 'en';

      if (this._isHighRes() && imageFormat === FORMAT_PNG) {
        buttonPath += '@2x';
      }

      return '/images/' + buttonDir + '/' + buttonPath + '.' + imageFormat;
    },

    _isHighRes: function () {
      var win = this.window;

      return !! (win.matchMedia && win.matchMedia('(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx), (min-resolution: 144dpi)'));
    }
  });

  module.exports = View;
});
