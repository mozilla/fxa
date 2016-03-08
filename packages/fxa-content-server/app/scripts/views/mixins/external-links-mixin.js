/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A View Mixin to convert external links to visible text for
 * environments that cannot open external links.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');

  return {
    afterRender: function () {
      if (this.broker.hasCapability('convertExternalLinksToText')) {
        this.$('a[href^=http]').each(function (index, el) {
          var $el = $(el);
          $el
            .addClass('visible-url')
            .attr('data-visible-url', $el.attr('href'));
        });
      }
    }
  };
});
