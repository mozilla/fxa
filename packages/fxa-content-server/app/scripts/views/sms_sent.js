/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BackMixin = require('views/mixins/back-mixin');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const CountryTelephoneInfo = require('lib/country-telephone-info');
  const { FIREFOX_MOBILE_INSTALL } = require('lib/sms-message-ids');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const { MARKETING_ID_AUTUMN_2016 } = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin')({ marketingId: MARKETING_ID_AUTUMN_2016 });
  const ResendMixin = require('views/mixins/resend-mixin')({ successMessage: false });
  const SmsMixin = require('views/mixins/sms-mixin');
  const Template = require('stache!templates/sms_sent');

  const t = msg => msg;

  const UNTRANSLATED_RESENT_MESSAGE = t('App link resent to %(phoneNumber)s');

  const View = BaseView.extend({
    template: Template,
    mustAuth: true,

    beforeRender () {
      if (! this.model.get('normalizedPhoneNumber') || ! this.model.get('country')) {
        this.navigate('sms');
      }
    },

    setInitialContext (context) {
      context.set({
        // The attributes are not surrounded by quotes because _.escape would
        // escape them, causing the id to be the string `"back"`, and the href
        // to be the string `"#"`.
        escapedBackLinkAttrs: _.escape('id=back href=#'),
        escapedPhoneNumber: _.escape(this._getFormattedPhoneNumber())
      });
    },

    resend () {
      const account = this.model.get('account');
      const normalizedPhoneNumber = this.model.get('normalizedPhoneNumber');
      return account.sendSms(normalizedPhoneNumber, FIREFOX_MOBILE_INSTALL, {
        features: this.getSmsFeatures()
      })
      .then(() => {
        this.displaySuccess(this.translate(UNTRANSLATED_RESENT_MESSAGE, {
          phoneNumber: this._getFormattedPhoneNumber()
        }));
      });
    },

    _getFormattedPhoneNumber () {
      const { country, normalizedPhoneNumber } = this.model.toJSON();
      const countryInfo = CountryTelephoneInfo[country];
      return countryInfo.format(normalizedPhoneNumber);
    }
  });

  Cocktail.mixin(
    View,
    BackMixin,
    FlowEventsMixin,
    MarketingMixin,
    ResendMixin,
    SmsMixin
  );

  module.exports = View;
});
