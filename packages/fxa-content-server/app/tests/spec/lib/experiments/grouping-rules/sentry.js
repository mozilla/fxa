/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/sentry');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/sentry', () => {
    let experiment;

    before(() => {
      experiment = new Experiment();
    });

    describe('sampleRate', () => {
      it('returns 1 for development', () => {
        assert.equal(Experiment.sampleRate('development'), 1);
      });

      it('returns 0.3 for everyone else', () => {
        assert.equal(Experiment.sampleRate('production'), 0.3);
      });
    });

    describe('choose', () => {
      it('delegates to bernoulliTrial', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);

        assert.isTrue(experiment.choose({ env: 'production', uniqueUserId: 'user-id' }));
        assert.isTrue(experiment.bernoulliTrial.calledOnce);
        assert.isTrue(experiment.bernoulliTrial.calledWith(0.3, 'user-id'));
      });
    });
  });
});
