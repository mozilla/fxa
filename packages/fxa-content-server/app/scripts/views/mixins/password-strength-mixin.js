/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debounce } from 'underscore';
import PasswordStrengthBalloonModel from '../../models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloonView from '../password_strength/password_with_strength_balloon';

const DELAY_BEFORE_LOG_REASON_MS = 1500;

/**
 * Create the mixin to set up the password strength A/B test an UI. If the
 * user is part of the experiment group, the normal password strength rules,
 * and helper UI are overridden with experimental versions.
 *
 * @param {Object} config
 *   @param {String} config.balloonEl selector where the password strength balloon should attach
 *   @param {String} config.passwordEl selector for the password element to watch
 *   @param {Number} [config.delayBeforeLogReasonMS] delay in MS before logging model changes. Defaults to 1500ms.
 * @returns {Object} the mixin
 */
export default function(config = {}) {
  const delayBeforeLogReasonMS =
    config.delayBeforeLogReasonMS || DELAY_BEFORE_LOG_REASON_MS;
  const { balloonEl, passwordEl } = config;

  return {
    afterRender() {
      return Promise.resolve().then(() => {
        if (!this.$(passwordEl).length) {
          // Only attach the balloon iff there is a password element. This avoids
          // problems in the reset-password screen when using the recovery key
          return;
        }

        const passwordModel = (this.passwordModel = this._createPasswordStrengthBalloonModel());
        // wait a short time after the last invalid event to log the invalid reason.
        // The additional delay over when the UI updates is to minimize the
        // chances of spurious warnings being logged as us helping the user.
        this.listenTo(
          passwordModel,
          'invalid',
          debounce(() => this._logErrorIfInvalid(), delayBeforeLogReasonMS)
        );

        return passwordModel.fetch().then(() => {
          const passwordView = this._createPasswordWithStrengthBalloonView(
            this.passwordModel
          );
          this.trackChildView(passwordView);
        });
      });
    },

    _createPasswordStrengthBalloonModel() {
      return new PasswordStrengthBalloonModel({
        email: this.getAccount().get('email'),
      });
    },

    _createPasswordWithStrengthBalloonView(passwordModel) {
      return new PasswordWithStrengthBalloonView({
        balloonEl: this.$(balloonEl),
        el: this.$(passwordEl),
        lang: this.lang,
        model: passwordModel,
        translator: this.translator,
      });
    },

    _logErrorIfInvalid() {
      const error = this.passwordModel.validationError;
      if (error) {
        this.logError(error);
      }
    },
  };
}
