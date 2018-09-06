/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debounce } from 'underscore';
import ExperimentMixin from './experiment-mixin';
import PasswordStrengthBalloonModel from '../../models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloonView from '../password_strength/password_with_strength_balloon';
import { EXPERIMENT_NAME } from '../../lib/experiments/grouping-rules/password-strength';

const DESIGN_F_GROUP = 'designF';

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
export default function (config = {}) {
  const delayBeforeLogReasonMS = config.delayBeforeLogReasonMS || DELAY_BEFORE_LOG_REASON_MS;
  const { balloonEl, passwordEl } = config;

  return {
    dependsOn: [
      ExperimentMixin
    ],

    afterRender () {
      const experimentGroup = this._getPasswordStrengthExperimentGroup();
      if (experimentGroup) {
        this.createExperiment(EXPERIMENT_NAME, experimentGroup);

        if (experimentGroup === 'designF') {
          return this._setupDesignF();
        }
      }
    },

    _setupDesignF () {
      const passwordModel = this.passwordModel = this._createPasswordStrengthBalloonModel();
      // wait a short time after the last change to log the invalid reason.
      // The additional delay over when the UI updates is to minimize the
      // chances of spurious warnings being logged as us helping the user.
      this.listenTo(passwordModel, 'change', debounce(() => this._logErrorIfInvalid(), delayBeforeLogReasonMS));

      this.on('submitStart', () => passwordModel.set('isSubmitting', true));
      this.on('submitEnd', () => passwordModel.set('isSubmitting', false));

      const passwordView = this._createPasswordWithStrengthBalloonView(passwordModel);
      this.trackChildView(passwordView);

      // the password element is already rendered,
      // call it's afterRender function to
      // create the balloon.
      return passwordView.afterRender();
    },

    _createPasswordStrengthBalloonModel () {
      return new PasswordStrengthBalloonModel(this.getAccount().pick('email'));
    },

    _createPasswordWithStrengthBalloonView (passwordModel) {
      return new PasswordWithStrengthBalloonView({
        balloonEl: this.$(balloonEl),
        el: this.$(passwordEl),
        lang: this.lang,
        model: passwordModel,
        translator: this.translator
      });
    },

    setInitialContext (context) {
      context.set({
        showCustomHelperBalloon: this._getPasswordStrengthExperimentGroup() === DESIGN_F_GROUP
      });
    },

    isValidStart () {
      const experimentGroup = this._getPasswordStrengthExperimentGroup();
      if (experimentGroup === DESIGN_F_GROUP && this.passwordModel.validate()) {
        // does not allow the form to be submit if the model says there are any problems.
        return false;
      }
      // If fall through occurs, the mixin target's isValidStart will be called.
    },

    showValidationErrorsStart () {
      const experimentGroup = this._getPasswordStrengthExperimentGroup();
      if (experimentGroup === DESIGN_F_GROUP && this.passwordModel.validate()) {
        this.focus(passwordEl);
        // do not show any additional tooltips if the model says there are any errors
        // under the assumption our PasswordStrengthBalloonView will display errors.
        return true;
      }
      // If fall through occurs, the mixin target's showValidationErrorsStart will be called.
    },

    _getPasswordStrengthExperimentSubject: function () {
      return {
        account: this.getAccount(),
        lang: this.lang
      };
    },

    _getPasswordStrengthExperimentGroup () {
      return this.getExperimentGroup(EXPERIMENT_NAME, this._getPasswordStrengthExperimentSubject());
    },

    logError (error) {
      // propagate errors to the notifier, the password-strength experiment
      // will decide whether any of them are worth saving state about.
      // This also handles password validation errors for the control group
      // since there is no model saying the field is invalid.
      this.notifier.trigger('password.error', error);
    },

    _logErrorIfInvalid () {
      // The model's `change` event occurs when any of the attributes are
      // updated. Because the model's `updateForPassword` method is
      // asynchronous, it's possible for a `change` event to be triggered
      // and the model be considered invalid before the password has
      // been checked. Only log errors after the password has been checked.
      if (! this.passwordModel.get('hasCheckedPassword')) {
        return;
      }

      const error = this.passwordModel.validate();
      if (error) {
        this.logError(error);
      }
    }
  };
}

