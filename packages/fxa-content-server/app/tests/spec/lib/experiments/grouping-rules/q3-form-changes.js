/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import Experiment from 'lib/experiments/grouping-rules/q3-form-changes';

describe('lib/experiments/grouping-rules/q3-form-changes', () => {
  let account;
  let experiment;

  before(() => {
    account = new Account();
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('throws', () => {
      assert.throws(() => {
        experiment.choose({
          account,
          uniqueUserId: 'user-id'
        });
      });
    });
  });
});
