/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import Experiment from 'lib/experiments/grouping-rules/signup-code';

describe('lib/experiments/grouping-rules/signup-code', () => {
  describe('choose', () => {
    let account;
    let experiment;
    let subject;

    beforeEach(() => {
      account = new Account();
      experiment = new Experiment();
      subject = {
        account,
        experimentGroupingRules: {},
        isSignupCodeSupported: true,
        service: null,
        uniqueUserId: 'user-id',
      };
    });

    it('returns false experiment not enabled', () => {
      subject = {
        isSignupCodeSupported: false,
      };
      assert.equal(experiment.choose(subject), false);
    });

    it('returns treatment experiment when enabled', () => {
      assert.equal(experiment.choose(subject), 'treatment');
    });
  });
});
