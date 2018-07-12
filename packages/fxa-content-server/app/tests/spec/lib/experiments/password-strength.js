/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Notifier from 'lib/channels/notifier';
import PasswordStrenghExperiment from 'lib/experiments/password-strength';
import sinon from 'sinon';

describe('lib/experiments/password-strength', () => {
  let experiment;
  let notifier;

  beforeEach(() => {
    notifier = new Notifier();
    experiment = new PasswordStrenghExperiment();
    experiment.initialize('passwordStrength', {
      groupType: 'designF',
      metrics: {
        logEvent: sinon.spy(),
        logExperiment: sinon.spy(),
      },
      notifier
    });

    sinon.stub(experiment, 'logEvent');
  });

  describe('password.error', () => {
    it('handles PASSWORD_REQUIRED', () => {
      notifier.trigger('password.error', AuthErrors.toError('PASSWORD_REQUIRED'));

      assert.isTrue(experiment.logEvent.calledTwice);
      assert.equal(experiment.logEvent.args[0][0], 'blocked');
      assert.equal(experiment.logEvent.args[1][0], 'missing');
    });

    it('handles PASSWORD_TOO_SHORT', () => {
      notifier.trigger('password.error', AuthErrors.toError('PASSWORD_TOO_SHORT'));

      assert.isTrue(experiment.logEvent.calledTwice);
      assert.equal(experiment.logEvent.args[0][0], 'blocked');
      assert.equal(experiment.logEvent.args[1][0], 'too_short');
    });

    it('handles PASSWORD_SAME_AS_EMAIL', () => {
      notifier.trigger('password.error', AuthErrors.toError('PASSWORD_SAME_AS_EMAIL'));

      assert.isTrue(experiment.logEvent.calledTwice);
      assert.equal(experiment.logEvent.args[0][0], 'blocked');
      assert.equal(experiment.logEvent.args[1][0], 'email');
    });

    it('handles PASSWORD_TOO_COMMON', () => {
      notifier.trigger('password.error', AuthErrors.toError('PASSWORD_TOO_COMMON'));

      assert.isTrue(experiment.logEvent.calledTwice);
      assert.equal(experiment.logEvent.args[0][0], 'blocked');
      assert.equal(experiment.logEvent.args[1][0], 'common');
    });
  });

  it('account.created saves `account.created`', () => {
    notifier.trigger('account.created');

    assert.isTrue(experiment.logEvent.calledOnceWith('account.created'));
  });
});
