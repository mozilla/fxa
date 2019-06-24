/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import TestHelpers from '../../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/account_recovery/confirm_revoke';

describe('views/settings/account_recovery/confirm_revoke', () => {
  let account,
    broker,
    email,
    notifier,
    relier,
    user,
    view,
    keyExists,
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

    sinon.stub(account, 'deleteRecoveryKey').callsFake(() => {
      return Promise.resolve();
    });

    sinon.stub(account, 'checkRecoveryKeyExists').callsFake(() => {
      return Promise.resolve({ exists: keyExists });
    });

    keyExists = true;
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('should delete recovery key', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'displaySuccess');
        sinon.spy(view, 'navigate');
        return view.validateAndSubmit();
      });
    });

    describe('submit', () => {
      it('calls delete recovery key and navigates', () => {
        assert.equal(view.displaySuccess.callCount, 1);
        assert.equal(
          account.deleteRecoveryKey.callCount,
          1,
          'called delete key'
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
          'success',
          'passes correct args'
        );
        assert.equal(
          view.logFlowEvent.args[0][1],
          'settings.account-recovery.confirm-revoke',
          'passes correct args'
        );
      });
    });
  });

  describe('should cancel delete recovery key', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy(view, 'navigate');
        return view.$('.cancel-button')[0].click();
      });
    });

    it('cancel revoke recovery key and navigates', () => {
      assert.equal(
        account.deleteRecoveryKey.callCount,
        0,
        'did not called delete key'
      );
      assert.equal(
        view.navigate.args[0][0],
        'settings/account_recovery',
        'navigated to account recovery'
      );
    });
  });

  describe('beforeRender', () => {
    describe('should redirect to /settings/account_recovery if no key exists', () => {
      beforeEach(() => {
        view = new View({
          broker,
          notifier,
          relier,
          user,
        });
        sinon.spy(view, 'navigate');
        keyExists = false;
        sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
        return view.render();
      });

      it('redirects correctly', () => {
        assert.equal(
          account.checkRecoveryKeyExists.callCount,
          1,
          'check key status'
        );
        assert.equal(
          view.navigate.args[0][0],
          '/settings/account_recovery',
          'navigated to account recovery'
        );
      });
    });
  });
});
