/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'lib/experiments/base'
], function (BaseExperiment) {
  'use strict';

  var createSaveStateDelegate = BaseExperiment.createSaveStateDelegate;

  var CoppaExperiment = BaseExperiment.extend({
    notifications: {
      'coppaView.triggered': createSaveStateDelegate('triggered'),
      'signup.submit': createSaveStateDelegate('submit'),
      'signup.tooyoung': createSaveStateDelegate('tooyoung'),
      'verification.success': createSaveStateDelegate('verified')
    }
  });

  return CoppaExperiment;
});
