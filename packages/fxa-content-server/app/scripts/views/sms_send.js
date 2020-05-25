/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to send a Firefox install link
 * to a mobile device via SMS.
 */

import { assign } from 'underscore';
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
import AttachedClients from '../models/attached-clients';
import SmsMixin from './mixins/sms-mixin';
import Template from 'templates/sms_send.mustache';
import VerificationReasonMixin from 'views/mixins/verification-reason-mixin';
import ExperimentMixin from './mixins/experiment-mixin';

const { FIREFOX_MOBILE_INSTALL } = SmsMessageIds;

const SELECTOR_PHONE_NUMBER = 'input[type=tel]';

class SmsSendView extends FormView {
  mustAuth = true;
  template = Template;

  initialize(options) {
    this.events = assign(this.events, {
      'input .phone-number': '_validatePhoneNumber',
    });

    this._attachedClients = options.attachedClients;
    if (!this._attachedClients) {
      this._attachedClients = new AttachedClients([], {
        notifier: options.notifier,
      });
    }
    this._userHasAttachedMobileDevice = false;
  }

  afterRender() {
    // Make this a jQuery object so we can use the validation helpers
    this.phoneField = this.el.querySelector('.phone-number');
    this.$phoneField = this.$(this.phoneField);
    this.submitButton = this.el.querySelector('.sms-send');

    // It is possible to land on this page with the phone number field
    // pre-filled, so let's validate on page load as well if that's the case.
    if (this.formPrefill.get('phoneNumber')) {
      this._validatePhoneNumber();
    }
  }

  getAccount() {
    return this.model.get('account') || this.user.getSignedInAccount();
  }

  _validatePhoneNumber() {
    try {
      // `disableValidation` is an arbitrary property so we
      // can disable this validation for testing purposes.
      // See: tests/functional/send_sms.js
      if (!this.phoneField.disableValidation) {
        this.$phoneField.validate();
      }

      // We want the disabled style of secondary-button (grey),
      // but the active state of primary-button (blue).
      this.submitButton.classList.add('primary-button');
      this.submitButton.classList.remove('secondary-button');
      this.submitButton.disabled = false;
    } catch (e) {
      this.submitButton.classList.add('secondary-button');
      this.submitButton.classList.remove('primary-button');
      this.submitButton.disabled = true;
    }
  }

  setInitialContext(context) {
    const escapedLearnMoreAttributes = `id="learn-more" href="${encodeURI(
      SmsSendView.LEARN_MORE_LINK
    )}" target="_learn-more" data-flow-event="link.learn_more"`;

    let country = this._getCountry();
    if (!CountryTelephoneInfo[country]) {
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
    if (!phoneNumber && prefix !== CountryTelephoneInfo.US.prefix) {
      phoneNumber = prefix;
    }

    const isSignIn = this.isSignIn();
    const graphicId = this.getGraphicsId();

    context.set({
      userHasAttachedMobileDevice: this._userHasAttachedMobileDevice,
      isSignedIn: this._isSignedIn(),
      country,
      escapedLearnMoreAttributes,
      graphicId,
      isSignIn,
      phoneNumber,
      showSuccessMessage: this.model.get('showSuccessMessage'),
    });
  }

  beforeRender() {
    return this._fetchAttachedClients()
      .then(() => {
        this._userHasAttachedMobileDevice = this._attachedClients
          .toJSON()
          .some((client) => client.deviceType === 'mobile');
      })
      .catch((err) => {
        this.model.set('error', err);
        this.logError(err);
      });
  }

  submit() {
    return this._sendSms(
      this._getNormalizedPhoneNumber(),
      FIREFOX_MOBILE_INSTALL
    );
  }

  /**
   * Check if the current user is already signed in.
   *
   * @returns {Boolean}
   * @private
   */
  _isSignedIn() {
    // If a user verifies at CWTS, the browser will not have yet received
    // the fxaccounts:login message, and the fxaccounts:fxa_status request on
    // startup will return `signedInUser: null`, resulting in us believing no
    // user is signed in. Users that aren't signed in are asked to sign in.
    // Whoops.
    // Fortunately, we can guess that the user *will* be signed in
    // if we know the user is verifying in the same browser. Some data
    // is written in CWTS to let us know the user is verifying in the same
    // browser. If this is the case, assume the user is signed in.
    // See #5554
    return (
      this.user.isSignedInAccount(this.getAccount()) ||
      this.broker.get('isVerificationSameBrowser')
    );
  }

  _fetchAttachedClients() {
    const start = Date.now();
    return this._attachedClients.fetchClients(this.user).then(() => {
      this.logFlowEvent(`timing.clients.fetch.${Date.now() - start}`);
    });
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
      .catch((err) => this._onSendSmsError(err));
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
  VerificationReasonMixin,
  ExperimentMixin
);

export default SmsSendView;
