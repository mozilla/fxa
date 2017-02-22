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
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const FormView = require('views/form');
  const { MARKETING_ID_AUTUMN_2016 } = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const PulseGraphicMixin = require('views/mixins/pulse-graphic-mixin');
  const SmsErrors = require('lib/sms-errors');
  const SmsMessageIds = require('lib/sms-message-ids');
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

      this.model.set('country', 'US');
      this.listenTo(this.model, 'change:country', (model, country) => {
        this._onCountryChange(country);
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

      return {
        country: this.model.get('country'),
        escapedLearnMoreAttributes
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
      const account = this.getAccount();
      const phoneNumber = this._getPhoneNumber();

      return account.sendSms(phoneNumber, SmsMessageIds.FIREFOX_MOBILE_INSTALL)
        .then(() => this._onSendSmsSuccess(phoneNumber))
        .fail((err) => this._onSendSmsError(err));
    },

    /**
     * Get the user entered phone number, with country code
     *
     * @returns {String}
     */
    _getPhoneNumber () {
      const phoneNumber = this.getElementValue(SELECTOR_PHONE_NUMBER);
      const country = this.model.get('country');
      return CountryTelephoneInfo[country].normalize(phoneNumber);
    },

    /**
     * Sending an SMS to `phoneNumber` succeeded
     *
     * @param {String} phoneNumber
     * @private
     */
    _onSendSmsSuccess (phoneNumber) {
      this.navigate('sms/sent', {
        country: this.model.get('country'),
        phoneNumber
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
