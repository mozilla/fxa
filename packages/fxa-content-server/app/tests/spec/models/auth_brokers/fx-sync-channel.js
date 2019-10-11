/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import FxSyncChannelAuthenticationBroker from 'models/auth_brokers/fx-sync-channel';
import NullChannel from 'lib/channels/null';
import sinon from 'sinon';
import User from 'models/user';
import Relier from 'models/reliers/relier';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-sync-channel', () => {
  let account;
  let broker;
  let relier;
  let channelMock;
  let user;
  let windowMock;

  function createAuthBroker(options = {}) {
    broker = new FxSyncChannelAuthenticationBroker(
      _.extend(
        {
          channel: channelMock,
          commands: {
            CAN_LINK_ACCOUNT: 'can_link_account',
            CHANGE_PASSWORD: 'change_password',
            DELETE_ACCOUNT: 'delete_account',
            LOADED: 'loaded',
            LOGIN: 'login',
            /*
        SYNC_PREFERENCES: 'sync_preferences' // Removed in issue #4250
        */
            VERIFIED: 'verified',
          },
          window: windowMock,
          relier,
        },
        options
      )
    );
  }

  beforeEach(() => {
    windowMock = new WindowMock();
    channelMock = new NullChannel();
    channelMock.send = sinon.spy(() => {
      return Promise.resolve();
    });
    relier = new Relier();

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

  it('has the `signup` capability by default', () => {
    assert.isTrue(broker.hasCapability('signup'));
  });

  it('does not have the `reuseExistingSession` capability by default', () => {
    assert.isFalse(broker.hasCapability('reuseExistingSession'));
  });

  it('has the `handleSignedInNotification` capability by default', () => {
    assert.isTrue(broker.hasCapability('handleSignedInNotification'));
  });

  it('has the `emailVerificationMarketingSnippet` capability by default', () => {
    assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
  });

  describe('afterLoaded', () => {
    it('sends a `loaded` message', () => {
      return broker.afterLoaded().then(() => {
        assert.isTrue(channelMock.send.calledWith('loaded'));
      });
    });
  });

  describe('beforeSignIn', () => {
    it('is happy if the user clicks `yes`', () => {
      channelMock.request = sinon.spy(() => Promise.resolve({ ok: true }));

      return broker.beforeSignIn(account).then(() => {
        assert.isTrue(channelMock.request.calledOnce);
        assert.isTrue(channelMock.request.calledWith('can_link_account'));
      });
    });

    it('does not repeat can_link_account requests for the same user', () => {
      channelMock.request = sinon.spy(() => Promise.resolve({ ok: true }));

      return broker
        .beforeSignIn(account)
        .then(() => broker.beforeSignIn(account))
        .then(() => {
          assert.isTrue(channelMock.request.calledOnce);
          assert.isTrue(channelMock.request.calledWith('can_link_account'));
        });
    });

    it('does repeat can_link_account requests for different users', () => {
      channelMock.request = sinon.spy(() => Promise.resolve({ ok: true }));

      const account2 = user.initAccount({
        email: 'testuser2@testuser.com',
      });

      return broker
        .beforeSignIn(account)
        .then(() => broker.beforeSignIn(account2))
        .then(() => {
          assert.equal(channelMock.request.callCount, 2);
          assert.equal(channelMock.request.args[0][0], 'can_link_account');
          assert.equal(channelMock.request.args[1][0], 'can_link_account');
        });
    });

    it('throws a USER_CANCELED_LOGIN error if user rejects', () => {
      channelMock.request = sinon.spy(() => {
        return Promise.resolve({ data: {} });
      });

      return broker.beforeSignIn(account).then(assert.fail, function(err) {
        assert.isTrue(AuthErrors.is(err, 'USER_CANCELED_LOGIN'));
        assert.isTrue(channelMock.request.calledWith('can_link_account'));
      });
    });

    it('swallows errors returned by the browser', () => {
      channelMock.request = sinon.spy(() => {
        return Promise.reject(new Error('uh oh'));
      });

      sinon.spy(console, 'error');

      return broker.beforeSignIn(account).then(() => {
        assert.isTrue(console.error.called);
        console.error.restore();
      });
    });
  });

  describe('_notifyRelierOfLogin', () => {
    // verified will be auto-populated if not in the account.
    const requiredAccountFields = _.without(
      FxSyncChannelAuthenticationBroker.REQUIRED_LOGIN_FIELDS,
      'verified'
    );

    requiredAccountFields.forEach(function(fieldName) {
      it(`does not send a \`login\` message if the account does not have \`${fieldName}\``, () => {
        account.unset(fieldName);
        return broker._notifyRelierOfLogin(account).then(() => {
          assert.isFalse(channelMock.send.called);
        });
      });

      it(`does not send a \`login\` message if \`${fieldName}\` is undefined`, () => {
        account.set(fieldName, undefined);
        return broker._notifyRelierOfLogin(account).then(() => {
          assert.isFalse(channelMock.send.called);
        });
      });
    });

    it('sends a `login` message to the channel using current account data', () => {
      return broker._notifyRelierOfLogin(account).then(() => {
        assert.isTrue(channelMock.send.calledWith('login'));

        const data = channelMock.send.args[0][1];
        assert.sameMembers(data.declinedSyncEngines, ['addons']);
        assert.equal(data.email, 'testuser@testuser.com');
        assert.equal(data.keyFetchToken, 'key-fetch-token');
        assert.sameMembers(data.offeredSyncEngines, [
          'tabs',
          'addons',
          'creditcards',
          'addresses',
        ]);
        assert.equal(data.sessionToken, 'session-token');
        assert.equal(data.uid, 'uid');
        assert.equal(data.unwrapBKey, 'unwrap-b-key');
        assert.isFalse(data.verified);
        assert.isFalse(data.verifiedCanLinkAccount);
      });
    });

    it('tells the window not to re-verify if the user can link accounts if the question has already been asked', () => {
      channelMock.send = sinon.spy(function(message) {
        if (message === 'can_link_account') {
          return Promise.resolve({ ok: true });
        } else if (message === 'login') {
          return Promise.resolve();
        }
      });

      return broker
        .beforeSignIn(account)
        .then(() => {
          return broker._notifyRelierOfLogin(account);
        })
        .then(() => {
          assert.equal(channelMock.send.args[0][0], 'can_link_account');
          const data = channelMock.send.args[1][1];
          assert.equal(data.email, 'testuser@testuser.com');
          assert.isFalse(data.verified);
          assert.isTrue(data.verifiedCanLinkAccount);
          assert.equal(channelMock.send.args[1][0], 'login');
        });
    });

    it('indicates whether the account is verified', () => {
      // set account as verified
      account.set('verified', true);

      channelMock.send = sinon.spy(function(message) {
        if (message === 'can_link_account') {
          return Promise.resolve({ ok: true });
        } else if (message === 'login') {
          return Promise.resolve();
        }
      });

      return broker
        .beforeSignIn(account)
        .then(() => {
          return broker._notifyRelierOfLogin(account);
        })
        .then(() => {
          const data = channelMock.send.args[1][1];
          assert.isTrue(data.verified);
        });
    });
  });

  describe('afterSignIn', () => {
    it('notifies the channel of login, does not halt by default', () => {
      account.set({
        declinedSyncEngines: ['bookmarks', 'passwords'],
        keyFetchToken: 'key_fetch_token',
        sessionToken: 'session_token',
        sessionTokenContext: 'sync',
        uid: 'uid',
        unwrapBKey: 'unwrap_b_key',
        verified: true,
      });

      return broker.afterSignIn(account).then(function(result) {
        const args = channelMock.send.args[0];
        assert.equal(args[0], 'login');
        assert.deepEqual(args[1].declinedSyncEngines, [
          'bookmarks',
          'passwords',
        ]);
        assert.equal(args[1].email, 'testuser@testuser.com');
        assert.equal(args[1].sessionToken, 'session_token');
        assert.equal(args[1].uid, 'uid');
        assert.equal(args[1].unwrapBKey, 'unwrap_b_key');
        assert.equal(args[1].verified, true);
        assert.isUndefined(args[1].sessionTokenContext);

        assert.isUndefined(result.halt);
      });
    });
  });

  describe('beforeSignUpConfirmationPoll', () => {
    it('notifies the channel of login, does not halt the flow by default', () => {
      return broker.beforeSignUpConfirmationPoll(account).then(result => {
        assert.isTrue(channelMock.send.calledOnce);
        assert.isTrue(channelMock.send.calledWith('login'));
        assert.isUndefined(result.halt);
      });
    });
  });

  describe('afterSignInConfirmationPoll', () => {
    describe('browser does not support `sendAfterSignInConfirmationPollNotice`', () => {
      it('notifies the channel of login, does not halt the flow by default', () => {
        broker.setCapability('sendAfterSignInConfirmationPollNotice', false);
        return broker.afterSignInConfirmationPoll(account).then(result => {
          assert.isFalse(channelMock.send.called);
          assert.ok(result);
        });
      });
    });

    describe('browser supports `sendAfterSignInConfirmationPollNotice`', () => {
      it('notifies the channel of login, does not halt the flow by default', () => {
        broker.setCapability('sendAfterSignInConfirmationPollNotice', true);

        account.set({
          keyFetchToken: 'key_fetch_token',
          sessionToken: 'session_token',
          sessionTokenContext: 'sync',
          uid: 'uid',
          unwrapBKey: 'unwrap_b_key',
          verified: true,
        });

        return broker.afterSignInConfirmationPoll(account).then(result => {
          assert.ok(result);

          assert.isTrue(channelMock.send.calledOnce);
          assert.isTrue(channelMock.send.calledWith('verified'));

          const loginData = channelMock.send.args[0][1];
          assert.equal(loginData.email, 'testuser@testuser.com');
          assert.equal(loginData.sessionToken, 'session_token');
          assert.equal(loginData.uid, 'uid');
          assert.equal(loginData.unwrapBKey, 'unwrap_b_key');
          assert.equal(loginData.verified, true);
        });
      });
    });
  });

  describe('afterSignUpConfirmationPoll', () => {
    describe('browser does not support `sendAfterSignUpConfirmationPollNotice`', () => {
      it('notifies the channel of login, does not halt the flow by default', () => {
        broker.setCapability('sendAfterSignUpConfirmationPollNotice', false);

        return broker.afterSignUpConfirmationPoll(account).then(result => {
          assert.ok(result);
          assert.isTrue(channelMock.send.calledOnce);
          assert.isTrue(channelMock.send.calledWith('login'));
        });
      });
    });

    describe('browser supports `sendAfterSignUpConfirmationPollNotice`', () => {
      it('notifies the channel of login, does not halt the flow by default', () => {
        broker.setCapability('sendAfterSignUpConfirmationPollNotice', true);

        account.set({
          keyFetchToken: 'key_fetch_token',
          sessionToken: 'session_token',
          sessionTokenContext: 'sync',
          uid: 'uid',
          unwrapBKey: 'unwrap_b_key',
          verified: true,
        });

        return broker.afterSignUpConfirmationPoll(account).then(result => {
          assert.ok(result);

          assert.isTrue(channelMock.send.called);
          assert.isTrue(channelMock.send.calledWith('login'));
          assert.isTrue(channelMock.send.calledWith('verified'));

          const loginData = channelMock.send.args[0][1];
          assert.equal(loginData.email, 'testuser@testuser.com');
          assert.equal(loginData.sessionToken, 'session_token');
          assert.equal(loginData.uid, 'uid');
          assert.equal(loginData.unwrapBKey, 'unwrap_b_key');
          assert.equal(loginData.verified, true);
        });
      });
    });
  });

  describe('afterChangePassword', () => {
    it('notifies the channel of change_password with the new login info', () => {
      account.set({
        keyFetchToken: 'key_fetch_token',
        sessionToken: 'session_token',
        sessionTokenContext: 'sync',
        uid: 'uid',
        unwrapBKey: 'unwrap_b_key',
        verified: true,
      });

      return broker.afterChangePassword(account).then(() => {
        const args = channelMock.send.args[0];
        assert.equal(args[0], 'change_password');
        assert.equal(args[1].email, 'testuser@testuser.com');
        assert.equal(args[1].uid, 'uid');
        assert.equal(args[1].sessionToken, 'session_token');
        assert.equal(args[1].unwrapBKey, 'unwrap_b_key');
        assert.equal(args[1].verified, true);
        assert.isUndefined(args[1].sessionTokenContext);
      });
    });
  });

  describe('afterDeleteAccount', () => {
    it('notifies the channel of delete_account', () => {
      account.set('uid', 'uid');

      return broker.afterDeleteAccount(account).then(() => {
        const args = channelMock.send.args[0];
        assert.equal(args[0], 'delete_account');
        assert.equal(args[1].email, 'testuser@testuser.com');
        assert.equal(args[1].uid, 'uid');
      });
    });
  });

  describe('createChannel', () => {
    it('must be overridden', () => {
      assert.throws(() => {
        broker.createChannel();
      }, 'createChannel must be overridden');
    });
  });

  describe('getChannel', () => {
    it('returns an already created channel, if available', () => {
      assert.strictEqual(broker.getChannel(), channelMock);
    });
  });

  describe('getCommand', () => {
    it('throws if commands is not overridden', () => {
      const SubBroker = FxSyncChannelAuthenticationBroker.extend({});
      const subBroker = new SubBroker();
      assert.throws(() => {
        subBroker.getCommand('LOGIN');
      }, 'this.commands must be specified');
    });

    it('throws if a command is not defined', () => {
      assert.throws(() => {
        broker.getCommand('NOT_SPECIFIED');
      }, 'command not found for: NOT_SPECIFIED');
    });

    it('returns a command specified', () => {
      assert.equal(broker.getCommand('LOGIN'), 'login');
    });
  });

  describe('_getLoginData', () => {
    it('formats the login data', () => {
      const loginData = broker._getLoginData(account);
      assert.deepEqual(loginData, {
        declinedSyncEngines: ['addons'],
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        offeredSyncEngines: ['tabs', 'addons', 'creditcards', 'addresses'],
        sessionToken: 'session-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key',
        verified: false,
        verifiedCanLinkAccount: false,
      });
    });

    it('formats the login data for multi-service', () => {
      broker.relier.set('multiService', true);
      const loginData = broker._getLoginData(account);

      assert.deepEqual(loginData, {
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        sessionToken: 'session-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key',
        verified: false,
        services: {
          sync: {
            offeredEngines: ['tabs', 'addons', 'creditcards', 'addresses'],
            declinedEngines: ['addons'],
          },
        },
        verifiedCanLinkAccount: false,
      });
    });

    it('formats the login data for service=sync', () => {
      broker.relier.set('multiService', true);
      broker.relier.set('service', 'sync');
      account.set('offeredSyncEngines', null);
      account.set('declinedSyncEngines', null);

      const loginData = broker._getLoginData(account);

      assert.deepEqual(loginData, {
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        sessionToken: 'session-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key',
        verified: false,
        services: {
          sync: {},
        },
        verifiedCanLinkAccount: false,
      });
    });

    it('formats the login data for multi-service that did not opt-in to sync', () => {
      broker.relier.set('multiService', true);
      broker.relier.set('doNotSync', true);
      const loginData = broker._getLoginData(account);

      assert.deepEqual(loginData, {
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        sessionToken: 'session-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key',
        verified: false,
        services: {},
        verifiedCanLinkAccount: false,
      });
    });
  });
});
