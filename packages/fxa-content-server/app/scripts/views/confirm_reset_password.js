/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Account from '../models/account';
import AuthErrors from '../lib/auth-errors';
import BaseView from './base';
import Cocktail from 'cocktail';
import Notifier from '../lib/channels/notifier';
import PasswordResetMixin from './mixins/password-reset-mixin';
import OpenResetPasswordEmailMixin from './mixins/open-webmail-mixin';
import ResendMixin from './mixins/resend-mixin';
import ServiceMixin from './mixins/service-mixin';
import Session from '../lib/session';
import Template from 'templates/confirm_reset_password.mustache';
import { VERIFICATION_POLL_IN_MS } from '../lib/constants';

const t = (msg) => msg;

const View = BaseView.extend({
  template: Template,
  className: 'confirm-reset-password',

  initialize(options = {}) {
    this._verificationPollMS =
      options.verificationPollMS || VERIFICATION_POLL_IN_MS;
  },

  setInitialContext(context) {
    var email = this.model.get('email');
    var isSignInEnabled = this.relier.get('resetPasswordConfirm');

    context.set({
      email: email,
      encodedEmail: encodeURIComponent(email),
      forceAuth: this.broker.isForceAuth(),
      isSignInEnabled: isSignInEnabled,
    });
  },

  getAccount() {
    if (!this._account) {
      this._account = this.user.initAccount({ email: this.model.get('email') });
    }
    return this._account;
  },

  beforeRender() {
    // user cannot confirm if they have not initiated a reset password
    if (!this.model.has('passwordForgotToken')) {
      this.navigate('reset_password');
      return;
    }

    // Check to see if account has a recovery key and store in model.
    // The password reset success messaging will change depending on if it does
    return this.getAccount()
      .checkRecoveryKeyExistsByEmail()
      .then((result) => {
        this.model.set('hasRecoveryKey', result.exists);
      });
  },

  afterVisible() {
    const account = this.getAccount();
    return this.broker.persistVerificationData(account).then(() => {
      return this._waitForConfirmation()
        .then((sessionInfo) => {
          this.logViewEvent('verification.success');
          // The password was reset, future attempts should ask confirmation.
          this.relier.set('resetPasswordConfirm', true);

          // for scoped key OAuth reliers, if key tokens are missing, ask the user to login again
          // and get those tokens
          if (
            !account.canFetchKeys() &&
            this.relier.wantsKeys() &&
            this.relier.isOAuth()
          ) {
            return this._finishPasswordResetDifferentBrowser();
          }
          // The original window should finish the flow if the user
          // completes verification in the same browser and has sessionInfo
          // passed over from tab 2.
          if (sessionInfo) {
            return this._finishPasswordResetSameBrowser(sessionInfo);
          }

          return this._finishPasswordResetDifferentBrowser();
        })
        .catch(this.displayError.bind(this));
    });
  },

  _waitForConfirmation() {
    return new Promise((resolve, reject) => {
      // If either the `login` message comes through or the `login` message
      // timeout elapses after the server confirms the user is verified,
      // stop waiting all together and move to the next view.
      const onComplete = (response) => {
        this._stopWaiting();
        resolve(response);
      };

      const onError = (err) => {
        this._stopWaiting();
        reject(err);
      };

      /**
       * A short message on password reset verification:
       *
       * If the user initiates a password reset from about:accounts,
       * about:accounts listens for a `login` message from FxA within the
       * about:accounts tab and ignores messages from other tabs (including the
       * verification tab). This is unfortunate, because for password reset,
       * the sessionToken, kA and kB are generated in the verification tab.
       * To sign the user in and send the `login` message, all the users data
       * needs to be sent from the verification tab to this tab so we can send
       * it off to the browser.
       *
       * We hope the user verifies in this browser, but we are not assured of
       * that. The only way we know if the user verified in this browser is if
       * a `login` message is received.
       *
       * When the user attempts a password reset, we have no idea whether the
       * user is going to verify in the same browser. The only way we know if
       * the user verified in this browser is if a `login` message is received
       * from the inter-tab channel.
       *
       * Because we have no idea if the user will verify in this browser,
       * assume they will not. Start polling the server to see if the user has
       * verified. If the server eventually reports the user has successfully
       * reset their password, assume the user has completed in a different
       * browser. In this case the best we can do is ask the user to sign in
       * again. Once the user has entered their updated creds, we can then
       * notify the browser.
       *
       * If a `complete_reset_password_tab_open` message is received, hooray,
       * the user has opened the password reset link in this browser. At this
       * point we can assume the user will complete verification in this
       * browser. It's not 100% certain the user will complete, but most
       * likely. Stop polling the server. The server poll is no longer needed,
       * and in fact makes things more complex. Instead, wait for the `login`
       * message that will arrive once the user finishes the password reset.
       *
       * Once the `login` message has arrived, notify the browser. BOOM.
       */
      this.notifier.on(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN, () => {
        if (!this._isWaitingForLoginMessage) {
          this._waitForLoginMessage().then(onComplete, onError);
          this._stopWaitingForServerConfirmation();
        }
      });

      this._waitForServerConfirmation().then(onComplete, onError);
    });
  },

  _finishPasswordResetSameBrowser(sessionInfo) {
    const account = this.user.getAccountByUid(sessionInfo.uid);

    // A bug in e10s causes localStorage in about:accounts and content tabs to be isolated from
    // each other. Writes to localStorage from /complete_reset_password are not able to be read
    // from within about:accounts. Because of this, all account data needed to sign in must
    // be passed between windows. See https://github.com/mozilla/fxa-content-server/issues/4763
    // and https://bugzilla.mozilla.org/show_bug.cgi?id=666724
    account.set(_.pick(sessionInfo, Account.ALLOWED_KEYS));

    if (account.isDefault()) {
      return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
    }

    // The OAuth flow needs the sessionToken to finish the flow.
    return this.user
      .setSignedInAccount(account)
      .then(() => {
        this.displaySuccess(t('Password reset'));

        return this.invokeBrokerMethod(
          'afterResetPasswordConfirmationPoll',
          account
        );
      })
      .then(() => {
        this.navigate('reset_password_confirmed');
      });
  },

  _finishPasswordResetDifferentBrowser() {
    // user verified in a different browser, make them sign in. OAuth
    // users will be redirected back to the RP, Sync users will be
    // taken to the Sync controlled completion page.
    Session.clear();

    const options = {
      account: this.getAccount(),
    };

    if (!this.model.get('hasRecoveryKey')) {
      options.success = t('Password reset successfully. Sign in to continue.');
    }

    this.navigate('signin', options);
  },

  _isWaitingForServerConfirmation: false,
  _waitForServerConfirmation() {
    // only check if still waiting.
    this._isWaitingForServerConfirmation = true;

    const account = this.getAccount();
    const token = this.model.get('passwordForgotToken');
    return account.isPasswordResetComplete(token).then((isComplete) => {
      if (!this._isWaitingForServerConfirmation) {
        // we no longer care about the response, the other tab has opened.
        // drop the response on the ground and never resolve.
        return new Promise(() => {});
      } else if (isComplete) {
        return null;
      }

      return new Promise((resolve) => {
        this._waitForServerConfirmationTimeout = this.setTimeout(() => {
          if (this._isWaitingForServerConfirmation) {
            resolve(this._waitForServerConfirmation());
          }
        }, this._verificationPollMS);
      });
    });
  },

  _stopWaitingForServerConfirmation() {
    if (this._waitForServerConfirmationTimeout) {
      this.clearTimeout(this._waitForServerConfirmationTimeout);
    }
    this._isWaitingForServerConfirmation = false;
  },

  _isWaitingForLoginMessage: false,
  _waitForLoginMessage() {
    return new Promise((resolve) => {
      this._isWaitingForLoginMessage = true;
      this.notifier.on(Notifier.SIGNED_IN, resolve);
    });
  },

  _stopListeningForInterTabMessages() {
    this._isWaitingForLoginMessage = false;
    this.notifier.off();
  },

  _stopWaiting() {
    this._stopWaitingForServerConfirmation();
    this._stopListeningForInterTabMessages();
  },

  resend() {
    return this.retryResetPassword(
      this.model.get('email'),
      this.model.get('passwordForgotToken')
    ).catch((err) => {
      if (AuthErrors.is(err, 'INVALID_TOKEN')) {
        return this.navigate('reset_password', {
          error: err,
        });
      }

      // unexpected error, rethrow for display.
      throw err;
    });
  },
});

Cocktail.mixin(
  View,
  PasswordResetMixin,
  OpenResetPasswordEmailMixin,
  ResendMixin(),
  ServiceMixin
);

export default View;
