/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to send a Firefox install link
 * to a mobile device via SMS.
 */

import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import CountryTelephoneInfo from '../lib/country-telephone-info';
import SmsMessageIds from '../lib/sms-message-ids';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import HasModalChildViewMixin from './mixins/has-modal-child-view-mixin';
import PairingGraphicsMixin from './mixins/pairing-graphics-mixin';
import { MARKETING_ID_AUTUMN_2016, SYNC_SERVICE } from '../lib/constants';
import MarketingMixin from './mixins/marketing-mixin';
import PulseGraphicMixin from './mixins/pulse-graphic-mixin';
import SmsMixin from './mixins/sms-mixin';
import Template from 'templates/sms_send.mustache';
import VerificationReasonMixin from 'views/mixins/verification-reason-mixin';

const { FIREFOX_MOBILE_INSTALL } = SmsMessageIds;

const SELECTOR_PHONE_NUMBER = 'input[type=tel]';

class SmsSendView extends FormView {
  mustAuth = true;
  template = Template;

  getAccount() {
    // TODO - remove the `|| ...` when done with development
    return this.model.get('account') || this.user.getSignedInAccount();
  }

  setInitialContext(context) {
    const escapedLearnMoreAttributes = `id="learn-more" href="${encodeURI(
      SmsSendView.LEARN_MORE_LINK
    )}" target="_learn-more" data-flow-event="link.learn_more"`;

    let country = this._getCountry();
    if (! CountryTelephoneInfo[country]) {
      // this shouldn't be possible because only the Sync relier imports
      // a country, and it'll only import a list of allowed countries,
      // but defense in depth.
      country = 'US';
    }
    const prefix = CountryTelephoneInfo[country].prefix;
    // phoneNumber comes from formPrefill if the
    // user submits a phone number, sees the incorrect
    // number in the success message on /sms/sent, and
    // clicks "Mistyped number?"
    let phoneNumber = this.formPrefill.get('phoneNumber');
    if (! phoneNumber && prefix !== CountryTelephoneInfo.US.prefix) {
      phoneNumber = prefix;
    }

    const isSignIn = this.isSignIn();
    const graphicId = this.getGraphicsId();

    context.set({
      country,
      escapedLearnMoreAttributes,
      graphicId,
      isSignIn,
      phoneNumber,
      showSuccessMessage: this.model.get('showSuccessMessage'),
    });
  }

  submit() {
    return this._sendSms(
      this._getNormalizedPhoneNumber(),
      FIREFOX_MOBILE_INSTALL
    );
  }

  /**
   * Return the country to use.
   *
   * @returns {String}
   * @private
   */
  _getCountry() {
    // relier takes precedence over the model to allow query parameters
    // to override the auth-server's view of the world. This allows
    // testers and functional tests to force a country even if geo-lookup
    // is enabled on the auth server.
    return this.relier.get('country') || this.model.get('country') || 'US';
  }

  /**
   * Send an SMS with a Firefox Mobile install link to `normalizedPhoneNumber`
   *
   * @param {String} normalizedPhoneNumber normalized target phone number
   * @param {Number} messageId Message ID to send
   * @returns {Promise}
   * @private
   */
  _sendSms(normalizedPhoneNumber, messageId) {
    return this.getAccount()
      .sendSms(normalizedPhoneNumber, messageId, {
        features: this.getSmsFeatures(),
      })
      .then(({ formattedPhoneNumber: serverPhoneNumber }) =>
        this._onSendSmsSuccess(serverPhoneNumber)
      )
      .catch(err => this._onSendSmsError(err));
  }

  /**
   * Format `serverPhoneNumber` for display.
   *
   * @param {String} serverPhoneNumber telephone number returned by server
   * @returns {String}
   */
  _formatServerPhoneNumber(serverPhoneNumber) {
    const country = this._getCountry();
    return CountryTelephoneInfo[country].format(serverPhoneNumber);
  }

  /**
   * Normalized the user entered phone number. Adds country code prefix,
   * removes any extra characters.
   *
   * @returns {String}
   */
  _getNormalizedPhoneNumber() {
    const country = this._getCountry();
    const phoneNumber = this.getElementValue(SELECTOR_PHONE_NUMBER);
    return CountryTelephoneInfo[country].normalize(phoneNumber);
  }

  /**
   * SMS successfully sent
   *
   * @param {String} serverPhoneNumber telephone number returned by server,
   *   does not contain the country code prefix.
   * @private
   */
  _onSendSmsSuccess(serverPhoneNumber) {
    const country = this._getCountry();
    this.navigate('sms/sent', {
      account: this.getAccount(),
      country,
      formattedPhoneNumber: this._formatServerPhoneNumber(serverPhoneNumber),
      normalizedPhoneNumber: this._getNormalizedPhoneNumber(),
    });
  }

  /**
   * Sending an SMS failed with error `err`. Certain
   * errors are handled inline, all others are re-thrown
   * to be handled at a higher level.
   *
   * @param {Error} err
   * @throws {Error}
   * @private
   */
  _onSendSmsError(err) {
    if (AuthErrors.is(err, 'INVALID_PHONE_NUMBER')) {
      this.showValidationError(this.$(SELECTOR_PHONE_NUMBER), err);
      return;
    }
    // all other errors are handled at a higher level.
    throw err;
  }

  static get LEARN_MORE_LINK() {
    return 'https://www.mozilla.org/privacy/websites/#campaigns';
  }
}

Cocktail.mixin(
  SmsSendView,
  FlowEventsMixin,
  FormPrefillMixin,
  HasModalChildViewMixin,
  PairingGraphicsMixin,
  MarketingMixin({
    marketingId: MARKETING_ID_AUTUMN_2016,
    // This screen is only shown to Sync users. The service is always Sync,
    // even if not specified on the URL. This makes manual testing slightly
    // easier where sometimes ?service=sync is forgotten. See #4948.
    service: SYNC_SERVICE,
  }),
  PulseGraphicMixin,
  SmsMixin,
  VerificationReasonMixin
);

export default SmsSendView;
