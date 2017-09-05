/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/email-first');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/email-first', () => {
    let experiment;
    let experimentGroupingRules;

    before(() => {
      experiment = new Experiment();
      experimentGroupingRules = {
        choose (experimentName) {
          // check against `isSampledUser` - the only time experimentGroupingRules.choose
          // is called is to see if the user reports metrics to DataDog.
          return experimentName === 'isSampledUser';
        }
      };
    });

    describe('choose', () => {
      it('returns `false` if prereqs not met', () => {
        assert.isFalse(experiment.choose());
        assert.isFalse(experiment.choose({}));
        assert.isFalse(experiment.choose({ uniqueUserId: 'user-id' }));
      });

      it('returns experiment if forceExperiment', () => {
        assert.equal(experiment.choose({
          experimentGroupingRules,
          forceExperiment: 'emailFirst',
          forceExperimentGroup: 'control',
          uniqueUserId: 'user-id'
        }), 'control');
      });

      it('returns `false` if `isEmailFirstSupported=false`', () => {
        assert.isFalse(experiment.choose({
          experimentGroupingRules,
          isEmailFirstSupported: false,
          uniqueUserId: 'user-id'
        }));
      });

      it('returns chooses some experiment ', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);

        assert.ok(experiment.choose({
          env: 'development',
          experimentGroupingRules,
          isEmailFirstSupported: true,
          uniqueUserId: 'user-id'
        }));
      });
    });
  });
});
