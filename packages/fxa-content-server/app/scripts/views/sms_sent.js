/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
import _ from 'underscore';
import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import SmsMessageIds from '../lib/sms-message-ids';
import FlowEventsMixin from './mixins/flow-events-mixin';
import HasModalChildViewMixin from './mixins/has-modal-child-view-mixin';
import { MARKETING_ID_AUTUMN_2016, SYNC_SERVICE } from '../lib/constants';
import PairingGraphicsMixin from './mixins/pairing-graphics-mixin';
import MarketingMixin from './mixins/marketing-mixin';
import ResendMixin from './mixins/resend-mixin';
import SmsMixin from './mixins/sms-mixin';
import Template from 'templates/sms_sent.mustache';

const { FIREFOX_MOBILE_INSTALL } = SmsMessageIds;

function arePrereqsMet(model) {
  return (
    model.has('normalizedPhoneNumber') && model.has('formattedPhoneNumber')
  );
}

class SmsSentView extends BaseView {
  template = Template;
  mustAuth = true;

  beforeRender() {
    if (!arePrereqsMet(this.model)) {
      this.navigate('sms');
    }
  }

  setInitialContext(context) {
    const graphicId = this.getGraphicsId();

    context.set({
      // The attributes are not surrounded by quotes because _.escape would
      // escape them, causing the id to be the string `"back"`, and the href
      // to be the string `"#"`.
      escapedBackLinkAttrs: _.escape('id=back href=#'),
      escapedPhoneNumber: _.escape(this.model.get('formattedPhoneNumber')),
      graphicId,
      isResend: this.model.get('isResend'),
    });
  }

  resend() {
    const account = this.model.get('account');
    const normalizedPhoneNumber = this.model.get('normalizedPhoneNumber');
    return account
      .sendSms(normalizedPhoneNumber, FIREFOX_MOBILE_INSTALL, {
        features: this.getSmsFeatures(),
      })
      .then(() => {
        this.model.set('isResend', true);
        return this.render();
      });
  }
}

Cocktail.mixin(
  SmsSentView,
  BackMixin,
  FlowEventsMixin,
  HasModalChildViewMixin,
  PairingGraphicsMixin,
  MarketingMixin({
    marketingId: MARKETING_ID_AUTUMN_2016,
    // This screen is only shown to Sync users. The service is always Sync,
    // even if not specified on the URL. This makes manual testing slightly
    // easier where sometimes ?service=sync is forgotten. See #4948.
    service: SYNC_SERVICE,
  }),
  ResendMixin({ successMessage: false }),
  SmsMixin
);

export default SmsSentView;
