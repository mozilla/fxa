/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Account = require('models/account');
  const Experiment = require('lib/experiments/grouping-rules/send-sms-install-link');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/send-sms-install-link', () => {
    let account;
    let experiment;

    before(() => {
      account = new Account();
      experiment = new Experiment();
    });

    describe('choose', () => {
      it('returns false if no account or uniqueUserId', () => {
        assert.isFalse(experiment.choose({ account }));
        assert.isFalse(experiment.choose({ uniqueUserId: 'user-id' }));
      });

      describe('email forces `signinCodes`', () => {
        it('returns true', () => {
          account.set('email', 'testuser@softvision.com');
          assert.equal(experiment.choose({ account, uniqueUserId: 'user-id' }), 'signinCodes');
          account.set('email', 'testuser@softvision.ro');
          assert.equal(experiment.choose({ account, uniqueUserId: 'user-id' }), 'signinCodes');
          account.set('email', 'testuser@mozilla.com');
          assert.equal(experiment.choose({ account, uniqueUserId: 'user-id' }), 'signinCodes');
          account.set('email', 'testuser@mozilla.org');
          assert.equal(experiment.choose({ account, uniqueUserId: 'user-id' }), 'signinCodes');
        });
      });

      describe('others', () => {
        it('delegates to uniformChoice', () => {
          sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
          account.set('email', 'testuser@testuser.com');

          assert.equal(experiment.choose({ account, uniqueUserId: 'user-id' }), 'control');
          assert.isTrue(experiment.uniformChoice.calledOnce);
          assert.isTrue(experiment.uniformChoice.calledWith(['control', 'treatment', 'signinCodes'], 'user-id'));
        });
      });
    });
  });
});
