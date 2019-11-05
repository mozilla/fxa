/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles the Firefox for Mobile marketing snippet. Shows an
 * iOS iTunes logo if user completes on iOS, shows a Google Play store logo
 * if completing on Android, shows both logos if completing on
 * neither.
 *
 * Create snippet with `which` option to force a particular
 * logo to be displayed. See View.WHICH for acceptable values.
 */

import _ from 'underscore';
import $ from 'jquery';
import BaseView from './base';
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import Strings from '../lib/strings';
import Template from 'templates/marketing_snippet.mustache';
import UserAgentMixin from '../lib/user-agent-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';

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
  'zh-TW',
];

const View = BaseView.extend(
  {
    template: Template,

    /**
     * Initialize.
     *
     * @param {Object} [options={}]
     *  @param {String} [options.marketingId] - marketing ID to use for logging.
     *   Defaults to Constants.MARKETING_ID_SPRING_2015.
     *  @param {String} [options.service] - the service being signed in to.
     *  @param {String} [options.which] - force a logo to be displayed.
     *   Defaults to `undefined`
     */
    initialize(options = {}) {
      this._marketingId =
        options.marketingId || Constants.MARKETING_ID_SPRING_2015;
      this._service = options.service;
      this._which = options.which;
    },

    events: {
      'click .marketing-link': '_onMarketingClick',
    },

    setInitialContext(context) {
      const showSignUpMarketing = this._shouldShowSignUpMarketing();
      const isIos = this._isIos();
      const isAndroid = this._isAndroid();
      const isOther = this._isOther();
      const downloadLinkAndroid = this._storeLink(
        Constants.DOWNLOAD_LINK_TEMPLATE_ANDROID
      );
      const playStoreImage = this._storeImage(PLAY_STORE_BUTTON, FORMAT_PNG);
      const downloadLinkIos = this._storeLink(
        Constants.DOWNLOAD_LINK_TEMPLATE_IOS
      );
      const appStoreImage = this._storeImage(APP_STORE_BUTTON, FORMAT_SVG);

      const marketingId = this._marketingId;
      const isAutumn2016 = marketingId === Constants.MARKETING_ID_AUTUMN_2016;
      const isSpring2015 = marketingId === Constants.MARKETING_ID_SPRING_2015;

      context.set({
        appStoreImage,
        downloadLinkAndroid,
        downloadLinkIos,
        isAndroid,
        isAutumn2016,
        isIos,
        isOther,
        isSpring2015,
        marketingId,
        playStoreImage,
        showSignUpMarketing,
      });
    },

    afterRender() {
      this.$('.marketing-link').each((index, element) => {
        this._logMarketingImpression(element);
      });

      // Add the marketingId as a class so that different styles
      // can be applied to different snippets.
      this.$el.addClass(this._marketingId);
    },

    _shouldShowSignUpMarketing() {
      const hasBrokerSupport = this.broker.hasCapability(
        'emailVerificationMarketingSnippet'
      );
      const isFirefoxMobile = this._isFirefoxMobile();
      const isSignIn = this.isSignIn();
      const isSignUp = this.isSignUp();
      const isSync = this._service === Constants.SYNC_SERVICE;

      return (
        !! this._which || // if _which is set, display is considered forced.
        (hasBrokerSupport &&
          (isSignUp || isSignIn) &&
          isSync &&
          ! isFirefoxMobile)
      );
    },

    _isFirefoxMobile() {
      const uap = this.getUserAgent();
      return uap.isFirefoxIos() || uap.isFirefoxAndroid();
    },

    _isIos() {
      // if _which is set, ignore the userAgent
      return (
        (! this._which && this.getUserAgent().isIos()) ||
        this._which === View.WHICH.IOS
      );
    },

    _isAndroid() {
      return (
        (! this._which && this.getUserAgent().isAndroid()) ||
        this._which === View.WHICH.ANDROID
      );
    },

    _isOther() {
      return (
        (! this._isIos() && ! this._isAndroid()) ||
        this._which === View.WHICH.BOTH
      );
    },

    /**
     * Add the appropriate metrics related query params to
     * the Firefox app's app store link.
     *
     * @param {String} base
     * @returns {String}
     */
    _storeLink(base) {
      return Strings.interpolate(base, {
        campaign: 'fxa-conf-page',
        creative: View.BUTTON_IDS[this._marketingId],
      });
    },

    _storeImage(buttonDir, imageFormat) {
      let buttonPath = _.contains(playStoreImageLanguages, this.lang)
        ? this.lang
        : 'en';

      if (this._isHighRes() && imageFormat === FORMAT_PNG) {
        buttonPath += '@2x';
      }

      return '/images/' + buttonDir + '/' + buttonPath + '.' + imageFormat;
    },

    _isHighRes() {
      const win = this.window;

      return !! (
        win.matchMedia &&
        win.matchMedia(
          '(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx), (min-resolution: 144dpi)'
        )
      );
    },

    _logMarketingImpression(element) {
      const { id, type, url } = this._getMarketingLinkInfo(element);
      this.metrics.logMarketingImpression(id, url);
      this.notifier.trigger('marketing.impression', {
        id,
        type,
        url,
      });
    },

    _onMarketingClick(event) {
      this._logMarketingClick(event.currentTarget);
    },

    _logMarketingClick(element) {
      const { id, type, url } = this._getMarketingLinkInfo(element);
      this.metrics.logMarketingClick(id, url);
      this.notifier.trigger('marketing.clicked', {
        id,
        type,
        url,
      });
    },

    _getMarketingLinkInfo(element) {
      const $element = $(element);

      const id = $element.data('marketing-id');
      const type = $element.data('marketing-type');
      const url = $element.attr('href');

      return { id, type, url };
    },
  },
  {
    BUTTON_IDS: {
      [Constants.MARKETING_ID_AUTUMN_2016]:
        'button-autumn-2016-connect-another-device',
      [Constants.MARKETING_ID_SPRING_2015]: 'button',
    },
    WHICH: {
      ANDROID: 'android',
      BOTH: 'both',
      IOS: 'ios',
    },
  }
);

Cocktail.mixin(View, UserAgentMixin, VerificationReasonMixin);

export default View;
