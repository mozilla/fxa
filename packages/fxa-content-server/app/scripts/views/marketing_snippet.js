/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles the Firefox for Mobile marketing snippet. Shows an
 * iOS iTunes logo if user completes on iOS, shows a Google Play store logo
 * if completing on Android, shows both logos if completing on
 * neither.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const Template = require('stache!templates/marketing_snippet');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const APP_STORE_BUTTON = 'apple_app_store_button';
  const PLAY_STORE_BUTTON = 'google_play_store_button';

  const FORMAT_SVG = 'svg';
  const FORMAT_PNG = 'png';

  const playStoreImageLanguages = [
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

  const View = BaseView.extend({
    template: Template,

    initialize (options = {}) {
      this._service = options.service;
    },

    context () {
      const showSignUpMarketing = this._shouldShowSignUpMarketing();
      const isIos = this._isIos();
      const isAndroid = this._isAndroid();
      const isOther = (! isIos && ! isAndroid);
      const playStoreImage = this._storeImage(PLAY_STORE_BUTTON, FORMAT_PNG);
      const appStoreImage = this._storeImage(APP_STORE_BUTTON, FORMAT_SVG);

      return {
        appStoreImage,
        isAndroid,
        isIos,
        isOther,
        playStoreImage,
        showSignUpMarketing
      };
    },

    _shouldShowSignUpMarketing () {
      const isFirefoxMobile = this._isFirefoxMobile();
      const isSignUp = this.isSignUp();
      const isSignIn = this.isSignIn();
      const isSync = this._service === Constants.SYNC_SERVICE;

      // If the user is completing a signup or signin for sync, ALWAYS
      // show the marketing snippet.
      return (isSignUp || isSignIn) && isSync && ! isFirefoxMobile;
    },

    _isFirefoxMobile () {
      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      const ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      const isMobileAndroidFirefox = /Mobile/.test(ua) && /Firefox/.test(ua);
      const isTabletAndroidFirefox = /Tablet/.test(ua) && /Firefox/.test(ua);
      // Fx on iOS
      const isMobileIosFirefox = /FxiOS/.test(ua);

      return isMobileAndroidFirefox || isTabletAndroidFirefox || isMobileIosFirefox;
    },

    _isIos () {
      const plat = this.window.navigator.platform;

      return /i(Phone|Pad|Pod)/.test(plat);
    },

    _isAndroid () {
      return /android/i.test(this.window.navigator.userAgent);
    },

    _storeImage (buttonDir, imageFormat) {
      let buttonPath = _.contains(playStoreImageLanguages, this.lang) ?
                          this.lang : 'en';

      if (this._isHighRes() && imageFormat === FORMAT_PNG) {
        buttonPath += '@2x';
      }

      return '/images/' + buttonDir + '/' + buttonPath + '.' + imageFormat;
    },

    _isHighRes () {
      const win = this.window;

      return !! (win.matchMedia && win.matchMedia('(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx), (min-resolution: 144dpi)'));
    }
  });

  Cocktail.mixin(
    View,
    MarketingMixin,
    VerificationReasonMixin
  );

  module.exports = View;
});


