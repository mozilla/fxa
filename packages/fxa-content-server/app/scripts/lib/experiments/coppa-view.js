/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'underscore',
  'lib/experiments/base'
], function (_, BaseExperiment) {
  'use strict';

  function CoppaExperiment() {
    // constructor
  }

  var createSaveStateDelegate = BaseExperiment.createSaveStateDelegate;

  _.extend(CoppaExperiment.prototype, new BaseExperiment(), {
    notifications: {
      'coppaView.triggered': createSaveStateDelegate('triggered'),
      'signup.submit': createSaveStateDelegate('submit'),
      'signup.tooyoung': createSaveStateDelegate('tooyoung'),
      'verification.success': createSaveStateDelegate('verified')
    }
  });

  return CoppaExperiment;
});
