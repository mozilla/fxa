/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AvatarMixin from '../mixins/avatar-mixin';
import Cocktail from 'cocktail';
import Email from '../../models/email';
import FormView from '../form';
import LastCheckedTimeMixin from '../mixins/last-checked-time-mixin';
import preventDefaultThen from '../decorators/prevent_default_then';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import UpgradeSessionMixin from '../mixins/upgrade-session-mixin';
import Strings from '../../lib/strings';
import showProgressIndicator from '../decorators/progress_indicator';
import Template from 'templates/settings/emails.mustache';
import Url from '../../lib/url';
import { MAX_SECONDARY_EMAILS } from '../../lib/constants';

const t = msg => msg;

const EMAIL_INPUT_SELECTOR = 'input.new-email';
const EMAIL_REFRESH_SELECTOR = 'button.settings-button.email-refresh';
const EMAIL_GROUP_SELECTOR = 'li.email-address';
const EMAIL_REFRESH_DELAYMS = 350;

var View = FormView.extend({
  template: Template,
  className: 'emails',
  viewName: 'settings.emails',

  events: {
    'click .email-disconnect': preventDefaultThen('_onDisconnectEmail'),
    'click .email-refresh.enabled': preventDefaultThen('refresh'),
    'click .resend': preventDefaultThen('resend'),
    'click .set-primary': preventDefaultThen('setPrimary'),
    'click .email-add-another': 'addAnotherEmail',
    'click .return-to-emails': 'returnToEmails',
  },

  beforeRender() {
    return this.setupSessionGateIfRequired().then(isEnabled => {
      if (isEnabled) {
        return this._fetchEmails();
      }
    });
  },

  initialize(options = {}) {
    if (options.emails) {
      this._emails = options.emails;
    } else {
      this._emails = [];
    }
  },

  setInitialContext(context) {
    context.set({
      buttonClass: this._hasSecondaryEmail()
        ? 'secondary-button'
        : 'primary-button',
      emails: this._emails,
      showingSecondaryEmails: this._showingSecondaryEmails(),
      canAddAnotherEmail: this._canAddAnotherEmail(),
      addingAnotherEmail: this._addingAnotherEmail(),
      hasSecondaryEmail: this._hasSecondaryEmail(),
      hasSecondaryVerifiedEmail: this._hasSecondaryVerifiedEmail(),
      isPanelOpen: this.isPanelOpen(),
      lastCheckedTime: this.getLastCheckedTimeString(),
      newEmail: this.newEmail,
    });

    this.metrics.logUserPreferences(
      this.className,
      this._hasSecondaryVerifiedEmail()
    );
  },

  afterRender() {
    if (this._hasSecondaryEmail()) {
      // Panel should remain open if there are any unverified secondary emails
      if (!this._hasSecondaryVerifiedEmail()) {
        this.openPanel();
      }

      if (this._addingAnotherEmail()) {
        this.el.querySelector(EMAIL_INPUT_SELECTOR).focus();
      }
    }
  },

  _showingSecondaryEmails() {
    return this._hasSecondaryEmail() && !this._addingAnotherEmail();
  },

  _addingAnotherEmail() {
    return this._canAddAnotherEmail() && this.model.get('addAnotherEmail');
  },

  _canAddAnotherEmail() {
    return this._emails.length <= MAX_SECONDARY_EMAILS;
  },

  _hasSecondaryEmail() {
    return this._emails.length > 1;
  },

  _hasSecondaryVerifiedEmail() {
    return this._hasSecondaryEmail() ? this._emails[1].verified : false;
  },

  _onDisconnectEmail(event) {
    const email = $(event.currentTarget)
      .closest(EMAIL_GROUP_SELECTOR)
      .data('id');
    const account = this.getSignedInAccount();
    return account.recoveryEmailDestroy(email).then(() => {
      return this.render().then(() => {
        this.displaySuccess(t('Secondary email removed'), {
          closePanel: !this._hasSecondaryEmail(),
        });

        if (!this._hasSecondaryEmail()) {
          this.navigate('/settings');
        }
      });
    });
  },

  _fetchEmails() {
    const account = this.getSignedInAccount();
    return account.recoveryEmails().then(emails => {
      this._emails = emails.map(email => {
        return new Email(email).toJSON();
      });
    });
  },

  refresh: showProgressIndicator(
    function() {
      this.setLastCheckedTime();
      return this.render();
    },
    EMAIL_REFRESH_SELECTOR,
    EMAIL_REFRESH_DELAYMS
  ),

  resend(event) {
    const email = $(event.currentTarget)
      .closest(EMAIL_GROUP_SELECTOR)
      .data('id');
    const account = this.getSignedInAccount();
    return account.resendEmailCode({ email }).then(() => {
      this.displaySuccess(t('Verification email sent'), {
        closePanel: false,
      });
      this.navigate('/settings/emails');
    });
  },

  submit() {
    const newEmail = this.getElementValue(EMAIL_INPUT_SELECTOR);
    if (this.isPanelOpen() && newEmail) {
      const account = this.getSignedInAccount();
      return account
        .recoveryEmailCreate(newEmail)
        .then(() => {
          this.model.set('addAnotherEmail', false);
          this.displaySuccess(t('Verification email sent'), {
            closePanel: false,
          });
          this.render();
        })
        .catch(err =>
          this.showValidationError(this.$(EMAIL_INPUT_SELECTOR), err)
        );
    }
  },

  setPrimary(event) {
    const email = $(event.currentTarget)
      .closest(EMAIL_GROUP_SELECTOR)
      .data('id');
    const account = this.getSignedInAccount();
    return account.setPrimaryEmail(email).then(() => {
      this.updateDisplayEmail(email);
      account.unset('originalLoginEmail');
      this.setSearchString('email', email);
      this.displaySuccess(
        Strings.interpolate(t('Primary email set to %(email)s'), { email }),
        {
          closePanel: false,
        }
      );
      this.render();
    });
  },

  addAnotherEmail() {
    this.model.set('addAnotherEmail', true);
    this.render();
  },

  returnToEmails() {
    this.model.set('addAnotherEmail', false);
    this.render();
  },
});

Cocktail.mixin(
  View,
  UpgradeSessionMixin({
    gatedHref: 'settings/emails',
    title: t('Secondary email'),
  }),
  AvatarMixin,
  LastCheckedTimeMixin,
  SettingsPanelMixin,
  Url
);

export default View;
