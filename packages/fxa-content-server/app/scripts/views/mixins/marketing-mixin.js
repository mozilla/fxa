/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view mixin that takes care of logging marketing impressions
 * and clicks.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');

  var MarketingMixin = {
    events: {
      'click .marketing-link': '_onMarketingClick'
    },

    afterRender: function () {
      var self = this;
      self.$('.marketing-link').each(function (index, element) {
        element = $(element);

        // all links must open in a new tab or else their clicks
        // are not logged.
        if (! element.attr('target')) {
          element.attr('target', '_blank');
        }

        var id = element.attr('data-marketing-id');
        var url = element.attr('href');

        self.metrics.logMarketingImpression(id, url);
      });
    },

    _onMarketingClick: function (event) {
      var element = $(event.currentTarget);
      this._logMarketingClick(element);
    },

    _logMarketingClick: function (element) {
      var id = element.attr('data-marketing-id');
      var url = element.attr('href');

      this.metrics.logMarketingClick(id, url);
    }
  };

  module.exports = MarketingMixin;
});

