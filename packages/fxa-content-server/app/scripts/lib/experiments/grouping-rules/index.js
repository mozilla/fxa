/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Interface to experiment choices.
 */

define((require, exports, module) => {
  'use strict';

  const _ = require('underscore');

  const ExperimentGroupingRules = [
    require('./communication-prefs'),
    require('./disabled-button-state'),
    require('./email-first'),
    require('./is-sampled-user'),
    require('./q3-form-changes'),
    require('./send-sms-enabled-for-country'),
    require('./send-sms-install-link'),
    require('./sentry'),
    require('./sessions'),
    require('./signup-password-confirm')
  ];

  module.exports = class ExperimentChoiceIndex {
    constructor (options = {}) {
      this._env = options.env;
      this._experimentGroupingRules = options.experimentGroupingRules || ExperimentGroupingRules.map((ExperimentChoice) => new ExperimentChoice());
    }

    /**
     * Use `subject` to make a choice for the experiment with `name`.
     *
     * @param {String} name
     * @param {Object} [subject={}]
     * @returns {Any}
     */
    choose (name, subject = {}) {
      const experiment = _.find(this._experimentGroupingRules, (experimentGroupingRule) => experimentGroupingRule.name === name);
      if (experiment) {
        // A reference to `experimentGroupingRules` is passed in
        // `subject` to allow tests to recursively call other tests.
        // Passing via the `subject` instead of the constructor
        // avoids creating a circular reference between the parent
        // and the children.
        // A copy of subject is used so the original isn't modified.
        const subjectCopy = Object.create(subject);
        subjectCopy.env = subject.env || this._env;
        subjectCopy.experimentGroupingRules = this;
        return experiment.choose(subjectCopy);
      }
    }
  };
});
