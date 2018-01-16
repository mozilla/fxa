/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const {assert} = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/token-code');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/token-code', () => {
    describe('choose', () => {
      let experiment;
      let subject;

      beforeEach(() => {
        experiment = new Experiment();
        subject = {
          experimentGroupingRules: {},
          isTokenCodeSupported: true,
          uniqueUserId: 'user-id'
        };
      });

      it('returns false experiment not enabled', () => {
        subject = {
          isTokenCodeSupported: false
        };
        assert.equal(experiment.choose(subject), false);
      });

      it('returns false if client not defined in config', () => {
        subject.clientId = 'invalidClientId';
        assert.equal(experiment.choose(subject), false);
      });

      it('returns false if client rollout is 0', () => {
        subject.clientId = '3a1f53aabe17ba32';
        assert.equal(experiment.choose(subject), false);
      });

      it('delegates to uniformChoice', () => {
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
        subject.clientId = 'dcdb5ae7add825d2';
        experiment.choose(subject);
        assert.isTrue(experiment.uniformChoice.calledOnce);
        assert.isTrue(experiment.uniformChoice.calledWith(['control', 'treatment'], 'user-id'));
      });
    });
  });
});
