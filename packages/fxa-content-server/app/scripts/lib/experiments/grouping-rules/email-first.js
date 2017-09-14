/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const BaseGroupingRule = require('./base');

  const EXPERIMENT_NAME = 'emailFirst';

  class EmailFirstGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = EXPERIMENT_NAME;
    }

    /**
     * Use `subject` data to make a choice.
     *
     * @param {Object} subject data used to decide
     * @returns {Any}
     */
    choose (subject) {
      const GROUPS = ['control', 'treatment'];

      if (! this._isValidSubject(subject)) {
        return false;
      } else if (! subject.isEmailFirstSupported) {
        // isEmailFirstSupported is `true` for brokers that support the email-first flow.
        return false;
      } else if (subject.experimentGroupingRules.choose('q3FormChanges', subject) !== this.name) {
        return  false;
      } else if (! this._isSampledUser(subject)) {
        return false;
      }

      return this.uniformChoice(GROUPS, subject.uniqueUserId);
    }

    /**
     * Is the subject valid?
     *
     * @param {Object} subject
     * @returns {Boolean}
     * @private
     */
    _isValidSubject (subject) {
      return subject && subject.uniqueUserId && subject.experimentGroupingRules;
    }

    /**
     * Is the user sample the experiment?
     *
     * @param {Object} subject
     * @returns {Boolean}
     * @private
     */
    _isSampledUser (subject) {
      // DataDog metrics have to be enabled for user to be a part of the experiment.
      // sampleRate is the % of DataDog reporting users.
      const sampleRate = EmailFirstGroupingRule.sampleRate(subject.env);

      return subject.experimentGroupingRules.choose('isSampledUser', subject) &&
              this.bernoulliTrial(sampleRate, subject.uniqueUserId);
    }

    /**
     * Get the sample rate for `env`
     *
     * @static
     * @param {String} env
     * @returns {Number}
     */
    static sampleRate (env) {
      return env === 'development' ? 1.0 : 0.2;
    }
  }


  module.exports = EmailFirstGroupingRule;
});
