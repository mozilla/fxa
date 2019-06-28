/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import TestHelpers from '../../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/account_recovery/confirm_password';

describe('views/settings/account_recovery/confirm_password', () => {
  let account,
    broker,
    email,
    notifier,
    relier,
    user,
    view,
    invalidPassword,
    parentView;
  const UID = '123';

  function initView() {
    view = new View({
      broker,
      notifier,
      parentView,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.spy(view, 'remove');
    sinon.spy(view, 'logFlowEvent');

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    parentView = new BaseView();
    user = new User();
    account = user.initAccount({
      email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();

    sinon.stub(account, 'createRecoveryBundle').callsFake(() => {
      if (invalidPassword) {
        return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
      }
      return Promise.resolve({
        recoveryKey: '123123',
      });
    });

    invalidPassword = false;
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('should confirm password', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'navigate');
      });
    });

    describe('should submit', () => {
      beforeEach(() => {
        sinon.spy(view, 'displaySuccess');
        view.$('#password').val('abcdasdf');
        return view.validateAndSubmit();
      });

      it('submit', () => {
        assert.equal(view.displaySuccess.callCount, 1);
        assert.equal(view.$('.email')[0].innerText, email, 'correct email set');
        assert.equal(
          account.createRecoveryBundle.callCount,
          1,
          'called create recovery bundle'
        );
        assert.equal(
          view.navigate.args[0][0],
          'settings/account_recovery/recovery_key',
          'navigated to account recovery'
        );
        assert.equal(
          view.navigate.args[0][1].recoveryKey,
          '123123',
          'passes correct args'
        );
        assert.equal(
          view.logFlowEvent.args[0][0],
          'success',
          'passes correct args'
        );
        assert.equal(
          view.logFlowEvent.args[0][1],
          'settings.account-recovery.confirm-password',
          'passes correct args'
        );
      });
    });

    describe('should display invalid password', () => {
      beforeEach(() => {
        view.$('#password').val('');
        sinon.stub(view, 'submit').callsFake(() => Promise.resolve());
        sinon.spy(view, 'showValidationError');
        return view.validateAndSubmit().then(assert.fail, () => {});
      });

      it('displays a tooltip, does not call submit', () => {
        assert.isTrue(view.showValidationError.called);
        assert.isFalse(view.submit.called);
      });
    });
  });

  describe('should cancel confirm password', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'navigate');
        return view.$('.cancel-link')[0].click();
      });
    });

    it('cancel password confirm and navigates', () => {
      assert.equal(
        account.createRecoveryBundle.callCount,
        0,
        'did not create recovery key'
      );
      assert.equal(
        view.navigate.args[0][0],
        'settings/account_recovery',
        'navigated to account recovery'
      );
      assert.equal(
        view.navigate.args[0][1].hasRecoveryKey,
        false,
        'passes correct args'
      );
      assert.equal(
        view.logFlowEvent.args[0][0],
        'cancel',
        'passes correct args'
      );
      assert.equal(
        view.logFlowEvent.args[0][1],
        'settings.account-recovery.confirm-password',
        'passes correct args'
      );
    });
  });
});
