/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Account = require('models/account');
const Experiment = require('lib/experiments/grouping-rules/password-strength');

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
        langDirection: 'rtl',
        uniqueUserId: 'user-id'
      };
    });

    it('designF is rolled out for everyone', () => {
      assert.equal(experiment.choose(subject), 'designF');
    });

  });
});
