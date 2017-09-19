/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const ExperimentMixin = require('./experiment-mixin');

  const EXPERIMENT_NAME = 'disabledButtonState';

  module.exports = {
    dependsOn: [ ExperimentMixin ],

    afterRender () {
      if (this.isInExperimentGroup(EXPERIMENT_NAME, 'treatment')) {
        this.$('button[type=submit]').removeClass('disabled');
        this.logEventOnce('exp.dbs.treatment.render');
      } else if (this.isInExperimentGroup(EXPERIMENT_NAME, 'control')) {
        this.logEventOnce('exp.dbs.control.render');
      }
    },

    disableForm () {
      // There is a timing dependency here on the way Cocktail runs
      // mixed in functions. We depend on the consuming module's
      // disableForm being run first, which will cause the form to
      // be disabled. After cocktail run's the consuming module's
      // disableForm, this version will be run, re-enabling the form.
      if (this.isInExperimentGroup(EXPERIMENT_NAME, 'treatment')) {
        this.$('button[type=submit]').removeClass('disabled');
      }
    }
  };
});
