/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const p = require('lib/promise');
  const requireOnDemand = require('lib/require-on-demand');
  const Url = require('lib/url');
  const PasswordPromptMixin = require('views/mixins/password-prompt-mixin');

  var PasswordStrengthMixin = {

    initialize: function (options) {
      this._able = options.able;
    },

    _isPasswordStrengthCheckEnabledValue: undefined,
    isPasswordStrengthCheckEnabled: function () {
      if (_.isUndefined(this._isPasswordStrengthCheckEnabledValue)) {
        var abData = {
          // the window parameter will override any ab testing features
          forcePasswordStrengthCheck: Url.searchParam('passwordStrengthCheck', this.window.location.search),
          isMetricsEnabledValue: this.metrics.isCollectionEnabled(),
          uniqueUserId: this.user.get('uniqueUserId')
        };

        this._isPasswordStrengthCheckEnabledValue =
              this._able.choose('passwordStrengthCheckEnabled', abData);

        if (this._isPasswordStrengthCheckEnabledValue) {
          this._logStrengthExperimentEvent('enabled');
        }
      }
      return this._isPasswordStrengthCheckEnabledValue;
    },

    _passwordStrengthCheckerPromise: undefined,
    getPasswordStrengthChecker: function () {
      // returns a promise that resolves once the library is loaded.
      if (! this._passwordStrengthCheckerPromise) {
        this._passwordStrengthCheckerPromise = requireOnDemand('passwordcheck')
          // Log any failures loading the script
          .fail(this.logError.bind(this))
          .then((PasswordCheck) => {
            return new PasswordCheck();
          });
      }
      return this._passwordStrengthCheckerPromise;
    },

    /**
     * Check the password strength. Returns a promise that resolves
     * when the check is complete. Promise resolves to `DISABLED` if
     * password strength checker is disabled.
     *
     * Usage:
     *
     *   view.checkPasswordStrength(password)
     *     .then(function (status) {
     *      // do something with the status
     *     });
     *
     * @method checkPasswordStrength
     * @param {String} password
     *
     * @returns {Promise}
     */
    checkPasswordStrength: function (password) {
      if (! this.isPasswordStrengthCheckEnabled()) {
        return p('DISABLED');
      }

      return this.getPasswordStrengthChecker()
        .then((passwordStrengthChecker) => {
          var deferred = p.defer();
          passwordStrengthChecker(password, (passwordCheckStatus) => {
            passwordCheckStatus = passwordCheckStatus || 'UNKNOWN';

            if (passwordCheckStatus === 'BLOOMFILTER_HIT' ||
                passwordCheckStatus === 'BLOOMFILTER_MISS') {
              this._logStrengthExperimentEvent('bloomfilter_used');
            }
            if (passwordCheckStatus === 'BLOOMFILTER_HIT' ||
                passwordCheckStatus === 'ALL_LETTERS_OR_NUMBERS') {
              // display the warning prompt only if the password is ALL_LETTERS_OR_NUMBERS
              // or password is found in list of common passwords
              this.displayPasswordWarningPrompt();
            }
            this._logStrengthExperimentEvent(passwordCheckStatus);

            deferred.resolve(passwordCheckStatus);
          });
          return deferred.promise;
        });
    },

    _logStrengthExperimentEvent: function (eventNameSuffix) {
      var eventName = 'experiment.pw_strength.' + eventNameSuffix.toLowerCase();
      this.logViewEvent(eventName);
    }
  };
  module.exports = _.extend(PasswordStrengthMixin, PasswordPromptMixin);
});
