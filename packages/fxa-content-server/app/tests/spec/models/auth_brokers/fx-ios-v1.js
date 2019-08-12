/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxiOSAuthenticationBroker from 'models/auth_brokers/fx-ios-v1';
import NullChannel from 'lib/channels/null';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

const IMMEDIATE_UNVERIFIED_LOGIN_UA_STRING =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/6.1 Mobile/12F69 Safari/600.1.4'; //eslint-disable-line max-len

describe('models/auth_brokers/fx-ios-v1', () => {
  let account;
  let broker;
  let channel;
  const loginMessageDelayMS = 250;
  let relier;
  let user;
  let windowMock;
  let sandbox;

  function initializeBroker(userAgent) {
    windowMock.navigator.userAgent = userAgent;
    broker = new FxiOSAuthenticationBroker({
      channel: channel,
      loginMessageDelayMS: loginMessageDelayMS,
      relier: relier,
      window: windowMock,
    });

    user = new User();
    account = user.initAccount({
      email: 'testuser@testuser.com',
      keyFetchToken: 'key-fetch-token',
      uid: 'uid',
      unwrapBKey: 'unwrap-b-key',
    });
    sandbox.stub(broker, '_hasRequiredLoginFields').callsFake(() => true);
  }

  beforeEach(() => {
    channel = new NullChannel();
    relier = new Relier();
    windowMock = new WindowMock();
    sandbox = sinon.sandbox.create();
    initializeBroker(IMMEDIATE_UNVERIFIED_LOGIN_UA_STRING);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('`broker.fetch` is called', () => {
    beforeEach(() => broker.fetch());

    it('has the expected capabilities', () => {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('`broker.SIGNUP_DISABLED_REASON` is not set', () => {
      assert.isUndefined(broker.SIGNUP_DISABLED_REASON);
    });
  });

  describe('_notifyRelierOfLogin', () => {
    beforeEach(() => {
      sandbox.stub(broker, 'send').callsFake(() => Promise.resolve());
      sandbox.spy(windowMock, 'setTimeout');
      sandbox.spy(windowMock, 'clearTimeout');
    });

    function testLoginSent(triggerLoginCB) {
      return Promise.all([
        broker._notifyRelierOfLogin(account),
        triggerLoginCB && triggerLoginCB(),
      ]).then(() => {
        assert.isTrue(broker.send.calledOnce);
        assert.isTrue(broker.send.calledWith('login'));
      });
    }

    describe('verified account', () => {
      it('sends immediately', () => {
        account.set('verified', true);

        return testLoginSent().then(() => {
          assert.isFalse(windowMock.setTimeout.called);
          assert.isFalse(windowMock.clearTimeout.called);
        });
      });
    });

    describe('unverified account', () => {
      it('sends immediately', () => {
        account.set('verified', false);

        return testLoginSent().then(() => {
          assert.isFalse(windowMock.setTimeout.called);
          assert.isFalse(windowMock.clearTimeout.called);
        });
      });
    });

    describe('afterCompleteSignInWithCode', () => {
      beforeEach(() => {
        sandbox.spy(broker, 'afterCompleteSignInWithCode');
        sandbox.spy(broker, '_notifyRelierOfLogin');
        sandbox.spy(
          FxiOSAuthenticationBroker.prototype,
          'afterCompleteSignInWithCode'
        );

        return broker.afterCompleteSignInWithCode(account);
      });

      it('broker calls correct methods', () => {
        assert.isTrue(broker.afterCompleteSignInWithCode.called);
        assert.isTrue(broker._notifyRelierOfLogin.called);
      });
    });
  });

  describe('createChannel', () => {
    it('creates a channel', () => {
      assert.ok(broker.createChannel());
    });
  });

  describe('channel errors', () => {
    it('are propagated outwards', () => {
      var channel = broker.createChannel();

      var errorSpy = sinon.spy();
      broker.on('error', errorSpy);

      var error = new Error('malformed message');
      channel.trigger('error', error);
      assert.isTrue(errorSpy.calledWith(error));
    });
  });

  describe('afterLoaded', () => {
    it('sends a `loaded` message', () => {
      sinon.spy(broker, 'send');

      return broker.afterLoaded().then(() => {
        assert.isTrue(broker.send.calledWith('loaded'));
      });
    });
  });

  describe('afterSignIn', () => {
    it('notifies the channel of login, halts by default', () => {
      sinon.spy(broker, 'send');

      return broker.afterSignIn(account).then(result => {
        assert.isTrue(broker.send.calledWith('login'));
        assert.isTrue(result.halt);
      });
    });
  });

  describe('afterSignInConfirmationPoll', () => {
    it('navigates to `signin_confirmed` by default', () => {
      return broker.afterSignInConfirmationPoll(account).then(() => {
        assert.equal(
          broker.getBehavior('afterSignInConfirmationPoll').type,
          'navigate'
        );
        assert.equal(
          broker.getBehavior('afterSignInConfirmationPoll').endpoint,
          'signin_confirmed'
        );
      });
    });
  });

  describe('beforeSignUpConfirmationPoll', () => {
    it('notifies the channel of login', () => {
      sinon.spy(broker, 'send');

      return broker.beforeSignUpConfirmationPoll(account).then(() => {
        assert.isTrue(broker.send.calledWith('login'));
      });
    });
  });

  describe('afterSignUpConfirmationPoll', () => {
    it('navigates to `signup_confirmed` by default', () => {
      return broker.afterSignUpConfirmationPoll(account).then(() => {
        assert.equal(
          broker.getBehavior('afterSignUpConfirmationPoll').type,
          'navigate'
        );
        assert.equal(
          broker.getBehavior('afterSignUpConfirmationPoll').endpoint,
          'signup_confirmed'
        );
      });
    });
  });

  describe('afterResetPasswordConfirmationPoll', () => {
    it('notifies the channel of login, halts by default', () => {
      sinon.spy(broker, 'send');

      return broker.afterResetPasswordConfirmationPoll(account).then(result => {
        assert.isTrue(broker.send.calledWith('login'));
        assert.isTrue(broker.send.calledOnce);

        assert.isTrue(result.halt);
      });
    });
  });

  describe('afterChangePassword', () => {
    it('notifies the channel of change_password with the new login info', () => {
      sinon.spy(broker, 'send');

      return broker.afterChangePassword(account).then(() => {
        assert.isTrue(broker.send.calledWith('change_password'));
      });
    });
  });

  describe('afterDeleteAccount', () => {
    it('notifies the channel of delete_account', () => {
      sinon.spy(broker, 'send');

      account.set('uid', 'uid');

      return broker.afterDeleteAccount(account).then(() => {
        assert.isTrue(broker.send.calledWith('delete_account'));
      });
    });
  });
});
