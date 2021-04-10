/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to unblock their signin by entering
 * in a verification code that is sent in an email.
 */

import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import FormView from './form';
import ResendMixin from './mixins/resend-mixin';
import ResumeTokenMixin from './mixins/resume-token-mixin';
import SignInMixin from './mixins/signin-mixin';
import Template from 'templates/sign_in_unblock.mustache';
import Tooltip from './tooltip';

const View = FormView.extend({
  template: Template,
  className: 'sign-in-unblock',

  getAccount() {
    return this.model.get('account');
  },

  beforeRender() {
    if (!this.model.get('account')) {
      this.navigate(this._getAuthPage());
    }
  },

  setInitialContext(context) {
    const email = this.getAccount().get('email');
    const supportLink = this._getSupportLink();

    context.set({
      email,
      escapedSupportLink: encodeURI(supportLink),
      hasSupportLink: !!supportLink,
      unblockCodeLength: Constants.UNBLOCK_CODE_LENGTH,
    });
  },

  showValidationError(el, err, shouldFocusEl = true) {
    this.logError(err);

    const $invalidEl = this.$(el);
    const message = AuthErrors.toMessage(err);

    const maybeFocus = () => {
      return new Promise((resolve) => {
        if (shouldFocusEl) {
          // wait to focus otherwise
          // on screen keyboard may cover message
          setTimeout(
            () => {
              try {
                $invalidEl.get(0).focus();
              } catch (e) {
                // IE can blow up if the element is not visible.
              }
              resolve();
            },
            // Create account page needs a bit more time than next tick
            // for some unknown reason. Maybe investigate later...
            200
          );
        } else {
          resolve();
        }
      });
    };

    if (err.describedById) {
      this.markElementInvalid($invalidEl, err.describedById);
      maybeFocus();
    } else {
      // tooltipId is used to bind the invalid element
      // with the tooltip using `aria-described-by`
      const tooltipId = `error-tooltip-${err.errno}`;

      var tooltip = new Tooltip({
        id: tooltipId,
        invalidEl: $invalidEl,
        message,
        translator: this.translator,
      });

      maybeFocus().then(() => {
        tooltip
          .on('destroyed', () => {
            this.markElementValid($invalidEl);
            this.trigger('validation_error_removed', el);
          })
          .render()
          .then(() => {
            this.markElementInvalid($invalidEl, tooltipId);
            // used for testing
            this.trigger('validation_error', el, message);
          });

        this.trackChildView(tooltip);
      });
    }

    return message;
  },

  submit() {
    const account = this.getAccount();
    const password = this.model.get('password');
    const unblockCode = this.getElementValue('#unblock_code');

    return this.signIn(account, password, { unblockCode }).catch((err) =>
      this.onSignInError(account, password, err)
    );
  },

  onSignInError(account, password, error) {
    if (AuthErrors.is(error, 'INCORRECT_PASSWORD')) {
      // The user must go enter the correct password this time.
      this.navigate(this._getAuthPage(), {
        account: this.getAccount(),
        email: account.get('email'),
        error,
      });
    } else {
      // re-throw, it'll be displayed at a lower level.
      throw error;
    }

    if(AuthErrors.is(error, 'INVALID_UNBLOCK_CODE')) {
      this.showValidationError(this.getElementValue('#unblock_code'),error);
    } else {
      // re-throw, it'll be displayed at a lower level.
      throw error;
    }
  },

  resend() {
    return this._sendUnblockEmail();
  },

  _sendUnblockEmail() {
    return this.getAccount()
      .sendUnblockEmail()
      .catch((err) => this.displayError(err));
  },

  /**
   * Get the URL of the page for users that
   * must enter their password.
   *
   * @returns {String}
   */
  _getAuthPage() {
    return this.model.get('lastPage') === 'force_auth'
      ? 'force_auth'
      : 'signin';
  },

  /**
   * Get the SUMO link for `Why is this happening to me?`. Could be
   * `undefined` if no link is available.
   *
   * @returns {String}
   */
  _getSupportLink() {
    return Constants.BLOCKED_SIGNIN_SUPPORT_URL;
  },
});

Cocktail.mixin(View, ResendMixin(), ResumeTokenMixin, SignInMixin);

export default View;
