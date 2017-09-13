/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/signup-password-confirm');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/signup-password-confirm', () => {
    let experiment;
    let experimentGroupingRules;

    beforeEach(() => {
      experiment = new Experiment();
      experimentGroupingRules = {
        choose: () => 'signupPasswordConfirm'
      };
    });

    describe('choose', () => {
      it('delegates to uniformChoice', () => {
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');

        assert.equal(experiment.choose({
          experimentGroupingRules,
          uniqueUserId: 'user-id'
        }), 'control');
        assert.isTrue(experiment.uniformChoice.calledOnce);
        assert.isTrue(experiment.uniformChoice.calledWith(['control', 'treatment'], 'user-id'));
      });
    });
  });
});
