/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'lib/promise',
  'lib/require-on-demand',
  'lib/url',
  'underscore'
], function (p, requireOnDemand, Url, _) {
  'use strict';

  var PasswordStrengthMixin = {
    initialize: function (options) {
      this._able = options.able;
    },

    _isPasswordStrengthCheckEnabledValue: undefined,
    _isPasswordStrengthCheckEnabled: function () {
      var self = this;
      if (_.undefined(self._isPasswordStrengthCheckEnabledValue)) {
        var abData = {
          isMetricsEnabledValue: self.metrics.isCollectionEnabled(),
          uniqueUserId: self.user.get('uniqueUserId'),
          // the window parameter will override any ab testing features
          forcePasswordStrengthCheck: Url.searchParam('passwordStrengthCheck', self.window.location.search)
        };

        self._isPasswordStrengthCheckEnabledValue =
              self._able.choose('passwordStrengthCheckEnabled', abData);

        if (self._isPasswordStrengthCheckEnabledValue) {
          self._logStrengthExperimentEvent('enabled');
        }
      }
      return self._isPasswordStrengthCheckEnabledValue;
    },

    _passwordStrengthCheckerPromise: undefined,
    _getPasswordStrengthChecker: function () {
      // returns a promise that resolves once the library is loaded.
      var self = this;
      if (! self._passwordStrengthCheckerPromise) {
        self._passwordStrengthCheckerPromise = requireOnDemand('passwordcheck')
          .then(function (PasswordCheck) {
            return new PasswordCheck();
          });
      }
      return self._passwordStrengthCheckerPromise;
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
     * @returns {Promise}
     */
    checkPasswordStrength: function (password) {
      var self = this;
      if (! self._isPasswordStrengthCheckEnabled()) {
        return p('DISABLED');
      }

      return self._getPasswordStrengthChecker()
        .then(function (passwordStrengthChecker) {
          var deferred = p.defer();
          passwordStrengthChecker(password, function (passwordCheckStatus) {
            // in the future, do some fancy tooltip here.
            passwordCheckStatus = passwordCheckStatus || 'UNKNOWN';

            if (passwordCheckStatus === 'BLOOMFILTER_HIT' ||
                passwordCheckStatus === 'BLOOMFILTER_MISS') {
              self._logStrengthExperimentEvent('bloomfilter_used');
            }
            self._logStrengthExperimentEvent(passwordCheckStatus);

            deferred.resolve(passwordCheckStatus);
          });
          return deferred.promise;
        });
    },

    _logStrengthExperimentEvent: function (eventNameSuffix) {
      var eventName = 'experiment.pw_strength.' + eventNameSuffix.toLowerCase();
      this.logScreenEvent(eventName);
    }
  };
  return PasswordStrengthMixin;
});
