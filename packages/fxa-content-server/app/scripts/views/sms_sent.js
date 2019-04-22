/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
'use strict';

import _ from 'underscore';
import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import SmsMessageIds from '../lib/sms-message-ids';
import FlowEventsMixin from './mixins/flow-events-mixin';
import { MARKETING_ID_AUTUMN_2016 } from '../lib/constants';
import PairingGraphicsMixin from './mixins/pairing-graphics-mixin';
import MarketingMixin from './mixins/marketing-mixin';
import ResendMixin from './mixins/resend-mixin';
import SmsMixin from './mixins/sms-mixin';
import Template from 'templates/sms_sent.mustache';

const { FIREFOX_MOBILE_INSTALL } = SmsMessageIds;

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
    const graphicId = this.getGraphicsId();

    context.set({
      // The attributes are not surrounded by quotes because _.escape would
      // escape them, causing the id to be the string `"back"`, and the href
      // to be the string `"#"`.
      escapedBackLinkAttrs: _.escape('id=back href=#'),
      escapedPhoneNumber: _.escape(this.model.get('formattedPhoneNumber')),
      graphicId,
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
  PairingGraphicsMixin,
  MarketingMixin({ marketingId: MARKETING_ID_AUTUMN_2016 }),
  ResendMixin({ successMessage: false }),
  SmsMixin
);

export default View;
