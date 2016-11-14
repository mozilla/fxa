/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view mixin that takes care of creating the marketing snippet, if needed.
 */

define(function (require, exports, module) {
  'use strict';

  const MarketingSnippet = require('views/marketing_snippet');
  const p = require('lib/promise');

  const MarketingMixin = {
    afterRender () {
      if (! this.broker.hasCapability('emailVerificationMarketingSnippet')) {
        return p();
      }

      const marketingSnippetOpts = {
        el: this.$('.marketing-area'),
        lang: this.lang,
        metrics: this.metrics,
        service: this.relier.get('service'),
        type: this.model.get('type')
      };

      const marketingSnippet = new MarketingSnippet(marketingSnippetOpts);

      this.trackChildView(marketingSnippet);

      return marketingSnippet.render();
    }
  };

  module.exports = MarketingMixin;
});

