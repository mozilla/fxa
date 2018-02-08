/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const { assert } = require('chai');
  const FxiOSAuthenticationBroker = require('models/auth_brokers/fx-ios-v1');
  const NullChannel = require('lib/channels/null');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  const IMMEDIATE_UNVERIFIED_LOGIN_UA_STRING = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/6.1 Mobile/12F69 Safari/600.1.4'; //eslint-disable-line max-len
  const CHOOSE_WHAT_TO_SYNC_UA_STRING = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/11.0 Mobile/12F69 Safari/600.1.4'; //eslint-disable-line max-len

  describe('models/auth_brokers/fx-ios-v1', () => {
    let broker;
    let channel;
    const loginMessageDelayMS = 250;
    let relier;
    let windowMock;

    function initializeBroker(userAgent) {
      windowMock.navigator.userAgent = userAgent;
      broker = new FxiOSAuthenticationBroker({
        channel: channel,
        loginMessageDelayMS: loginMessageDelayMS,
        relier: relier,
        window: windowMock
      });
      sinon.stub(broker, '_hasRequiredLoginFields').callsFake(() => true);
    }

    beforeEach(() => {
      channel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();
      initializeBroker(IMMEDIATE_UNVERIFIED_LOGIN_UA_STRING);
    });

    describe('capabilities', () => {
      describe('supports chooseWhatToSyncWebV1', () => {
        it('has the expected capabilities and behaviors', () => {
          initializeBroker(CHOOSE_WHAT_TO_SYNC_UA_STRING);

          assert.isTrue(broker.hasCapability('signup'));
          assert.isTrue(broker.hasCapability('handleSignedInNotification'));
          assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
          assert.isTrue(broker.hasCapability('chooseWhatToSyncWebV1'));

          assert.equal(broker.getBehavior('afterSignInConfirmationPoll').type, 'navigate');
          assert.equal(broker.getBehavior('afterSignInConfirmationPoll').endpoint, 'signin_confirmed');
          assert.equal(broker.getBehavior('afterSignUpConfirmationPoll').type, 'navigate');
          assert.equal(broker.getBehavior('afterSignUpConfirmationPoll').endpoint, 'signup_confirmed');
        });
      });
    });

    describe('`broker.fetch` is called', () => {
      beforeEach(() => broker.fetch());

      it('has the expected capabilities', () => {
        assert.isTrue(broker.hasCapability('signup'));
        assert.isFalse(broker.hasCapability('chooseWhatToSyncCheckbox'));
      });

      it('`broker.SIGNUP_DISABLED_REASON` is not set', () => {
        assert.isUndefined(broker.SIGNUP_DISABLED_REASON);
      });
    });

    describe('_notifyRelierOfLogin', () => {
      let account;

      beforeEach(() => {
        sinon.stub(broker, 'send').callsFake(() => Promise.resolve());
        sinon.spy(windowMock, 'setTimeout');
        sinon.spy(windowMock, 'clearTimeout');
        account = new Account({
          uid: 'uid'
        });
      });

      function testLoginSent(triggerLoginCB) {
        return Promise.all([
          broker._notifyRelierOfLogin(account),
          triggerLoginCB && triggerLoginCB()
        ]).then(() => {
          assert.isTrue(broker.send.calledOnce);
          assert.isTrue(broker.send.calledWith('login'));
        });
      }

      describe('verified account', () => {
        it('sends immediately', () => {
          account.set('verified', true);

          return testLoginSent()
            .then(() => {
              assert.isFalse(windowMock.setTimeout.called);
              assert.isFalse(windowMock.clearTimeout.called);
            });
        });
      });

      describe('unverified account', () => {
        it('sends immediately', () => {
          account.set('verified', false);

          return testLoginSent()
            .then(() => {
              assert.isFalse(windowMock.setTimeout.called);
              assert.isFalse(windowMock.clearTimeout.called);
            });
        });
      });

    });
  });
});
