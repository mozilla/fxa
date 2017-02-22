/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const CountryTelephoneInfo = require('lib/country-telephone-info');
  const { MARKETING_ID_AUTUMN_2016 } = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const Template = require('stache!templates/sms_sent');

  function formatPhoneNumberForCountry (phoneNumber, country) {
    const countryInfo = CountryTelephoneInfo[country];
    return countryInfo.format(phoneNumber);
  }

  const View = BaseView.extend({
    template: Template,

    beforeRender () {
      if (! this.model.get('phoneNumber') || ! this.model.get('country')) {
        this.navigate('sms');
        return false;
      }
    },

    context () {
      return {
        phoneNumber: formatPhoneNumberForCountry(
          this.model.get('phoneNumber'), this.model.get('country'))
      };
    }
  });

  Cocktail.mixin(
    View,
    MarketingMixin({ marketingId: MARKETING_ID_AUTUMN_2016 })
  );

  module.exports = View;
});
