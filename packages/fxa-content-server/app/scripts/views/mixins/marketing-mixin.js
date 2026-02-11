/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view mixin that takes care of creating the marketing snippet, if needed.
 *
 * Unlike most other mixins, this module returns a function which must be called
 * to get the mixin, e.g.:
 *
 * ```js
 *  Coctail.mixin(
 *    View,
 *    MarketingMixin({ autocreate: false, marketingId: 'spring-2017' })
 *  );
 * ```
 */

import _ from 'underscore';
import MarketingSnippet from '../marketing_snippet';

/**
 * Function that must be called to return the mixin.
 *
 * @param {Object} [options={}] options
 *  @param {String} [options.marketingId] - marketing ID to use for logging.
 *  @param {Boolean} [options.autocreate] - automatically create the marketing snippet
 *   in afterRender. Defaults to `true`. If set to `false`, `createMarketingSnippet`
 *   must be called.
 *  @param {Boolean} [options.which] - Which marketing link to show. See MarketingSnippet.WHICH.
 * @returns {Object}
 */
const MarketingMixin = (options = {}) => {
  return {
    /**
     * Create the marketing snippet
     *
     * @param {Object} [createOptions={}] options
     *  @param {String} [createOptions.marketingId] - marketing ID to use for logging.
     *  @param {Boolean} [createOptions.which] - Which marketing link to show. See
     *   MarketingSnippet.WHICH.
     * @returns {Object}
     */
    createMarketingSnippet(createOptions = {}) {
      const marketingSnippetOpts = _.extend(
        {
          broker: this.broker,
          el: this.$('.marketing-area'),
          lang: this.lang,
          metrics: this.metrics,
          notifier: this.notifier,
          service: this.relier.get('service'),
          type: this.model.get('type'),
          window: this.window,
        },
        options,
        createOptions
      );

      const marketingSnippet = new MarketingSnippet(marketingSnippetOpts);
      this.trackChildView(marketingSnippet);

      return marketingSnippet.render();
    },

    afterRender() {
      if (options.autocreate !== false) {
        return this.createMarketingSnippet();
      }
    },
  };
};

export default MarketingMixin;
