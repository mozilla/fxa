/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Account = require('models/account');
  const Experiment = require('lib/experiments/grouping-rules/connect-another-device-on-signin');

  describe('lib/experiments/grouping-rules/connect-another-device-on-signin', () => {
    let account;
    let experiment;


    before(() => {
      account = new Account();
      experiment = new Experiment();
    });

    describe('choose', () => {
      it('returns false if no subject, or subject.account, or subject.account.email', () => {
        assert.isFalse(experiment.choose());
        assert.isFalse(experiment.choose({}));
        assert.isFalse(experiment.choose({ account: new Account() }));
      });

      it('returns true for test email addresses', () => {
        account.set('email', 'testuser@testuser.com');
        assert.isFalse(experiment.choose({ account }));

        account.set('email', 'testuser@softvision.com');
        assert.equal(experiment.choose({ account }), 'treatment');
        account.set('email', 'testuser@softvision.ro');
        assert.equal(experiment.choose({ account }), 'treatment');
        account.set('email', 'testuser@mozilla.com');
        assert.equal(experiment.choose({ account }), 'treatment');
        account.set('email', 'testuser@mozilla.org');
        assert.equal(experiment.choose({ account }), 'treatment');
      });
    });
  });
});
