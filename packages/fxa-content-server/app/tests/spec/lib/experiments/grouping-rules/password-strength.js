/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Account = require('models/account');
const Experiment = require('lib/experiments/grouping-rules/password-strength');
const sinon = require('sinon');

describe('lib/experiments/grouping-rules/password-strength', () => {
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
        lang: 'en',
        uniqueUserId: 'user-id'
      };
    });

    ['a@mozilla.org', 'a@softvision.com', 'a@softvision.ro', 'a@softvision.com'].forEach((email) => {
      it(`returns 'designF' experiment for ${email} email`, () => {
        subject.account.set('email', email);
        assert.equal(experiment.choose(subject), 'designF');
      });
    });

    it('delegates to uniformChoice if in rollout', () => {
      experiment.ROLLOUT_RATE = 1.0;
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
      experiment.choose(subject);
      assert.isTrue(experiment.uniformChoice.calledOnceWith(['control', 'designF']));
    });

    it('returns false if not in rollout', () => {
      experiment.ROLLOUT_RATE = 0.0;
      assert.isFalse(experiment.choose(subject));
    });

    it('returns false if lang is not en based', () => {
      const deSubject = Object.assign({}, subject, { lang: 'de' });
      experiment.ROLLOUT_RATE = 1.0;
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');

      assert.isFalse(experiment.choose(deSubject));
    });
  });
});
