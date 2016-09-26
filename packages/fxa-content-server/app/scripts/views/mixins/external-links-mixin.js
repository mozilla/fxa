/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A View Mixin to convert external links to visible text for
 * environments that cannot open external links.
 */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');

  function shouldConvertExternalLinksToText(broker) {
    // not all views have a broker, e.g., the CoppaAgeInput
    // has no need for a broker.
    return broker && broker.hasCapability('convertExternalLinksToText');
  }

  function convertToVisibleLink (el) {
    const $el = $(el);
    const href = $el.attr('href');
    const text = $el.text();

    if (href && href !== text) {
      $el
        .addClass('visible-url')
        .attr('data-visible-url', $el.attr('href'));
    }
  }

  module.exports = {
    afterRender () {
      this.$('a[href^=http]').each(function (index, el) {
        var $el = $(el);
        $el.attr('rel','noopener noreferrer');
      });

      if (shouldConvertExternalLinksToText(this.broker)) {
        this.$('a[href^=http]').each((index, el) => convertToVisibleLink(el));
      }
    }
  };
});
