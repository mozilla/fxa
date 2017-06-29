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
  const CountryTelephoneInfo = require('lib/country-telephone-info');
  const { FIREFOX_MOBILE_INSTALL } = require('lib/sms-message-ids');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const FormView = require('views/form');
  const { MARKETING_ID_AUTUMN_2016, SYNC_SERVICE } = require('lib/constants');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const PulseGraphicMixin = require('views/mixins/pulse-graphic-mixin');
  const SELECTOR_PHONE_NUMBER = 'input[type=tel]';
  const SmsErrors = require('lib/sms-errors');
  const SmsMixin = require('views/mixins/sms-mixin');
  const Template = require('stache!templates/sms_send');

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    mustAuth: true,

    initialize (options) {
      proto.initialize.call(this, options);

      this._createView = options.createView;
      this._formPrefill = options.formPrefill;
    },

    beforeDestroy() {
      // Save phoneNumber to formPrefill in case the user
      // enters an incorrect phone number and then returns.
      // save the number as the user entered it, if they come back
      // to this screen it will display as they entered it.
      this._formPrefill.set('phoneNumber', this.$(SELECTOR_PHONE_NUMBER).__val());
    },

    getAccount () {
      // TODO - remove the `|| ...` when done with development
      return this.model.get('account') || this.user.getSignedInAccount();
    },

    setInitialContext (context) {
      const escapedLearnMoreAttributes =
          `id="learn-more" href="${encodeURI(View.LEARN_MORE_LINK)}" target="_learn-more" data-flow-event="link.learn_more"`;

      // phoneNumber comes from formPrefill if the
      // user submits a phone number, sees the incorrect
      // number in the success message on /sms/sent, and
      // clicks "Mistyped number?"
      let phoneNumber = this._formPrefill.get('phoneNumber');
      let country = this._getCountry();
      if (! CountryTelephoneInfo[country]) {
        // this shouldn't be possible because only the Sync relier imports
        // a country, and it'll only import a list of allowed countries,
        // but defense in depth.
        country = 'US';
      }
      const prefix = CountryTelephoneInfo[country].prefix;
      if (! phoneNumber && prefix !== CountryTelephoneInfo.US.prefix) {
        phoneNumber = prefix;
      }

      context.set({
        country,
        escapedLearnMoreAttributes,
        phoneNumber
      });
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
     * Return the country to use.
     *
     * @returns {String}
     * @private
     */
    _getCountry () {
      // relier takes precedence over the model to allow query parameters
      // to override the auth-server's view of the world. This allows
      // testers and functional tests to force a country even if geo-lookup
      // is enabled on the auth server.
      return this.relier.get('country') || this.model.get('country') || 'US';
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
      return this.getAccount().sendSms(normalizedPhoneNumber, messageId, {
        features: this.getSmsFeatures()
      })
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
      const country = this._getCountry();
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
        country: this._getCountry(),
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
    MarketingMixin({
      marketingId: MARKETING_ID_AUTUMN_2016,
      // This screen is only shown to Sync users. The service is always Sync,
      // even if not specified on the URL. This makes manual testing slightly
      // easier where sometimes ?service=sync is forgotten. See #4948.
      service: SYNC_SERVICE
    }),
    PulseGraphicMixin,
    SmsMixin
  );

  module.exports = View;
});
