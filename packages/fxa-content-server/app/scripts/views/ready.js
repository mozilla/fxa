/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

import _ from 'underscore';
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import ExperimentMixin from './mixins/experiment-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import MarketingMixin from './mixins/marketing-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import PulseGraphicMixin from './mixins/pulse-graphic-mixin';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/ready.mustache';
import VerificationReasonMixin from './mixins/verification-reason-mixin';

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
    headerTitle: t('Your password has been reset'),
    readyToSyncText: t(
      'Complete set-up by entering the new password on your other Firefox devices.'
    ),
  },
  PASSWORD_RESET_WITH_RECOVERY_KEY: {
    headerId: 'fxa-reset-password-complete-header',
    headerTitle: t('Your password has been reset'),
    readyToSyncText: t(
      'Complete set-up by entering the new password on your other Firefox devices.'
    ),
  },
  PRIMARY_EMAIL_VERIFIED: {
    emailReadyText: t(
      'You are now ready to make changes to your Firefox Account.'
    ),
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: t('Primary email verified'),
  },
  SECONDARY_EMAIL_VERIFIED: {
    emailReadyText: t(
      'Account notifications will now also be sent to %(secondaryEmailVerified)s.'
    ),
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: t('Secondary email verified'),
  },
  // signin_confirmed and signin_verified are only shown to Sync for now.
  SIGN_IN: {
    headerId: 'fxa-sign-in-complete-header',
    headerTitle: t('Sign-in confirmed'),
    readyToSyncText: t('You are now ready to use %(serviceName)s'),
  },
  SIGN_UP: {
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: t('Account verified'),
    readyToSyncText: t('You are now ready to use %(serviceName)s'),
  },
  SUCCESSFUL_OAUTH: {
    headerId: 'fxa-oauth-success-header',
    headerTitle: t('Connected'),
    readyToSyncText: t('You are now ready to use %(serviceName)s'),
  },
};

const FXA_PRODUCT_PAGE_URL = 'https://www.mozilla.org/firefox/accounts';

/*eslint-enable camelcase*/
const View = FormView.extend({
  template: Template,
  className: 'ready',

  events: _.extend({}, FormView.prototype.events, {
    'click .btn-continue': preventDefaultThen('continue'),
    'click .btn-create-recovery-key': preventDefaultThen('createRecoveryKey'),
    'click .btn-goto-account': preventDefaultThen('gotoSettings'),
    'click .btn-start-browsing': preventDefaultThen('gotoProductPage'),
  }),

  initialize(options = {}) {
    this._templateInfo =
      TEMPLATE_INFO[this.keyOfVerificationReason(options.type)];
    this.type = options.type;
  },

  setInitialContext(context) {
    context.set({
      emailVerified:
        this.getSearchParam('secondary_email_verified') ||
        this.getSearchParam('primary_email_verified'),
      escapedEmailReadyText: this._getEscapedEmailReadyText(),
      isFromRelyingParty:
        this.relier.pick('serviceName').serviceName !==
        Constants.RELIER_DEFAULT_SERVICE_NAME,
      escapedHeaderTitle: this._getEscapedHeaderTitle(),
      escapedReadyToSyncText: this._getEscapedReadyToSyncText(),
      headerId: this._getHeaderId(),
      isPasswordReset: this.isPasswordReset(),
      isSync: this.relier.isSync(),
      secondaryEmailVerified:
        this.getSearchParam('secondary_email_verified') || null,
      showContinueButton: !!this.model.get('continueBrokerMethod'),
    });
  },

  continue() {
    return Promise.resolve()
      .then(() => {
        const { account, continueBrokerMethod } = this.model.toJSON();
        if (continueBrokerMethod && account) {
          return this.invokeBrokerMethod(continueBrokerMethod, account);
        }
      })
      .catch(err => this.displayError(err));
  },

  createRecoveryKey() {
    this.navigate('settings/account_recovery/confirm_password');
  },

  gotoProductPage() {
    this.navigateAway(FXA_PRODUCT_PAGE_URL);
  },

  gotoSettings() {
    this.navigate('settings');
  },

  isPasswordReset() {
    return this.type === 'reset_password_with_recovery_key';
  },

  _getHeaderId() {
    return this._templateInfo.headerId;
  },

  /**
   * Get the HTML escaped header title
   *
   * @returns {String}
   */
  _getEscapedHeaderTitle() {
    const title = this._templateInfo.headerTitle;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(title);
  },

  /**
   * Get the HTML escaped "Ready to Sync" text
   *
   * @returns {String}
   */
  _getEscapedReadyToSyncText() {
    const readyToSyncText = this._templateInfo.readyToSyncText;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(readyToSyncText);
  },

  /**
   * Get the HTML escaped "Email Ready" text.
   *
   * @returns {String}
   */
  _getEscapedEmailReadyText() {
    const emailReadyText = this._templateInfo.emailReadyText;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(emailReadyText);
  },
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

export default View;
