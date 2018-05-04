/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AvatarMixin = require('../mixins/avatar-mixin');
const AuthErrors = require('lib/auth-errors');
const BaseView = require('../base');
const Cocktail = require('cocktail');
const FloatingPlaceholderMixin = require('../mixins/floating-placeholder-mixin');
const FormView = require('../form');
const SettingsPanelMixin = require('../mixins/settings-panel-mixin');
const UpgradeSessionMixin = require('../mixins/upgrade-session-mixin');
const Template = require('templates/settings/two_step_authentication.mustache');
const preventDefaultThen = require('../base').preventDefaultThen;
const showProgressIndicator = require('../decorators/progress_indicator');
const TotpExperimentMixin = require('../mixins/totp-experiment-mixin');

var t = BaseView.t;

const CODE_INPUT_SELECTOR = 'input.totp-code';
const CODE_REFRESH_SELECTOR = 'button.settings-button.totp-refresh';
const CODE_REFRESH_DELAY_MS = 350;
const TOTP_SUPPORT_URL = 'https://support.mozilla.org/en-US/kb/secure-firefox-account-two-step-authentication';

const View = FormView.extend({
  template: Template,
  className: 'two-step-authentication',
  viewName: 'settings.two-step-authentication',

  events: {
    'click .replace-codes-link': preventDefaultThen('_replaceRecoveryCodes'),
    'click .show-code-link': preventDefaultThen('_showCode'),
    'click .totp-cancel': preventDefaultThen('cancel'),
    'click .totp-create': preventDefaultThen('createToken'),
    'click .totp-delete': preventDefaultThen('deleteToken'),
    'click .totp-refresh': preventDefaultThen('refresh')
  },

  _checkTokenExists() {
    const account = this.getSignedInAccount();
    return account.checkTotpTokenExists()
      .then((result) => {
        this._hasToken = result.exists;
      });
  },

  _showQrCode() {
    this.$('#totp').removeClass('hidden');
  },

  _hideStatus() {
    this.$('.totp-list').addClass('hidden');
  },

  _showCode() {
    this.$('.manual-code').removeClass('hidden');
    this.$('.show-code-link').addClass('hidden');
  },

  _getFormattedCode(code) {
    // Insert spaces every 4 characters
    return code.replace(/(\w{4})/g, '$1 ');
  },

  _isPanelEnabled() {
    if (this.broker.hasCapability('showTwoStepAuthentication')) {
      return true;
    }

    if (this.isInTotpExperiment()) {
      return true;
    }

    return false;
  },

  _showRecoveryCodes(recoveryCodes) {
    this.model.set('recoveryCodes', recoveryCodes);
    this.navigate('/settings/two_step_authentication/recovery_codes', {recoveryCodes});
  },

  _replaceRecoveryCodes() {
    const account = this.getSignedInAccount();
    return account.replaceRecoveryCodes()
      .then((result) => {
        this._showRecoveryCodes(result.recoveryCodes);
      });
  },

  beforeRender() {
    // This panel is currently behind a feature flag. Only show it
    // when the query param `showTwoStepAuthentication` is specified.
    if ( ! this._isPanelEnabled()) {
      return this.remove();
    } else {
      return this.setupSessionGateIfRequired()
        .then((isEnabled) => {
          if (isEnabled) {
            return this._checkTokenExists();
          }
        });
    }
  },

  initialize() {
    this._hasToken = false;
    this._statusVisible = true;
  },

  setInitialContext(context) {
    context.set({
      hasToken: this._hasToken,
      isPanelOpen: this.isPanelOpen(),
      statusVisible: this._statusVisible,
      totpSupportAttributes: 'class="totp-support-link" target="_blank" href="' + TOTP_SUPPORT_URL + '"'
    });
  },

  cancel() {
    return this.render()
      .then(() => this.navigate('/settings'));
  },

  createToken() {
    const account = this.getSignedInAccount();
    return account.createTotpToken()
      .then(result => {
        this.$('.qr-image').attr('src', result.qrCodeUrl);
        this.$('.code').html(this._getFormattedCode(result.secret));
        this._showQrCode();
        this._hideStatus();
      });
  },

  deleteToken() {
    const account = this.getSignedInAccount();
    return account.deleteTotpToken()
      .then(() => {
        this.displaySuccess(t('Two-step authentication removed'), {
          closePanel: true
        });
        return this.render();
      })
      .then(() => this.navigate('/settings'));
  },

  submit() {
    const account = this.getSignedInAccount();
    const code = this.getElementValue('input.totp-code');

    return account.verifyTotpCode(code, this.relier.get('service'))
      .then((result) => {
        if (result.success) {
          this.displaySuccess(t('Two-step authentication enabled'), {});
          this._showRecoveryCodes(result.recoveryCodes);
          this.render();
        } else {
          throw AuthErrors.toError('INVALID_TOTP_CODE');
        }
      })
      .catch((err) => {
        // For invalid code param, display invalid TOTP code error
        if (AuthErrors.is(err, 'INVALID_PARAMETER')) {
          err = AuthErrors.toError('INVALID_TOTP_CODE');
        }
        return this.showValidationError(this.$(CODE_INPUT_SELECTOR), err);
      });
  },

  refresh: showProgressIndicator(function () {
    return this.render();
  }, CODE_REFRESH_SELECTOR, CODE_REFRESH_DELAY_MS),

});

Cocktail.mixin(
  View,
  UpgradeSessionMixin({
    gatedHref: 'settings/two_step_authentication',
    title: t('Two-step Authentication')
  }),
  AvatarMixin,
  SettingsPanelMixin,
  FloatingPlaceholderMixin,
  TotpExperimentMixin
);

module.exports = View;
