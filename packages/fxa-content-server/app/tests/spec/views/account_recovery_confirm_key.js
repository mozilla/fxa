/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import AuthErrors from 'lib/auth-errors';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/account_recovery_confirm_key';
import WindowMock from '../../mocks/window';

describe('views/account_recovery_confirm_key', () => {
  let account,
    broker,
    email,
    metrics,
    notifier,
    relier,
    sentryMetrics,
    user,
    view,
    windowMock;
  const uid = '63f75aaebc74f912b552da15852fe570';
  const code = 'dea0fae1abc2fab3bed4dec5eec6ace7@testuser.com';
  const accountResetToken =
    '237af7c984607e23fadfc0f75d214ac50555d2e5c50acecae6c184d0ebe202c9';
  const token = 'feed';
  const recoveryKey = 'AS20HV8FM6VATAAX';
  const recoveryKeyId = '63f75aaebc74f912b552da15852fe570';
  const options = {
    accountResetWithRecoveryKey: true,
  };
  const keys = {
    kB: '2e2a6e11551c53db48b742fb4734760c9adce6e75e9610449baebacb2cd52fe3',
  };

  function initView() {
    view = new View({
      broker,
      metrics,
      notifier,
      relier,
      user,
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.spy(view, 'logFlowEvent');

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    account = user.initAccount();
    relier = new Relier({
      service: 'sync',
      serviceName: 'Firefox Sync',
    });
    windowMock = new WindowMock();
    windowMock.location.search = `?code=${code}&email=${email}&token=${token}&uid=${uid}`;

    sinon.stub(account, 'passwordForgotVerifyCode').callsFake(() => {
      return Promise.resolve({ accountResetToken });
    });

    sinon.stub(account, 'getRecoveryBundle').callsFake(() => {
      return Promise.resolve({
        keys,
        recoveryKeyId,
      });
    });
  });

  it('renders view', () => {
    return initView().then(() => {
      assert.lengthOf(view.$('#account-recovery-confirm-password'), 1);
      assert.include(
        view.$('#fxa-recovery-key-confirm').text(),
        'Firefox Sync'
      );
      assert.lengthOf(view.$('#recovery-key'), 1);
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('.lost-recovery-key'), 1);
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'navigate');
        view.$('#recovery-key').val(recoveryKey);
        return view.submit();
      });
    });

    it('should call passwordForgotVerifyCode', () => {
      assert.equal(
        account.passwordForgotVerifyCode.callCount,
        1,
        'called create forgot verify code'
      );
      const args = account.passwordForgotVerifyCode.args[0];
      assert.equal(args[0], code, 'called with code');
      assert.equal(args[1], token, 'called with token');
      assert.deepEqual(args[2], options, 'called with options');
    });

    it('should call getRecoveryBundle', () => {
      assert.equal(
        account.getRecoveryBundle.callCount,
        1,
        'called get recovery bundle'
      );
      const args = account.getRecoveryBundle.args[0];
      assert.equal(args[0], uid, 'called with code');
      assert.equal(args[1], recoveryKey, 'called with token');
    });

    it('should navigate to `/account_recovery_reset_password` with successful key', () => {
      const args = view.navigate.args[0];
      assert.equal(
        args[0],
        '/account_recovery_reset_password',
        'navigated to complete password'
      );
      assert.equal(
        args[1].accountResetToken,
        accountResetToken,
        'accountResetToken set'
      );
      assert.equal(args[1].email, email, 'email set');
      assert.equal(args[1].kB, keys.kB, 'kB set');
      assert.equal(args[1].recoveryKeyId, recoveryKeyId, 'recoveryKeyId set');
    });

    it('should log flowEvents', () => {
      assert.equal(
        view.logFlowEvent.args[0][0],
        'success',
        'passes correct args'
      );
      assert.equal(
        view.logFlowEvent.args[0][1],
        'account-recovery-confirm-key',
        'passes correct args'
      );
    });
  });

  describe('should set token expired and re-render', () => {
    beforeEach(() => {
      return initView().then(() => {
        account = user.initAccount();
        sinon.spy(view._verificationInfo, 'markExpired');
        sinon.spy(view, 'render');
        sinon.stub(account, 'passwordForgotVerifyCode').callsFake(() => {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });
        return view.submit();
      });
    });

    it('should mark token expired and re-render', () => {
      assert.equal(
        view._verificationInfo.markExpired.callCount,
        1,
        'verification marked expired'
      );
      assert.equal(view.render.callCount, 1, 'render called correctly');
    });
  });

  describe('should display error with invalid recovery key', () => {
    beforeEach(() => {
      return initView().then(() => {
        account = user.initAccount();
        sinon.spy(view, 'showValidationError');
        sinon.stub(account, 'passwordForgotVerifyCode').callsFake(() => {
          return Promise.resolve({ accountResetToken });
        });
        sinon.stub(account, 'getRecoveryBundle').callsFake(() => {
          return Promise.reject(AuthErrors.toError('INVALID_RECOVERY_KEY'));
        });
        return view.submit();
      });
    });

    it('displays tooltip error', () => {
      assert.equal(
        view.showValidationError.callCount,
        1,
        'showValidationError called correctly'
      );
      assert.equal(
        view.logFlowEvent.args[0][0],
        'invalidRecoveryKey',
        'passes correct args'
      );
      assert.equal(
        view.logFlowEvent.args[0][1],
        'account-recovery-confirm-key',
        'passes correct args'
      );
    });
  });

  describe('should navigate to regular password reset with lost recovery key', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'navigate');
        view.$('.lost-recovery-key').click();
      });
    });

    it('should navigate to password reset ', () => {
      const args = view.navigate.args[0];
      assert.equal(
        args[0],
        '/complete_reset_password',
        'navigated to complete password'
      );
      assert.equal(args[1].lostRecoveryKey, true, 'lostRecoveryKey set');
    });
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });
});
