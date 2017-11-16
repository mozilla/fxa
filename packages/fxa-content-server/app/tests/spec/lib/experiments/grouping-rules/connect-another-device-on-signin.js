/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const { assert } = require('chai');
  const Account = require('models/account');
  const Experiment = require('lib/experiments/grouping-rules/connect-another-device-on-signin');
  const sinon = require('sinon');

  describe('lib/experiments/grouping-rules/connect-another-device-on-signin', () => {
    let account;
    let experiment;
    let validSubject;

    beforeEach(() => {
      account = new Account({ email: 'testuser@testuser.com' });
      experiment = new Experiment();
      validSubject = {
        account,
        env: 'production',
        uniqueUserId: 'id'
      };
    });

    describe('choose', () => {
      it('returns false if invalid subject', () => {
        assert.isFalse(experiment.choose());
        assert.isFalse(experiment.choose({}));
        assert.isFalse(experiment.choose(_.omit(validSubject, 'env')));
        assert.isFalse(experiment.choose(_.omit(validSubject, 'uniqueUserId')));
        assert.isFalse(experiment.choose(_.omit(validSubject, 'account')));
        assert.isFalse(experiment.choose(Object.assign({}, validSubject, { account: new Account() })));
      });

      it('returns `treatment` for test email addresses', () => {
        account.set('email', 'testuser@softvision.com');
        assert.equal(experiment.choose(validSubject), 'treatment');
        account.set('email', 'testuser@softvision.ro');
        assert.equal(experiment.choose(validSubject), 'treatment');
        account.set('email', 'testuser@mozilla.com');
        assert.equal(experiment.choose(validSubject), 'treatment');
        account.set('email', 'testuser@mozilla.org');
        assert.equal(experiment.choose(validSubject), 'treatment');
      });

      it('returns a choice if the user is selected for trial', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'foo');

        account.set('email', 'testuser@testuser.com');
        assert.equal(experiment.choose(validSubject), 'foo');

        assert.isTrue(experiment.bernoulliTrial.calledOnce);
        assert.isTrue(experiment.bernoulliTrial.calledWith(Experiment.sampleRate(), 'id'));

        assert.isTrue(experiment.uniformChoice.calledOnce);
        assert.isTrue(experiment.uniformChoice.calledWith(['control', 'treatment'], 'id'));
      });

      it('returns `false` if the user is not chosen for trail', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => false);
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'foo');

        account.set('email', 'testuser@testuser.com');
        assert.isFalse(experiment.choose(validSubject));

        assert.isTrue(experiment.bernoulliTrial.calledOnce);
        assert.isTrue(experiment.bernoulliTrial.calledWith(Experiment.sampleRate(), 'id'));

        assert.isFalse(experiment.uniformChoice.called);
      });
    });
  });
});
