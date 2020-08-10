/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from 'lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import { check } from '../lib/crypto/totp';
import Cocktail from 'cocktail';
import ErrorRedirectMixin from './mixins/error-redirect-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import preventDefaultThen from './decorators/prevent_default_then';
import ServiceMixin from './mixins/service-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import VerificationReasons from '../lib/verification-reasons';

const CODE_INPUT_SELECTOR = 'input.totp-code';
const TOTP_SUPPORT_URL =
  'https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication';
const t = (msg) => msg;

import Template from 'templates/inline_totp_setup.mustache';

var View = FormView.extend({
  template: Template,
  className: 'inline-totp-setup',
  viewName: 'inline-totp-setup',

  events: {
    'click .totp-continue': preventDefaultThen('_continue'),
    'click .show-code-link': preventDefaultThen('_showCode'),
    'click .hide-code-link': preventDefaultThen('_hideCode'),
    'click .totp-cancel': preventDefaultThen('_cancel'),
  },

  initialize(options) {
    this._account = this.user.initAccount(this.model.get('account'));
    this._totpToken = false;
    this.onSubmitComplete = this.model.get('onSubmitComplete');
    this.model.set('showQRImage', true);
    this.model.set('showIntro', true);
  },

  getTotpToken() {
    if (this._totpToken) {
      return Promise.resolve(this._totpToken);
    }
    const account = this.getSignedInAccount();
    return account.createTotpToken().then((result) => {
      this._totpToken = result;
      this._recoveryCodes = result.recoveryCodes;
      this.model.set('secret', this._getFormattedCode(result.secret));
      return this._totpToken;
    });
  },

  getAccount() {
    return this._account;
  },

  _getMissingSessionTokenScreen() {
    return this.isSignUp() ? 'signup' : 'signin';
  },

  setInitialContext(context) {
    context.set({
      escapedTotpSupportAttributes: _.escape(
        'class=totp-support-link target=_blank href=' + TOTP_SUPPORT_URL
      ),
    });
  },

  beforeRender() {
    const account = this.getAccount();

    if (!account.get('sessionToken')) {
      this.navigate(this._getMissingSessionTokenScreen());
    }

    return account.sessionVerificationStatus().then(({ sessionVerified }) => {
      if (!sessionVerified) {
        return account.verifySessionResendCode().then(() => {
          return this.replaceCurrentPage('/signin_token_code', {
            type: VerificationReasons.SIGN_IN,
            redirectTo: this.window.location.href,
          });
        });
      }

      return account.checkTotpTokenExists().then((result) => {
        if (result.exists && result.verified) {
          return this.onSubmitComplete();
        }

        // pre-generate the TOTP token
        return this.getTotpToken();
      });
    });
  },

  afterRender() {
    return this.renderQRImage();
  },

  _continue() {
    this.model.set('showIntro', false);
    this.render();
  },

  _showCode() {
    this.model.set('showQRImage', false);
    this.rerender();
  },

  _hideCode() {
    this.model.set('showQRImage', true);
    this.rerender();
  },

  _getFormattedCode(code) {
    // Insert spaces every 4 characters
    return code.replace(/(\w{4})/g, '$1 ');
  },

  // If the user cancels out of the flow, redirect back to the RP with
  // an error message that's easy to parse. The user will need to be shown
  // the 2FA-required instructions again.
  _cancel() {
    const err = AuthErrors.toError('TOTP_REQUIRED');
    this.redirectWithErrorCode(err);
  },

  renderQRImage() {
    this.getTotpToken().then((token) => {
      this.$('.qr-image').attr('src', token.qrCodeUrl);
      const qrImageAltText = t(
        'Use the code %(code)s to set up two-step authentication in supported applications.'
      );
      this.$('.qr-image').attr(
        'alt',
        this.translate(qrImageAltText, { code: token.secret })
      );
    });
  },

  submit() {
    const code = this.getElementValue('input.totp-code');
    const secret = this.model.get('secret');

    //preverify code
    return this.checkCode(secret, code).then((ok) => {
      if (!ok) {
        return this.showValidationError(
          this.$(CODE_INPUT_SELECTOR),
          AuthErrors.toError('INVALID_TOTP_CODE')
        );
      }
      this.navigate('/inline_recovery_setup', {
        recoveryCodes: this._recoveryCodes,
        totpSecret: secret,
        onSubmitComplete: this.onSubmitComplete,
      });
    });
  },

  checkCode(secret, code) {
    return check(secret, code);
  },
});

Cocktail.mixin(
  View,
  BackMixin,
  ErrorRedirectMixin,
  FlowEventsMixin,
  ServiceMixin,
  VerificationReasonMixin
);

export default View;
