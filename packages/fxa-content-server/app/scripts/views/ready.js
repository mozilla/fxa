/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const Constants = require('../lib/constants');
  const ExperimentMixin = require('./mixins/experiment-mixin');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const FormView = require('./form');
  const MarketingMixin = require('./mixins/marketing-mixin');
  const PulseGraphicMixin = require('./mixins/pulse-graphic-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const Template = require('templates/ready.mustache');
  const VerificationReasonMixin = require('./mixins/verification-reason-mixin');

  const t = msg => msg;

  /*eslint-disable camelcase*/

  /**
   * Some template strings are fetched from JS to keep
   * the template marginally cleaner and easier to read.
   */
  const TEMPLATE_INFO = {
    FORCE_AUTH: {
      headerId: 'fxa-force-auth-complete-header',
      headerTitle: t('Welcome back'),
      readyToSyncText: t('Firefox Sync will resume momentarily'),
    },
    PASSWORD_RESET: {
      headerId: 'fxa-reset-password-complete-header',
      headerTitle: t('Password reset'),
      readyToSyncText: t('Complete set-up by entering the new password on your other Firefox devices.')
    },
    PRIMARY_EMAIL_VERIFIED: {
      emailReadyText: t('You are now ready to make changes to your Firefox Account.'),
      headerId: 'fxa-sign-up-complete-header',
      headerTitle: t('Primary email verified')
    },
    SECONDARY_EMAIL_VERIFIED: {
      emailReadyText: t('Account notifications will now also be sent to %(secondaryEmailVerified)s.'),
      headerId: 'fxa-sign-up-complete-header',
      headerTitle: t('Secondary email verified')
    },
    // signin_confirmed and signin_verified are only shown to Sync for now.
    SIGN_IN: {
      headerId: 'fxa-sign-in-complete-header',
      headerTitle: t('Sign-in confirmed'),
      readyToSyncText: t('You are now ready to use %(serviceName)s')
    },
    SIGN_UP: {
      headerId: 'fxa-sign-up-complete-header',
      headerTitle: t('Account verified'),
      readyToSyncText: t('You are now ready to use %(serviceName)s')
    }
  };

  /*eslint-enable camelcase*/

  const View = FormView.extend({
    template: Template,
    className: 'ready',

    initialize (options = {}) {
      this._templateInfo = TEMPLATE_INFO[this.keyOfVerificationReason(options.type)];
    },

    setInitialContext (context) {
      context.set({
        emailVerified: this.getSearchParam('secondary_email_verified') || this.getSearchParam('primary_email_verified'),
        escapedEmailReadyText: this._getEscapedEmailReadyText(),
        escapedHeaderTitle: this._getEscapedHeaderTitle(),
        escapedReadyToSyncText: this._getEscapedReadyToSyncText(),
        headerId: this._getHeaderId(),
        isSync: this.relier.isSync(),
        redirectUri: this.relier.get('redirectUri'),
        secondaryEmailVerified: this.getSearchParam('secondary_email_verified') || null
      });
    },

    _getHeaderId () {
      return this._templateInfo.headerId;
    },

    /**
     * Get the HTML escaped header title
     *
     * @returns {String}
     */
    _getEscapedHeaderTitle () {
      const title = this._templateInfo.headerTitle;
      // translateInTemplate HTML escapes
      return this.translateInTemplate(title);
    },

    /**
     * Get the HTML escaped "Ready to Sync" text
     *
     * @returns {String}
     */
    _getEscapedReadyToSyncText () {
      const readyToSyncText = this._templateInfo.readyToSyncText;
      // translateInTemplate HTML escapes
      return this.translateInTemplate(readyToSyncText);
    },

    /**
     * Get the HTML escaped "Email Ready" text.
     *
     * @returns {String}
     */
    _getEscapedEmailReadyText () {
      const emailReadyText = this._templateInfo.emailReadyText;
      // translateInTemplate HTML escapes
      return this.translateInTemplate(emailReadyText);
    }
  });

  Cocktail.mixin(
    View,
    ExperimentMixin,
    FlowEventsMixin,
    MarketingMixin({ marketingId: Constants.MARKETING_ID_SPRING_2015 }),
    PulseGraphicMixin,
    ServiceMixin,
    VerificationReasonMixin
  );

  module.exports = View;
});
