/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View mixin to support a user upgrading their session to
 * be verified. This is useful in situations where a panel
 * might contain sensitive information or security related
 * features.
 *
 * This mix-in replaces the template loaded by the view with
 * the upgrade-session template. Once the email has been
 * verified, the page is re-rendered and the user can see
 * the gated panel.
 *
 * @mixin UpgradeSessionMixin
 */

import preventDefaultThen from '../decorators/prevent_default_then';
import Notifier from '../../lib/channels/notifier';
import LastCheckedTimeMixin from './last-checked-time-mixin';
import SessionVerifiedNotificationMixin from './session-verified-notification-mixin';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import UpgradeSessionTemplate from 'templates/settings/upgrade_session.mustache';
import showProgressIndicator from '../decorators/progress_indicator';

const t = (msg) => msg;
const EMAIL_REFRESH_SELECTOR =
  'button.settings-button.refresh-verification-state';
const EMAIL_REFRESH_DELAYMS = 350;

/**
 * The UpgradeSessionMixin can be configured to display different titles and captions
 * depending on what panel is being gated.
 *
 * @param {Object} [options]
 *  @param {String} [options.caption] - caption describing what the panel is unlocking
 *  @param {String} [options.gatedHref] - location that is redirected after session is verified
 *  @param {String} [options.title] - title name of the panel
 * @returns {Object} UpgradeSessionMixin
 */
export default (options = {}) => {
  return {
    dependsOn: [
      LastCheckedTimeMixin,
      SettingsPanelMixin,
      SessionVerifiedNotificationMixin,
    ],

    events: {
      'click .cancel-verification-email': preventDefaultThen(
        '_clickCancelVerificationEmail'
      ),
      'click .refresh-verification-state': preventDefaultThen(
        '_clickRefreshVerificationState'
      ),
      'click .send-verification-email': preventDefaultThen(
        '_clickSendVerificationEmail'
      ),
    },

    initialize() {
      this.gatedTemplate = this.template;
    },

    _clickRefreshVerificationState: showProgressIndicator(
      function () {
        return this.setupSessionGateIfRequired().then((verified) => {
          this.setLastCheckedTime();
          if (verified) {
            this.displaySuccess(t('Primary email verified successfully'), {
              closePanel: false,
            });

            this.notifier.triggerAll(Notifier.SESSION_VERIFIED);
          }

          this.render();
        });
      },
      EMAIL_REFRESH_SELECTOR,
      EMAIL_REFRESH_DELAYMS
    ),

    _clickSendVerificationEmail() {
      const account = this.getSignedInAccount();
      return account
        .requestVerifySession({
          redirectTo: this.window.location.href,
        })
        .then(() => {
          this.setLastCheckedTime();
          this.displaySuccess(t('Verification email sent'), {
            closePanel: false,
          });
          this.model.set({ emailSent: true });
          return this.render();
        });
    },

    _clickCancelVerificationEmail() {
      this.closePanel();
      this.navigate('/settings');
      this.$('.send-verification-email').removeClass('hidden');
      this.$('.cancel-verification-email').addClass('hidden');
    },

    setInitialContext(context) {
      context.set({
        email: this.getSignedInAccount().get('email'),
        emailSent: this.model.get('emailSent'),
        gatedHref: options.gatedHref,
        isPanelOpen: this.isPanelOpen(),
        title: this.translate(options.title),
      });
    },

    /**
     * Checks to see if the current session is verified. If it is,
     * then it renders the original template, otherwise it renders
     * the upgrade-session template. This template prompts user
     * to verify their email address before they can see the original
     * template.
     *
     * @returns {Boolean} sessionVerified
     */
    setupSessionGateIfRequired() {
      const account = this.getSignedInAccount();
      return account.sessionVerificationStatus().then(({ sessionVerified }) => {
        if (!sessionVerified) {
          this.template = UpgradeSessionTemplate;
        } else {
          this.template = this.gatedTemplate;
        }
        return sessionVerified;
      });
    },
  };
};
