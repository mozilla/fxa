/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {assert} from 'chai';
import Account from 'models/account';
import Experiment from 'lib/experiments/grouping-rules/recovery-key';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/recovery-key', () => {
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
        showAccountRecovery: false,
        uniqueUserId: 'user-id'
      };
    });

    it('returns `treatment` experiment if broker has capability', () => {
      subject.showAccountRecovery = true;
      assert.equal(experiment.choose(subject), 'treatment');
    });

    ['a@mozilla.org', 'a@softvision.com', 'a@softvision.ro', 'a@softvision.com'].forEach((email) => {
      it(`returns 'treatment' experiment for ${email} email`, () => {
        subject.account.set('email', email);
        assert.equal(experiment.choose(subject), 'treatment');
      });
    });

    it('delegates to uniformChoice if in rollout', () => {
      experiment.ROLLOUT_RATE = 1.0;
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
      experiment.choose(subject);
      assert.isTrue(experiment.uniformChoice.calledOnce);
      assert.isTrue(experiment.uniformChoice.calledWith(['treatment'], 'user-id'));
    });

    it('returns false if not in rollout', () => {
      experiment.ROLLOUT_RATE = 0.0;
      assert.equal(experiment.choose(subject), false);
    });
  });
});
