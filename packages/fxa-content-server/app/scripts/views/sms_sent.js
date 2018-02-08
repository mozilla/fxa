/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BackMixin = require('./mixins/back-mixin');
  const BaseView = require('./base');
  const Cocktail = require('cocktail');
  const { FIREFOX_MOBILE_INSTALL } = require('../lib/sms-message-ids');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const { MARKETING_ID_AUTUMN_2016 } = require('../lib/constants');
  const MarketingMixin = require('./mixins/marketing-mixin')({ marketingId: MARKETING_ID_AUTUMN_2016 });
  const ResendMixin = require('./mixins/resend-mixin')({ successMessage: false });
  const SmsMixin = require('./mixins/sms-mixin');
  const Template = require('templates/sms_sent.mustache');

  function arePrereqsMet (model) {
    return model.has('normalizedPhoneNumber') &&
           model.has('formattedPhoneNumber');
  }

  const View = BaseView.extend({
    template: Template,
    mustAuth: true,

    beforeRender () {
      if (! arePrereqsMet(this.model)) {
        this.navigate('sms');
      }
    },

    setInitialContext (context) {
      context.set({
        // The attributes are not surrounded by quotes because _.escape would
        // escape them, causing the id to be the string `"back"`, and the href
        // to be the string `"#"`.
        escapedBackLinkAttrs: _.escape('id=back href=#'),
        escapedPhoneNumber: _.escape(this.model.get('formattedPhoneNumber')),
        isResend: this.model.get('isResend')
      });
    },

    resend () {
      const account = this.model.get('account');
      const normalizedPhoneNumber = this.model.get('normalizedPhoneNumber');
      return account.sendSms(normalizedPhoneNumber, FIREFOX_MOBILE_INSTALL, {
        features: this.getSmsFeatures()
      }).then(() => {
        this.model.set('isResend', true);
        return this.render();
      });
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
