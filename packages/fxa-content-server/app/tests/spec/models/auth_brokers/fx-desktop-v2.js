/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxDesktopV2AuthenticationBroker from 'models/auth_brokers/fx-desktop-v2';
import NullChannel from 'lib/channels/null';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-desktop-v2', () => {
  let account;
  let broker;
  let channelMock;
  let user;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    channelMock = new NullChannel();
    channelMock.send = () => {
      return Promise.resolve();
    };
    sinon.spy(channelMock, 'send');

    user = new User();
    account = user.initAccount({
      email: 'testuser@testuser.com',
      keyFetchToken: 'key-fetch-token',
      uid: 'uid',
      unwrapBKey: 'unwrap-b-key',
    });

    broker = new FxDesktopV2AuthenticationBroker({
      channel: channelMock,
      window: windowMock,
    });
    sinon.stub(broker, '_hasRequiredLoginFields').callsFake(() => true);
  });

  it('has the expected capabilities', () => {
    assert.isTrue(
      broker.getCapability('browserTransitionsAfterEmailVerification')
    );
    assert.isTrue(broker.getCapability('openWebmailButtonVisible'));
    assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    assert.isTrue(broker.hasCapability('handleSignedInNotification'));
    assert.isTrue(broker.hasCapability('signup'));
  });

  describe('createChannel', () => {
    it('creates a channel', () => {
      assert.ok(broker.createChannel());
    });
  });

  describe('afterLoaded', () => {
    it('sends a `fxaccounts:loaded` message', () => {
      return broker.afterLoaded().then(() => {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:loaded'));
      });
    });
  });

  describe('afterForceAuth', () => {
    it('notifies the channel with `fxaccounts:login`, halts if brower transitions', () => {
      return broker.afterForceAuth(account).then(function(result) {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
        assert.equal(result.type, 'halt-if-browser-transitions');
      });
    });
  });

  describe('afterSignIn', () => {
    it('notifies the channel with `fxaccounts:login`, halts if browser transitions', () => {
      return broker.afterSignIn(account).then(function(result) {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
        assert.equal(result.type, 'halt-if-browser-transitions');
      });
    });
  });

  describe('afterSignInConfirmationPoll', () => {
    it('halts if browser transitions', () => {
      return broker.afterSignInConfirmationPoll(account).then(result => {
        assert.equal(result.type, 'halt-if-browser-transitions');
      });
    });
  });

  describe('beforeSignUpConfirmationPoll', () => {
    it('notifies the channel with `fxaccounts:login`, halts if browser transitions', () => {
      return broker.beforeSignUpConfirmationPoll(account).then(result => {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
      });
    });
  });

  describe('afterSignUpConfirmationPoll', () => {
    it('halts if browser transitions', () => {
      return broker.afterSignUpConfirmationPoll(account).then(result => {
        assert.equal(result.type, 'halt-if-browser-transitions');
      });
    });
  });

  describe('afterResetPasswordConfirmationPoll', () => {
    let result;

    beforeEach(() => {
      // With Fx's E10s enabled, the account data only contains an
      // unwrapBKey and keyFetchToken, not enough to sign in the user.
      // Luckily, with WebChannels, the verification page can send
      // the data to the browser and everybody is happy.
      account = user.initAccount({
        keyFetchToken: 'key-fetch-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key',
      });

      broker._hasRequiredLoginFields.restore();
      sinon.stub(broker, '_hasRequiredLoginFields').callsFake(() => false);

      return broker
        .afterResetPasswordConfirmationPoll(account)
        .then(function(_result) {
          result = _result;
        });
    });

    it('does not notify the channel, halts if browser transitions', () => {
      assert.isFalse(channelMock.send.called);
      assert.equal(result.type, 'halt-if-browser-transitions');
    });
  });

  describe('afterChangePassword', () => {
    it('does not notify channel with `fxaccounts:change_password`', () => {
      // The message is sent over the WebChannel by the global WebChannel, no
      // need ot send it from within the auth broker too.
      return broker.afterChangePassword(account).then(() => {
        assert.isFalse(
          channelMock.send.calledWith('fxaccounts:change_password')
        );
      });
    });
  });

  describe('afterDeleteAccount', () => {
    it('notifies the channel with `fxaccounts:delete_account`', () => {
      account.set('uid', 'uid');

      return broker.afterDeleteAccount(account).then(() => {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:delete_account'));
      });
    });
  });

  describe('fetch', () => {
    it('sets `browserTransitionsAfterEmailVerification` to false if not about:accounts', () => {
      sinon.stub(broker.environment, 'isAboutAccounts').callsFake(() => false);

      return broker.fetch().then(() => {
        assert.isFalse(
          broker.getCapability('browserTransitionsAfterEmailVerification')
        );
      });
    });
  });
});
