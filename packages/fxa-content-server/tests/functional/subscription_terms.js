/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const PAGE_URL = intern._config.fxaContentRoot + 'legal/subscription_terms';
const LEGAL_URL = intern._config.fxaContentRoot + 'legal';
const subplatTosLinkSelector = '.links > a:nth-child(3)';
const backButtonSelector = '#fxa-subscription-terms-back';
const legalHeaderSelector = '#fxa-legal-header';

const { click, noSuchElement, openPage } = FunctionalHelpers;

/**
 * Since the new page is not linked from anywhere at the time of writing, we
 * cannot test its back button.
 */

registerSuite('subscription platform terms of service', {
  beforeEach: function() {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'start at /legal': function() {
      this.skip();
      return this.remote
        .then(openPage(LEGAL_URL, legalHeaderSelector))
        .then(click(subplatTosLinkSelector, backButtonSelector))
        .then(click(backButtonSelector, legalHeaderSelector))
        .end();
    },

    'browse directly to page - no back button': function() {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-subscription-terms-header'))
        .then(noSuchElement(backButtonSelector))
        .end();
    },

    'refresh, back button is available': function() {
      this.skip();
      return this.remote
        .then(openPage(LEGAL_URL, legalHeaderSelector))
        .then(click(subplatTosLinkSelector, backButtonSelector))
        .end()
        .refresh()
        .then(click(backButtonSelector, '#fxa-legal-header'))
        .end();
    },
  },
});
