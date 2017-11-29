/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const AvatarMixin = require('../mixins/avatar-mixin');
  const BaseView = require('../base');
  const Cocktail = require('cocktail');
  const Email = require('../../models/email');
  const FloatingPlaceholderMixin = require('../mixins/floating-placeholder-mixin');
  const FormView = require('../form');
  const preventDefaultThen = require('../base').preventDefaultThen;
  const SettingsPanelMixin = require('../mixins/settings-panel-mixin');
  const UpgradeSessionMixin = require('../mixins/upgrade-session-mixin');
  const SearchParamMixin = require('../../lib/search-param-mixin');
  const Strings = require('../../lib/strings');
  const showProgressIndicator = require('../decorators/progress_indicator');
  const Template = require('stache!templates/settings/emails');

  var t = BaseView.t;

  const EMAIL_INPUT_SELECTOR = 'input.new-email';
  const EMAIL_REFRESH_SELECTOR = 'button.settings-button.email-refresh';
  const EMAIL_REFRESH_DELAYMS = 350;

  var View = FormView.extend({
    template: Template,
    className: 'emails',
    viewName: 'settings.emails',

    events: {
      'click .email-disconnect': preventDefaultThen('_onDisconnectEmail'),
      'click .email-refresh.enabled': preventDefaultThen('refresh'),
      'click .resend': preventDefaultThen('resend'),
      'click .set-primary': preventDefaultThen('setPrimary')
    },

    beforeRender () {
      return this.setupSessionGateIfRequired()
        .then((isEnabled) => {
          if (isEnabled) {
            return this._fetchEmails();
          }
        });
    },

    initialize (options = {}) {
      if (options.emails) {
        this._emails = options.emails;
      } else {
        this._emails = [];
      }
    },

    setInitialContext (context) {
      context.set({
        buttonClass: this._hasSecondaryEmail() ? 'secondary' : 'primary',
        canChangePrimaryEmail: this._canChangePrimaryEmail(),
        emails: this._emails,
        hasSecondaryEmail: this._hasSecondaryEmail(),
        hasSecondaryVerifiedEmail: this._hasSecondaryVerifiedEmail(),
        isPanelOpen: this.isPanelOpen(),
        newEmail: this.newEmail,
      });
    },

    afterRender () {
      // Panel should remain open if there are any unverified secondary emails
      if (this._hasSecondaryEmail() && ! this._hasSecondaryVerifiedEmail()) {
        this.openPanel();
      }
    },

    _canChangePrimaryEmail () {
      if (this.getSearchParam('canChangeEmail')) {
        return true;
      }

      return false;
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
              this.displaySuccess(t('Secondary email removed'), {
                closePanel: true
              });
              this.navigate('/settings');
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
      return account.resendEmailCode({ email })
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
          .catch((err) => this.showValidationError(this.$(EMAIL_INPUT_SELECTOR), err));
      }
    },

    setPrimary (event) {
      const email = $(event.currentTarget).data('id');
      const account = this.getSignedInAccount();
      return account.setPrimaryEmail(email)
        .then(() => {
          this.updateDisplayEmail(email);
          this.displaySuccess(Strings.interpolate(t('Primary email set to %(email)s'), { email }), {
            closePanel: false
          });
          this.render();
        });
    }

  });

  Cocktail.mixin(
    View,
    UpgradeSessionMixin({
      caption: t('A secondary email is an additional address for receiving security notices and confirming new Sync devices'),
      gatedHref: 'settings/emails',
      title: t('Secondary email')
    }),
    AvatarMixin,
    SettingsPanelMixin,
    FloatingPlaceholderMixin,
    SearchParamMixin
  );

  module.exports = View;
});
