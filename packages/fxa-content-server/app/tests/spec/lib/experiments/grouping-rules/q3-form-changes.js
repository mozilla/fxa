/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Account = require('models/account');
  const Experiment = require('lib/experiments/grouping-rules/q3-form-changes');

  describe('lib/experiments/grouping-rules/q3-form-changes', () => {
    let account;
    let experiment;

    before(() => {
      account = new Account();
      experiment = new Experiment();
    });

    describe('choose', () => {
      it('returns false if no subject or uniqueUserId', () => {
        assert.isFalse(experiment.choose());
        assert.isFalse(experiment.choose({}));
      });

      it('returns experiment if forceExperiment', () => {
        assert.equal(experiment.choose({
          account,
          forceExperimentGroup: 'control',
          uniqueUserId: 'user-id'
        }), 'disabledButtonState');
      });

      it('returns chooses some group ', () => {
        assert.ok(experiment.choose({
          account,
          uniqueUserId: 'user-id'
        }));
      });

    });
  });
});
