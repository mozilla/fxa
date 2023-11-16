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

    this.enabled =
      this.disableBanner == null &&
      (this.mode === 'prelaunch' || this.mode === 'postlaunch');

    if (this.enabled) {
      this.logFlowEventOnce(`brand-messaging-${this.mode}-view`, this.viewName);
      document.body.classList.add('brand-messaging');
    }
  },

  afterRender() {
    if (!this.enabled) {
      return;
    }

    setTimeout(() => {
      const brandMessageNode = document.querySelector('.banner-brand-message');
      const insertBanner = (selector) => {
        const container = document.querySelector(selector);

        // Clears out text incase of double render scenario...
        container.innerText = '';
        const clone = brandMessageNode.cloneNode(true);
        container.append(clone);
      };

      const bindClickHandlers = () => {
        /**
         * Note, we can't use backbone's event object, because moving the elements
         * unbinds its events. Instead, directly bind events here.
         */
        document.querySelectorAll('.close-brand-banner').forEach((x) => {
          x.onclick = () => {
            this.onBrandBannerClose();
          };
        });
        document.querySelectorAll('.brand-learn-more').forEach((x) => {
          x.onclick = () => {
            this.onBrandLearnMoreClick();
          };
        });
      };

      if (brandMessageNode) {
        /**
         * Inject the brand message into the top and bottom of the page.
         */
        insertBanner('#body-top');
        insertBanner('#body-bottom');
        bindClickHandlers();
      } else {
        /**
         * Recursive call. If the node doesn't exist, try again. There appear to be
         * some race condition in backbones 'afterRender' method.
         */
        this.afterRender();
      }
    }, 100);
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
    document
      .querySelectorAll('.banner-brand-message')
      .forEach((x) => x.remove());
    this.logFlowEvent(
      `brand-messaging-${this.mode}-banner-close`,
      this.viewName
    );
  },

  onBrandLearnMoreClick() {
    this.logFlowEvent(`brand-messaging-${this.mode}-learn-more`, this.viewName);
  },
};

export default Mixin;
