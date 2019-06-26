/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/is-sampled-user';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/is-sampled-user', () => {
  let experiment;

  before(() => {
    experiment = new Experiment();
  });

  describe('sampleRate', () => {
    it('returns 1 for development', () => {
      assert.equal(Experiment.sampleRate({ env: 'development' }), 1);
    });

    it('returns 0.1 for everyone else', () => {
      assert.equal(Experiment.sampleRate({ env: 'production' }), 0.1);
    });
  });

  describe('choose', () => {
    beforeEach(() => {
      sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);
    });

    afterEach(() => {
      experiment.bernoulliTrial.restore();
    });

    it('delegates to bernoulliTrial', () => {
      assert.isTrue(
        experiment.choose({ env: 'production', uniqueUserId: 'user-id' })
      );
      assert.isTrue(experiment.bernoulliTrial.calledOnce);
      assert.isTrue(experiment.bernoulliTrial.calledWith(0.1, 'user-id'));
    });

    it('passes sampleRate as 1 if env is development', () => {
      experiment.choose({ env: 'development', uniqueUserId: 'wibble' });
      assert.equal(experiment.bernoulliTrial.callCount, 1);
      assert.equal(experiment.bernoulliTrial.args[0][0], 1);
    });

    it('gives precedence to featureFlags', () => {
      experiment.choose({
        env: 'production',
        featureFlags: {
          metricsSampleRate: 0,
        },
        uniqueUserId: 'wibble',
      });
      assert.equal(experiment.bernoulliTrial.callCount, 1);
      assert.equal(experiment.bernoulliTrial.args[0][0], 0);
    });
  });
});
