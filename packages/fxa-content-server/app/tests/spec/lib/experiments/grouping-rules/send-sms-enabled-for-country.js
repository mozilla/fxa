/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Account = require('models/account');
  const Experiment = require('lib/experiments/grouping-rules/send-sms-enabled-for-country');

  describe('lib/experiments/grouping-rules/send-sms-enabled-for-country', () => {
    let account;
    let experiment;

    before(() => {
      account = new Account({});
      experiment = new Experiment();
    });

    it('has the correct number of enabled countries', () => {
      assert.lengthOf(experiment.ENABLED_COUNTRY_LIST, 4);
    });

    describe('choose', () => {
      it('returns true for expected countries', () => {
        assert.isTrue(experiment.choose({ account, country: 'CA' }));
        assert.isTrue(experiment.choose({ account, country: 'GB' }));
        assert.isTrue(experiment.choose({ account, country: 'US' }));
      });

      it('returns true for RO only if an enabled email address', () => {
        account.set('email', 'testuser@testuser.com');
        assert.isFalse(experiment.choose({ account, country: 'RO' }));

        account.set('email', 'testuser@softvision.com');
        assert.isTrue(experiment.choose({ account, country: 'RO' }));
        account.set('email', 'testuser@softvision.ro');
        assert.isTrue(experiment.choose({ account, country: 'RO' }));
        account.set('email', 'testuser@mozilla.com');
        assert.isTrue(experiment.choose({ account, country: 'RO' }));
        account.set('email', 'testuser@mozilla.org');
        assert.isTrue(experiment.choose({ account, country: 'RO' }));
      });
    });
  });
});
