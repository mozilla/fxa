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
  const $ = require('jquery');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const Template = require('stache!templates/marketing_snippet');
  const UserAgent = require('lib/user-agent');
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

    events: {
      'click .marketing-link': '_onMarketingClick'
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

    afterRender () {
      this.$('.marketing-link').each((index, element) => {
        const $element = $(element);

        const id = $element.attr('data-marketing-id');
        const url = $element.attr('href');

        this.metrics.logMarketingImpression(id, url);
      });
    },

    _getUap () {
      if (! this._uap) {
        this._uap = new UserAgent(this.window.navigator.userAgent);
      }
      return this._uap;
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
      const uap = this._getUap();

      return uap.isFirefox() &&
             (uap.isIos() || uap.isAndroid());
    },

    _isIos () {
      return this._getUap().isIos();
    },

    _isAndroid () {
      return this._getUap().isAndroid();
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
    },

    _onMarketingClick (event) {
      var element = $(event.currentTarget);
      this._logMarketingClick(element);
    },

    _logMarketingClick (element) {
      var id = element.attr('data-marketing-id');
      var url = element.attr('href');

      this.metrics.logMarketingClick(id, url);
    }
  });

  Cocktail.mixin(
    View,
    VerificationReasonMixin
  );

  module.exports = View;
});


