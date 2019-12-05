/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxSyncWebChannelAuthenticationBroker from 'models/auth_brokers/fx-sync-web-channel';
import NullChannel from 'lib/channels/null';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-sync-web-channel', () => {
  let account;
  let broker;
  let channelMock;
  let user;
  let windowMock;

  function createAuthBroker(options = {}) {
    broker = new FxSyncWebChannelAuthenticationBroker({
      channel: channelMock,
      metrics: {
        setViewNamePrefix: sinon.spy(),
      },
      window: windowMock,
      ...options,
    });
  }

  beforeEach(() => {
    windowMock = new WindowMock();
    channelMock = new NullChannel();
    channelMock.send = sinon.spy(() => {
      return Promise.resolve();
    });

    user = new User();
    account = user.initAccount({
      declinedSyncEngines: ['addons'],
      email: 'testuser@testuser.com',
      keyFetchToken: 'key-fetch-token',
      offeredSyncEngines: ['tabs', 'addons', 'creditcards', 'addresses'],
      sessionToken: 'session-token',
      uid: 'uid',
      unwrapBKey: 'unwrap-b-key',
      verified: false,
    });

    createAuthBroker();
  });

  describe('afterCompleteResetPassword', () => {
    beforeEach(() => {
      sinon.spy(broker, '_notifyRelierOfLogin');
    });

    describe('with a verified session and no verificationMethod/verificationReason set', () => {
      it('notifies the relier of the login', () => {
        account.set('verified', true);
        return broker.afterCompleteResetPassword(account).then(behavior => {
          assert.equal(behavior.type, 'null');
          assert.isTrue(broker._notifyRelierOfLogin.calledOnceWith(account));
        });
      });
    });

    describe('with a verified session and verificationMethod/verificationReason set', () => {
      it('does not notifies the relier of the login', () => {
        account.set('verified', true);
        account.set('verificationReason', 'login');
        account.set('verificationMethod', 'email');
        return broker.afterCompleteResetPassword(account).then(behavior => {
          assert.equal(behavior.type, 'null');
          assert.isFalse(broker._notifyRelierOfLogin.calledOnceWith(account));
        });
      });
    });

    describe('with an unverified session', () => {
      it('does not notify the relier of the login', () => {
        account.set('verified', false);
        return broker.afterCompleteResetPassword(account).then(behavior => {
          assert.equal(behavior.type, 'null');
          assert.isFalse(broker._notifyRelierOfLogin.called);
        });
      });
    });
  });

  describe('afterCompleteSignInWithCode', () => {
    beforeEach(() => {
      sinon.spy(broker, '_notifyRelierOfLogin');
      return broker.afterCompleteSignInWithCode(account);
    });

    it('notifies the relier of the login', () => {
      assert.isTrue(broker._notifyRelierOfLogin.calledOnceWith(account));
    });
  });
});
