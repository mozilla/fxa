/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/email-first';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/email-first', () => {
  let experiment;
  let experimentGroupingRules;
  let sandbox;

  before(() => {
    experiment = new Experiment();

    experimentGroupingRules = {
      choose(experimentName) {
        if (experimentName === 'isSampledUser') {
          return true;
        }
        return false;
      },
    };
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('choose', () => {
    it('returns `false` if prereqs not met', () => {
      assert.isFalse(experiment.choose());
      assert.isFalse(experiment.choose({}));
      assert.isFalse(experiment.choose({ uniqueUserId: 'user-id' }));
    });

    it('returns `false` if `isEmailFirstSupported=false`', () => {
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules,
          isEmailFirstSupported: false,
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns chooses some experiment ', () => {
      sandbox.stub(experiment, 'bernoulliTrial').callsFake(() => true);

      assert.ok(
        experiment.choose({
          env: 'development',
          experimentGroupingRules,
          isEmailFirstSupported: true,
          uniqueUserId: 'user-id',
        })
      );
    });
  });
});
