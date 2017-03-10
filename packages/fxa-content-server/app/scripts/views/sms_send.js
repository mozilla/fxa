/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to send a Firefox install link
 * to a mobile device via SMS.
 */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const Cocktail = require('cocktail');
  const { FIREFOX_MOBILE_INSTALL } = require('lib/sms-message-ids');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const FormView = require('views/form');
  const { MARKETING_ID_AUTUMN_2016 } = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const PulseGraphicMixin = require('views/mixins/pulse-graphic-mixin');
  const SmsErrors = require('lib/sms-errors');
  const CountryTelephoneInfo = require('lib/country-telephone-info');
  const Template = require('stache!templates/sms_send');

  const SELECTOR_PHONE_NUMBER = 'input[type=tel]';

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    mustAuth: true,

    initialize (options) {
      proto.initialize.call(this, options);

      this._createView = options.createView;
      this._formPrefill = options.formPrefill;

      // phoneNumber/country come from formPrefill if the
      // user submits a phone number, sees the incorrect
      // number in the success message on /sms/sent, and
      // clicks "Mistyped number?"
      this.model.set({
        country: this._formPrefill.get('country') || 'US',
        phoneNumber: this._formPrefill.get('phoneNumber')
      });

      this.listenTo(this.model, 'change:country', (model, country) => {
        this._onCountryChange(country);
      });
    },

    beforeDestroy() {
      // Save phoneNumber/country to formPrefill in case
      // the user enters an incorrect phone number and
      // the user comes back.
      this._formPrefill.set({
        country: this.model.get('country'),
        // save the number as the user entered it, if they come back
        // to this screen it will display as they entered it.
        phoneNumber: this.$(SELECTOR_PHONE_NUMBER).__val()
      });
    },

    events: {
      'click .success': '_onSuccessClick'
    },

    _successClickCount: 0,
    _onSuccessClick () {
      this._successClickCount++;
      if (this._successClickCount === 4) {
        // Convert to GB mode for testing.
        this.model.set('country', 'GB');
      }
    },

    /**
     * The country has changed. `country` is the key to an
     * object in the CountryTelephoneInfo module.
     *
     * @param {String} country
     */
    _onCountryChange (country) {
      const countryInfo = CountryTelephoneInfo[country];
      this.$(SELECTOR_PHONE_NUMBER).data('country', country).val(countryInfo.prefix);
    },

    getAccount () {
      // TODO - remove the `|| ...` when done with development
      return this.model.get('account') || this.user.getSignedInAccount();
    },

    context () {
      const escapedLearnMoreAttributes =
          `id="learn-more" href="${encodeURI(View.LEARN_MORE_LINK)}" target="_learn-more" data-flow-event="link.learn_more"`;
      const { country, phoneNumber } = this.model.toJSON();

      return {
        country,
        escapedLearnMoreAttributes,
        phoneNumber
      };
    },

    showChildView (ChildView, options = {}) {
      // TODO remove the duplication between here and connect_another_device

      // an extra element is needed to attach the child view to, the extra element
      // is removed from the DOM when the view is destroyed. Without it, .child-view
      // is removed from the DOM and a 2nd child view cannot be displayed.
      this.$('.child-view').append('<div>');
      options.el = this.$('.child-view > div');
      const childView = this._createView(ChildView, options);
      return childView.render()
        .then(() => this.trackChildView(childView));
    },

    submit () {
      return this._sendSms(this._getNormalizedPhoneNumber(), FIREFOX_MOBILE_INSTALL);
    },

    /**
     * Send an SMS with a Firefox Mobile install link to `normalizedPhoneNumber`
     *
     * @param {String} normalizedPhoneNumber normalized target phone number
     * @param {Number} messageId Message ID to send
     * @returns {Promise}
     * @private
     */
    _sendSms (normalizedPhoneNumber, messageId) {
      return this.getAccount().sendSms(normalizedPhoneNumber, messageId)
        .then(() => this._onSendSmsSuccess())
        .fail((err) => this._onSendSmsError(err));
    },

    /**
     * Normalized the user entered phone number. Adds country code prefix,
     * removes any extra characters.
     *
     * @returns {String}
     */
    _getNormalizedPhoneNumber () {
      const country = this.model.get('country');
      const phoneNumber = this.getElementValue(SELECTOR_PHONE_NUMBER);
      return CountryTelephoneInfo[country].normalize(phoneNumber);
    },

    /**
     * SMS successfully sent
     *
     * @private
     */
    _onSendSmsSuccess () {
      this.navigate('sms/sent', {
        account: this.getAccount(),
        country: this.model.get('country'),
        normalizedPhoneNumber: this._getNormalizedPhoneNumber()
      });
    },

    /**
     * Sending an SMS failed with error `err`. Certain
     * errors are handled inline, all others are re-thrown
     * to be handled at a higher level.
     *
     * @param {Error} err
     * @throws {Error}
     * @private
     */
    _onSendSmsError (err) {
      if (AuthErrors.is(err, 'INVALID_PHONE_NUMBER') || // auth-server validation
          SmsErrors.is(err, 'INVALID_PHONE_NUMBER') || // nexmo validation
          SmsErrors.is(err, 'UNROUTABLE_MESSAGE') ||
          SmsErrors.is(err, 'NUMBER_BLOCKED')) {
        this.showValidationError(this.$(SELECTOR_PHONE_NUMBER), err);
        return;
      }
      // all other errors are handled at a higher level.
      throw err;
    }
  }, {
    LEARN_MORE_LINK: 'https://www.mozilla.org/en-US/privacy/websites/#campaigns'
  });

  Cocktail.mixin(
    View,
    FlowEventsMixin,
    MarketingMixin({ marketingId: MARKETING_ID_AUTUMN_2016 }),
    PulseGraphicMixin
  );

  module.exports = View;
});
