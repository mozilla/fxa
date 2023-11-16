/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin for brand in product messaging
 */
import Template from 'templates/partial/brand-messaging.mustache';
import Storage from '../../lib/storage';

const bannerClosedLocalStorageKey = 'fxa_disable_brand_banner';

/**
 * Creates the brand banner mixin.
 *
 * @param {Object} [config={}]
 *   @param {Boolean} [config.required=false] Is the input field required on form submit?
 * @returns {Function}
 */
const Mixin = {
  initialize(options) {
    if (options.config) {
      this.mode = options.config.brandMessagingMode;
    }
  },

  beforeRender() {
    // Check to see if the user has cleared the brand messaging banner. If so,
    // we don't want to keep showing them this messaging
    this.disableBanner = Storage.factory('localStorage', this.window).get(
      `${bannerClosedLocalStorageKey}_${this.mode}`
    );

    if (
      this.disableBanner == null &&
      (this.mode === 'prelaunch' || this.mode === 'postlaunch')
    ) {
      this.logFlowEvent(`brand-messaging-${this.mode}-view`, this.viewName);
      document.body.classList.add('brand-messaging');
    }
  },

  afterRender() {
    setTimeout(() => {
      /**
       * Move element up to body, so that it can be sticky header or inline footer.
       *
       * Note, we can't use backbone's event object, because moving the elements
       * unbinds it's events. Instead, directly bind events here.
       */
      const el = document.querySelector('#banner-brand-message');
      if (el) {
        document.body.append(el);
        document.querySelector('#close-brand-banner').onclick = () => {
          this.onBrandBannerClose();
        };
        document.querySelector('.brand-learn-more').onclick = () => {
          this.onBrandLearnMoreClick();
        };
      }
    }, 0);
  },

  setInitialContext(context) {
    const HTML = this.renderTemplate(Template, {
      showPrelaunch: this.mode === 'prelaunch',
      showPostlaunch: this.mode === 'postlaunch',
      showBanner:
        !this.disableBanner &&
        (this.mode === 'prelaunch' || this.mode === 'postlaunch'),
    });

    context.set({
      brandMessagingHTML: HTML,
    });
  },

  onBrandBannerClose() {
    this.disableBanner = true;
    Storage.factory('localStorage', this.window).set(
      `${bannerClosedLocalStorageKey}_${this.mode}`,
      this.disableBanner
    );
    document.querySelector('#banner-brand-message').remove();
    document.body.classList.remove('brand-messaging');
    this.logFlowEvent(
      `brand-messaging-${this.mode}-banner-close`,
      this.viewName
    );
  },

  onBrandLearnMoreClick() {
    this.logFlowEvent(`brand-messaging-${this.mode}-learn-more`, this.viewName);
    window.open(
      'https://support.mozilla.org/kb/firefox-accounts-renamed-mozilla-accounts',
      '_blank'
    );
  },
};

export default Mixin;
