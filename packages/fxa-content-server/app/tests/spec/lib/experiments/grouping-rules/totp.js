/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {assert} = require('chai');
const Account = require('models/account');
const Experiment = require('lib/experiments/grouping-rules/totp');
const sinon = require('sinon');

describe('lib/experiments/grouping-rules/totp', () => {
  describe('choose', () => {
    let account;
    let experiment;
    let subject;

    beforeEach(() => {
      account = new Account();
      experiment = new Experiment();
      subject = {
        account: account,
        experimentGroupingRules: {},
        showTwoStepAuthentication: false,
        uniqueUserId: 'user-id'
      };
    });

    it('returns true experiment if broker has capability', () => {
      subject.showTwoStepAuthentication = true;
      assert.equal(experiment.choose(subject), true);
    });

    ['a@mozilla.org', 'a@softvision.com', 'a@softvision.ro', 'a@softvision.com'].forEach((email) => {
      it(`returns true experiment for ${email} email`, () => {
        subject.account.set('email', email);
        assert.equal(experiment.choose(subject), true);
      });
    });

    it('delegates to uniformChoice if in rollout', () => {
      experiment.ROLLOUT_RATE = 1.0;
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
      experiment.choose(subject);
      assert.isTrue(experiment.uniformChoice.calledOnce);
      assert.isTrue(experiment.uniformChoice.calledWith(['control', 'treatment'], 'user-id'));
    });

    it('returns false if not in rollout', () => {
      experiment.ROLLOUT_RATE = 0.0;
      assert.equal(experiment.choose(subject), false);
    });
  });
});
