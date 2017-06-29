/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Email = require('models/email');
  const FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  const FormView = require('views/form');
  const preventDefaultThen = require('views/base').preventDefaultThen;
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const showProgressIndicator = require('views/decorators/progress_indicator');
  const Template = require('stache!templates/settings/emails');

  var t = BaseView.t;

  const EMAIL_INPUT_SELECTOR = 'input.new-email';
  const EMAIL_REFRESH_SELECTOR = 'button.settings-button.email-refresh';
  const EMAIL_REFRESH_DELAYMS = 350;

  const EMAIL_ENABLED_REGEX = /.+@mozilla\.com$|.+@restmail\.net$|.+@softvisioninc\.eu$|.+@softvision\.(com|ro)$/;

  var View = FormView.extend({
    template: Template,
    className: 'emails',
    viewName: 'settings.emails',

    events: {
      'click .email-disconnect': preventDefaultThen('_onDisconnectEmail'),
      'click .email-refresh.enabled': preventDefaultThen('refresh'),
      'click .resend': preventDefaultThen('resend')
    },

    initialize (options) {
      if (options.emails) {
        this._emails = options.emails;
      } else {
        this._emails = [];
      }
    },

    setInitialContext (context) {
      context.set({
        buttonClass: this._hasSecondaryEmail() ? 'secondary' : 'primary',
        emails: this._emails,
        hasSecondaryEmail: this._hasSecondaryEmail(),
        hasSecondaryVerifiedEmail: this._hasSecondaryVerifiedEmail(),
        isPanelOpen: this.isPanelOpen(),
        newEmail: this.newEmail
      });
    },

    beforeRender () {
      // Only show this view on verified session
      return this._isSecondaryEmailEnabled();
    },

    afterRender () {
      // Panel should remain open if there are any unverified secondary emails
      if (this._hasSecondaryEmail() && ! this._hasSecondaryVerifiedEmail()) {
        this.openPanel();
      }
    },

    _isSecondaryEmailEnabled () {
      // Only show secondary email panel if the user is in a verified session and feature is enabled.
      const account = this.getSignedInAccount();

      // This matches the enable feature flag for secondary emails, on the auth-server
      // https://github.com/mozilla/fxa-auth-server/blob/master/config/index.js#L762
      // By adding the check here, we do not have to issue a request to the auth-server and risk
      // getting a 502/502 response. While this solution works, a longer term fix
      // should be in place for handling feature rollouts.
      if (! EMAIL_ENABLED_REGEX.test(account.get('email'))) {
        return this.remove();
      }

      return account.sessionVerificationStatus()
        .then((res) => {
          if (! res.sessionVerified) {
            return this.remove();
          }

          // If we fail to fetch emails, then this user does not have this feature enabled
          // and we should not display this panel.
          return this._fetchEmails()
            .fail(() => {
              return this.remove();
            });
        });
    },

    _hasSecondaryEmail () {
      return this._emails.length > 1;
    },

    _hasSecondaryVerifiedEmail () {
      return this._hasSecondaryEmail() ? this._emails[1].verified : false;
    },

    _onDisconnectEmail (event) {
      const email = $(event.currentTarget).data('id');
      const account = this.getSignedInAccount();
      return account.recoveryEmailDestroy(email)
        .then(()=> {
          return this.render()
            .then(()=> {
              this.navigate('/settings/emails');
            });
        });
    },

    _fetchEmails () {
      const account = this.getSignedInAccount();
      return account.recoveryEmails()
        .then((emails) => {
          this._emails = emails.map((email) => {
            return new Email(email).toJSON();
          });
        });
    },

    refresh: showProgressIndicator(function() {
      return this.render();
    }, EMAIL_REFRESH_SELECTOR, EMAIL_REFRESH_DELAYMS),

    resend (event) {
      const email = $(event.currentTarget).data('id');
      const account = this.getSignedInAccount();
      return account.resendEmailCode(email)
        .then(() => {
          this.displaySuccess(t('Verification email sent'), {
            closePanel: false
          });
          this.navigate('/settings/emails');
        });
    },

    submit () {
      const newEmail = this.getElementValue('input.new-email');
      if (this.isPanelOpen() && newEmail) {
        const account = this.getSignedInAccount();
        return account.recoveryEmailCreate(newEmail)
          .then(() => {
            this.displaySuccess(t('Verification email sent'), {
              closePanel: false
            });
            this.render();
          })
          .fail((err) => this.showValidationError(this.$(EMAIL_INPUT_SELECTOR), err));
      }
    },
  });

  Cocktail.mixin(
    View,
    SettingsPanelMixin,
    FloatingPlaceholderMixin
  );

  module.exports = View;
});
