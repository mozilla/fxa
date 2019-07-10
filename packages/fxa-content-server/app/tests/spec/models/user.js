/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Constants from 'lib/constants';
import helpers from '../../lib/helpers';
import AttachedClient from 'models/attached-client';
import FxaClient from 'lib/fxa-client';
import Notifier from 'lib/channels/notifier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import Storage from 'lib/storage';
import User from 'models/user';

const { createUid } = helpers;

const CODE = 'verification code';
const EMAIL = 'a@a.com';
const SESSION_TOKEN = 'session token';
const UUID = '12345678-1234-1234-1234-1234567890ab';

describe('models/user', function() {
  let fxaClientMock;
  let metrics;
  let notifier;
  let sentryMetrics;
  let storage;
  let user;

  function testRemoteSignInMessageSent(account) {
    assert.equal(notifier.triggerRemote.callCount, 1);
    const args = notifier.triggerRemote.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], notifier.COMMANDS.SIGNED_IN);

    assert.deepEqual(
      args[1],
      account.pick(
        'keyFetchToken',
        'sessionToken',
        'sessionTokenContext',
        'uid',
        'unwrapBKey'
      )
    );
  }

  beforeEach(function() {
    fxaClientMock = new FxaClient();
    metrics = {
      logError: sinon.spy(),
      logNumStoredAccounts: sinon.spy(),
      setFlowModel: sinon.spy(),
    };
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    storage = new Storage();
    user = new User({
      fxaClient: fxaClientMock,
      metrics: metrics,
      notifier: notifier,
      sentryMetrics: sentryMetrics,
      storage,
      uniqueUserId: UUID,
    });
  });

  afterEach(function() {
    user = null;
  });

  describe('initAccount', function() {
    let account;
    const email = 'a@a.com';

    beforeEach(function() {
      account = user.initAccount({
        email: email,
      });
    });

    it('creates an account', function() {
      assert.equal(account.get('email'), email);
      assert.deepEqual(account.pick('email'), { email: email });
      assert.equal(account._notifier, notifier);
    });
  });

  it('isSyncAccount', function() {
    const account = user.initAccount({
      email: EMAIL,
      sessionToken: 'session token',
      sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
    });

    assert.isTrue(user.isSyncAccount(account));
  });

  it('getAccountByUid', function() {
    return user.setAccount({ email: EMAIL, uid: 'uid' }).then(function() {
      assert.equal(user.getAccountByUid('uid').get('uid'), 'uid');
    });
  });

  it('getAccountByEmail', function() {
    return user.setAccount({ email: EMAIL, uid: 'uid' }).then(function() {
      assert.equal(user.getAccountByEmail(EMAIL).get('email'), EMAIL);
    });
  });

  it('getAccountByEmail gets the last added if there are multiple', function() {
    return user
      .setAccount({ email: EMAIL, uid: 'uid' })
      .then(function() {
        return user.setAccount({ email: EMAIL, uid: 'uid2' });
      })
      .then(function() {
        return user.setAccount({ email: EMAIL, uid: 'uid3' });
      })
      .then(function() {
        assert.equal(user.getAccountByEmail(EMAIL).get('uid'), 'uid3');
      });
  });

  describe('sessionStatus', () => {
    it('checks and updates passed in account', () => {
      const account = user.initAccount({
        email: 'TESTUSER@testuser.com',
        uid: 'uid',
      });
      sinon.spy(user, 'getSignedInAccount');
      sinon.spy(user, 'setAccount');
      sinon
        .stub(account, 'sessionStatus')
        .callsFake(() => Promise.resolve({ email: 'testuser@testuser.com' }));

      return user.sessionStatus(account).then(signedInAccount => {
        assert.isFalse(user.getSignedInAccount.called);
        assert.isTrue(user.setAccount.calledOnce);
        assert.isTrue(user.setAccount.calledWith(account));
        assert.strictEqual(signedInAccount, account);
      });
    });

    it('checks and updates the currently signed in account if no account given', () => {
      const account = user.initAccount({
        email: 'TESTUSER@testuser.com',
        uid: 'uid',
      });
      sinon.stub(user, 'getSignedInAccount').callsFake(() => account);
      sinon.spy(user, 'setAccount');
      sinon
        .stub(account, 'sessionStatus')
        .callsFake(() => Promise.resolve({ email: 'testuser@testuser.com' }));

      return user.sessionStatus().then(signedInAccount => {
        assert.isTrue(user.setAccount.calledOnce);
        assert.isTrue(user.setAccount.calledWith(account));
        assert.strictEqual(signedInAccount, account);
      });
    });

    it('propagates errors from the Account', () => {
      const account = user.initAccount({ email: EMAIL, uid: 'uid' });
      sinon.stub(user, 'getSignedInAccount').callsFake(() => account);
      sinon
        .stub(account, 'sessionStatus')
        .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

      return user.sessionStatus().then(assert.fail, err => {
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });
    });
  });

  it('getSignedInAccount', function() {
    const account = user.initAccount({
      email: EMAIL,
      uid: 'uid',
    });
    return user.setSignedInAccount(account).then(function() {
      assert.equal(user.getSignedInAccount().get('uid'), account.get('uid'));
    });
  });

  describe('getChooserAccount', () => {
    const NON_SYNC_ACCOUNT = {
      email: `non-sync-${EMAIL}`,
      sessionToken: 'sessionToken',
      uid: 'uid',
    };

    const NON_SYNC_ACCOUNT_NO_EMAIL = {
      sessionToken: 'sessionToken',
      uid: 'uid',
    };

    const NON_SYNC_ACCOUNT_NO_SESSION_TOKEN = {
      email: `non-sync-${EMAIL}`,
      uid: 'uid',
    };

    const SYNC_ACCOUNT = {
      email: `sync-${EMAIL}`,
      sessionToken: 'sessionToken',
      sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
      uid: 'uid2',
    };

    const SYNC_ACCOUNT_NO_EMAIL = {
      sessionToken: 'sessionToken',
      sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
      uid: 'uid2',
    };

    const SYNC_ACCOUNT_NO_SESSION_TOKEN = {
      email: `sync-${EMAIL}`,
      uid: 'uid2',
    };

    const SIGNIN_CODE_ACCOUNT = {
      email: `signin-code-${EMAIL}`,
    };

    function compareAccounts(account, expected) {
      const accountData = account.pick(
        'email',
        'sessionToken',
        'sessionTokenContext',
        'uid'
      );

      // Get rid of undefined properties
      for (var key in accountData) {
        if (typeof accountData[key] === 'undefined') {
          delete accountData[key];
        }
      }

      assert.deepEqual(accountData, expected);
    }

    describe('signinCode used', () => {
      it('returns the account data accessible via the signinCode', () => {
        user.set('signinCodeAccount', user.initAccount(SIGNIN_CODE_ACCOUNT));

        let account = user.getChooserAccount();
        compareAccounts(account, SIGNIN_CODE_ACCOUNT);

        // clears the signinCodeAccount too.
        user.removeAllAccounts();
        account = user.getChooserAccount();
        assert.isTrue(account.isDefault());
      });
    });

    describe('signinCode never used, valid stored Sync account', () => {
      it('returns the Sync account', () => {
        return user
          .setSignedInAccount(SYNC_ACCOUNT)
          .then(() => {
            compareAccounts(user.getChooserAccount(), SYNC_ACCOUNT);

            return user.setSignedInAccount(NON_SYNC_ACCOUNT);
          })
          .then(() => {
            // Sync account is still preferred.
            compareAccounts(user.getChooserAccount(), SYNC_ACCOUNT);
          });
      });
    });

    describe('signinCode never used, invalid stored Sync account', () => {
      it('returns the Sync account', () => {
        return user
          .setSignedInAccount(SYNC_ACCOUNT_NO_EMAIL)
          .then(() => {
            assert.isTrue(user.getChooserAccount().isDefault());
            return user.setSignedInAccount(SYNC_ACCOUNT_NO_SESSION_TOKEN);
          })
          .then(() => {
            assert.isTrue(user.getChooserAccount().isDefault());
          });
      });
    });

    describe('signinCode never used, no stored Sync account, signed in account', () => {
      it('returns the signed in account', () => {
        return user.setSignedInAccount(NON_SYNC_ACCOUNT).then(() => {
          compareAccounts(user.getChooserAccount(), NON_SYNC_ACCOUNT);
        });
      });
    });

    describe('signinCode never used, no stored Sync account, invalid signed in account', () => {
      it('returns the signed in account', () => {
        return user
          .setSignedInAccount(NON_SYNC_ACCOUNT_NO_EMAIL)
          .then(() => {
            assert.isTrue(user.getChooserAccount().isDefault());
            return user.setSignedInAccount(NON_SYNC_ACCOUNT_NO_SESSION_TOKEN);
          })
          .then(() => {
            assert.isTrue(user.getChooserAccount().isDefault());
          });
      });
    });

    describe('signinCode never used, no stored Sync account, no signed in account', () => {
      it('returns a default account', () => {
        assert.isTrue(user.getChooserAccount().isDefault());
      });
    });
  });

  it('clearSignedInAccount', function() {
    sinon.spy(notifier, 'triggerRemote');
    const uid = createUid();
    return user.setSignedInAccount({ email: EMAIL, uid }).then(function() {
      user.clearSignedInAccount();
      assert.isTrue(user.getSignedInAccount().isDefault());
      assert.equal(user.getAccountByUid(uid).get('uid'), uid);
      assert.equal(notifier.triggerRemote.callCount, 1);
      var args = notifier.triggerRemote.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], notifier.COMMANDS.SIGNED_OUT);
    });
  });

  it('removeAllAccounts', function() {
    return user
      .setAccount({ email: EMAIL, uid: 'uid' })
      .then(function() {
        return user.setAccount({ email: EMAIL, uid: 'uid2' });
      })
      .then(function() {
        user.removeAllAccounts();
        assert.isTrue(user.getAccountByUid('uid').isDefault());
        assert.isTrue(user.getAccountByUid('uid2').isDefault());
      });
  });

  it('removeAccount', function() {
    var account = { email: EMAIL, uid: createUid() };
    return user.setSignedInAccount(account).then(function() {
      user.removeAccount(account);
      assert.isTrue(user.getAccountByUid(account.uid).isDefault());
      assert.isTrue(user.getSignedInAccount().isDefault());
    });
  });

  describe('deleteAccount', function() {
    var account;

    beforeEach(function() {
      account = user.initAccount({
        email: 'testuser@testuser.com',
        uid: createUid(),
      });

      sinon.stub(account, 'destroy').callsFake(function() {
        return Promise.resolve();
      });

      sinon.spy(notifier, 'triggerAll');

      user._persistAccount(account);

      return user.deleteAccount(account, 'password');
    });

    it('should delegate to the account to remove itself', function() {
      assert.isTrue(account.destroy.calledOnce);
      assert.isTrue(account.destroy.calledWith('password'));
    });

    it('should remove the account from storage', function() {
      assert.isNull(user._getAccount(account.get('uid')));
    });

    it('should trigger a notification', function() {
      assert.isTrue(
        notifier.triggerAll.calledWith(notifier.COMMANDS.DELETE, {
          uid: account.get('uid'),
        })
      );
    });
  });

  it('setAccount', function() {
    return user.setAccount({ email: EMAIL, uid: 'uid' });
  });

  describe('_persistAccount', () => {
    let account;

    beforeEach(() => {
      sinon.spy(storage, 'set');

      account = new Account({
        keyFetchToken: 'key-fetch-token',
        sessionToken: 'session-token',
      });
    });

    describe('account has uid', () => {
      it('writes the account to storage', () => {
        account.set('uid', 'uid');
        user._persistAccount(account);

        assert.isTrue(storage.set.calledOnce);
        assert.isTrue(storage.set.calledWith('accounts'));

        const accountData = storage.get('accounts');
        assert.deepEqual(accountData.uid, {
          // keyFetchToken does not persistent
          sessionToken: 'session-token',
          uid: 'uid',
        });

        assert.isFalse(metrics.logError.called);
      });
    });

    describe('account does not have a uid', () => {
      it('does not write the account to storage, logs an error', () => {
        account.unset('uid');
        user._persistAccount(account);

        assert.isFalse(storage.set.called);
        assert.isTrue(metrics.logError.calledOnce);
        const err = metrics.logError.args[0][0];
        assert.isTrue(AuthErrors.is(err, 'ACCOUNT_HAS_NO_UID'));
        assert.equal(err.context, 'persistAccount');
      });
    });
  });

  it('setSignedInAccount', function() {
    sinon.spy(notifier, 'triggerRemote');
    return user
      .setSignedInAccount({ email: EMAIL, uid: 'uid' })
      .then(function() {
        assert.equal(user.getSignedInAccount().get('uid'), 'uid');
        assert.equal(notifier.triggerRemote.callCount, 0);
      });
  });

  describe('in memory caching of signed in account', function() {
    it('getSignedInAccount returns same instance from setSignedInAccount', function() {
      var account = user.initAccount({ email: EMAIL, uid: 'uid' });
      return user.setSignedInAccount(account).then(function() {
        assert.strictEqual(user.getSignedInAccount(), account);
      });
    });

    it('account is not cached in memory if setAccount fails', function() {
      var account = user.initAccount({ email: EMAIL, uid: 'uid' });

      return user
        .setSignedInAccount({ email: EMAIL, uid: 'foo' })
        .then(function() {
          sinon.stub(user, 'setAccount').callsFake(function() {
            return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });
          return user.setSignedInAccount(account);
        })
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          assert.isFalse(user.getSignedInAccount() === account);
        });
    });

    it('getSignedInAccount returns same instance when called multiple times', function() {
      return user
        .setSignedInAccount({ email: EMAIL, uid: 'uid' })
        .then(function() {
          assert.strictEqual(
            user.getSignedInAccount(),
            user.getSignedInAccount()
          );
        });
    });

    it('getSignedInAccount returns same instance as getChooserAccount', function() {
      return user
        .setSignedInAccount({ email: EMAIL, sessionToken: 'token', uid: 'uid' })
        .then(() => {
          assert.strictEqual(
            user.getSignedInAccount(),
            user.getChooserAccount()
          );
        });
    });

    it('getSignedInAccount does not return previously cached account after clearSignedInAccount', function() {
      var account = user.initAccount({ email: EMAIL, uid: createUid() });
      return user.setSignedInAccount(account).then(function() {
        user.clearSignedInAccount();
        assert.isFalse(user.getSignedInAccount() === account);
      });
    });

    it('getSignedInAccount does not return previously cached account after removeAccount', function() {
      var account = user.initAccount({ email: EMAIL, uid: createUid() });
      return user.setSignedInAccount(account).then(function() {
        user.removeAccount(account);
        assert.isFalse(user.getSignedInAccount() === account);
      });
    });

    it('getSignedInAccount does not return previously cached account after removeAllAccounts', function() {
      var account = user.initAccount({ email: EMAIL, uid: 'uid' });
      return user.setSignedInAccount(account).then(function() {
        user.removeAllAccounts();
        assert.isFalse(user.getSignedInAccount() === account);
      });
    });

    it('getSignedInAccount does not return previously cached account after setSignedInAccountByUid with different account uid', function() {
      var uid = 'abc123';
      var account = user.initAccount({ email: EMAIL, uid: 'uid' });

      return user.setSignedInAccount(account).then(function() {
        return user.setAccount({ email: EMAIL, uid: uid }).then(function() {
          user.setSignedInAccountByUid(uid);
          assert.isFalse(user.getSignedInAccount() === account);
        });
      });
    });

    it('getSignedInAccount returns previously cached account after setSignedInAccountByUid with same account uid', function() {
      var account = user.initAccount({ email: EMAIL, uid: 'uid' });

      return user.setSignedInAccount(account).then(function() {
        user.setSignedInAccountByUid('uid');
        assert.strictEqual(user.getSignedInAccount(), account);
      });
    });
  });

  it('setSignedInAccountByUid works if account is already cached', function() {
    var uid = 'abc123';
    sinon.spy(notifier, 'triggerRemote');
    return user
      .setSignedInAccount({ email: EMAIL, uid: 'uid' })
      .then(function() {
        return user.setAccount({ email: EMAIL, uid: uid }).then(function() {
          user.setSignedInAccountByUid(uid);
          assert.equal(user.getSignedInAccount().get('uid'), uid);
          assert.equal(notifier.triggerRemote.callCount, 0);
        });
      });
  });

  it('setSignedInAccountByUid does nothing if account is not cached', function() {
    var uid = 'abc123';

    return user
      .setSignedInAccount({ email: EMAIL, uid: 'uid' })
      .then(function() {
        user.setSignedInAccountByUid(uid);
        assert.equal(user.getSignedInAccount().get('uid'), 'uid');
      });
  });

  describe('removeAccountsWithInvalidUid', () => {
    const ACCOUNT_DATA = {
      '': { lastLogin: 1488298413174 },
      uid1: { lastLogin: 1488298413174, uid: 'uid1' },
      undefined: { lastLogin: 1488298413174 },
    };
    beforeEach(() => {
      storage.set('accounts', ACCOUNT_DATA);

      return user.removeAccountsWithInvalidUid();
    });

    it('removes accounts w/ empty or undefined uid', () => {
      /*
       * Remove accounts with empty or `undefined` uids.
       * See #4769. w/ e10s enabled, post account reset,
       * a phantom account with a uid of `undefined` was
       * being written to localStorage. These accounts
       * are garbage, get rid of them.
       */
      const accounts = user._accounts();
      assert.lengthOf(Object.keys(accounts), 1);
      assert.ok(accounts.uid1);
      assert.deepEqual(accounts.uid1, ACCOUNT_DATA.uid1);
    });
  });

  describe('signInAccount', function() {
    var account;
    var relierMock = {};

    describe('with a new account', function() {
      beforeEach(function() {
        account = user.initAccount({
          email: 'testuser@testuser.com',
          sessionToken: 'sessionToken',
          sessionTokenContext: 'sessionTokenContext',
          uid: createUid(),
          verified: true,
        });

        sinon.stub(account, 'signIn').callsFake(() => Promise.resolve());
        sinon.stub(account, 'retrySignUp').callsFake(() => Promise.resolve());
        sinon.spy(user, 'setSignedInAccount');
        sinon.spy(notifier, 'triggerRemote');

        return user.signInAccount(account, 'password', relierMock, {
          resume: 'resume token',
        });
      });

      it('delegates to the account', function() {
        assert.isTrue(
          account.signIn.calledWith('password', relierMock, {
            resume: 'resume token',
          })
        );
      });

      it('saves the account', function() {
        assert.isTrue(user.setSignedInAccount.calledWith(account));
      });

      it('notifies remote listeners of the signin', function() {
        testRemoteSignInMessageSent(account);
      });

      it('did not call account.retrySignUp', function() {
        assert.strictEqual(account.retrySignUp.callCount, 0);
      });

      it('signOutAccount behaves correctly', () => {
        sinon.stub(account, 'signOut').callsFake(() => Promise.resolve());
        sinon.spy(user, 'clearSignedInAccount');

        return user.signOutAccount(account).then(() => {
          assert.equal(account.signOut.callCount, 1);
          assert.lengthOf(account.signOut.args[0], 0);

          assert.equal(user.clearSignedInAccount.callCount, 1);
          assert.lengthOf(user.clearSignedInAccount.args[0], 0);
        });
      });
    });

    describe('with an already saved account', function() {
      beforeEach(function() {
        account = user.initAccount({
          displayName: 'fx user',
          email: 'testuser@testuser.com',
          sessionToken: 'sessionToken',
          sessionTokenContext: 'sessionTokenContext',
          uid: createUid(),
        });

        var oldAccount = user.initAccount({
          email: EMAIL,
          permissions: { foo: { bar: true } },
          uid: 'uid2',
        });

        sinon.stub(account, 'signIn').callsFake(function() {
          return Promise.resolve();
        });

        sinon.stub(account, 'get').callsFake(function(property) {
          if (property === 'verified') {
            return true;
          }

          return property;
        });

        sinon.stub(account, 'retrySignUp').callsFake(function() {
          return Promise.resolve();
        });

        sinon.stub(user, 'setSignedInAccount').callsFake(function() {
          return Promise.resolve(account);
        });

        sinon.stub(user, 'getAccountByUid').callsFake(function() {
          return oldAccount;
        });

        return user.signInAccount(account, 'password', relierMock);
      });

      it('merges data with old and new account', function() {
        var updatedAccount = user.setSignedInAccount.args[0][0];
        assert.deepEqual(updatedAccount.getClientPermissions('foo'), {
          bar: true,
        });
        assert.equal(updatedAccount.get('displayName'), 'fx user');
      });

      it('did not call account.retrySignUp', function() {
        assert.strictEqual(account.retrySignUp.callCount, 0);
      });
    });
  });

  describe('signUpAccount', function() {
    var account;
    var relierMock = {};

    beforeEach(function() {
      account = user.initAccount({ email: EMAIL, uid: createUid() });
      sinon.stub(account, 'signUp').callsFake(function() {
        return Promise.resolve();
      });
      sinon.stub(user, 'setSignedInAccount').callsFake(function() {
        return Promise.resolve();
      });

      return user.signUpAccount(account, 'password', relierMock, {
        resume: 'resume token',
      });
    });

    it('delegates to the account', function() {
      assert.isTrue(
        account.signUp.calledWith('password', relierMock, {
          resume: 'resume token',
        })
      );
    });

    it('stores the updated data', function() {
      assert.isTrue(user.setSignedInAccount.calledWith(account));
    });
  });

  describe('signOutAccount', () => {
    let account;

    beforeEach(() => {
      sinon.stub(user, 'removeAccount').callsFake(() => {});
      account = user.initAccount({ email: EMAIL, uid: createUid() });
    });

    describe('request completes as expected', () => {
      it('delegates to the account, clears account info', () => {
        sinon.stub(account, 'signOut').callsFake(() => Promise.resolve());

        return user.signOutAccount(account).then(() => {
          assert.isTrue(account.signOut.calledOnce);
          assert.isTrue(user.removeAccount.calledOnce);
          assert.isTrue(user.removeAccount.calledWith(account));
        });
      });
    });

    describe('request fails', () => {
      it('delegates to the account, clears account info anyways', () => {
        sinon.stub(account, 'signOut').callsFake(() => {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return user.signOutAccount(account).then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
          assert.isTrue(account.signOut.calledOnce);
          assert.isTrue(user.removeAccount.calledOnce);
          assert.isTrue(user.removeAccount.calledWith(account));
        });
      });
    });
  });

  describe('completeAccountSignUp', function() {
    var account;

    beforeEach(function() {
      account = user.initAccount({
        email: 'testuser@testuser.com',
        sessionToken: 'sessionToken',
        sessionTokenContext: 'sessionTokenContext',
        uid: createUid(),
      });
      sinon.spy(notifier, 'triggerRemote');
    });

    describe('without a basket error', function() {
      beforeEach(function() {
        sinon.stub(account, 'verifySignUp').callsFake(() => Promise.resolve());
      });

      describe('without a sessionToken', function() {
        beforeEach(function() {
          account.unset('sessionToken');
          account.unset('sessionTokenContext');
          return user.completeAccountSignUp(account, CODE);
        });

        it('delegates to the account', function() {
          assert.isTrue(account.verifySignUp.calledWith(CODE));
        });

        it('does not notify remotes of signin', function() {
          assert.isFalse(notifier.triggerRemote.called);
        });
      });

      describe('with a sessionToken', function() {
        beforeEach(function() {
          return user.completeAccountSignUp(account, CODE);
        });

        it('notifies remotes of signin', function() {
          testRemoteSignInMessageSent(account);
        });
      });
    });
  });

  it('changeAccountPassword changes the account password, notifies the browser', function() {
    const uid = createUid();
    const account = user.initAccount({
      email: 'testuser@testuser.com',
      keyFetchToken: 'old-key-fetch-token',
      sessionToken: 'old-session-token',
      sessionTokenContext: 'fx_desktop_v3',
      uid,
      unwrapBKey: 'old-unwrap-b-key',
    });
    const newPassword = 'new_password';
    const oldPassword = 'password';
    const relierMock = {};

    sinon.stub(account, 'changePassword').callsFake(() => {
      account.set({
        keyFetchToken: 'new-key-fetch-token',
        sessionToken: 'new-session-token',
        unwrapBKey: 'new-unwrap-b-key',
        verified: true,
      });

      return Promise.resolve();
    });
    sinon.stub(user, 'setSignedInAccount').callsFake(account => {
      return Promise.resolve(account);
    });
    sinon.spy(notifier, 'triggerRemote');

    return user
      .changeAccountPassword(account, oldPassword, newPassword, relierMock)
      .then(() => {
        assert.isTrue(
          account.changePassword.calledWith(
            oldPassword,
            newPassword,
            relierMock
          )
        );

        assert.isTrue(user.setSignedInAccount.calledWith(account));

        assert.equal(notifier.triggerRemote.callCount, 1);
        const changePasswordCommand = notifier.COMMANDS.CHANGE_PASSWORD;

        const args = notifier.triggerRemote.args[0];
        assert.equal(args[0], changePasswordCommand);

        assert.deepEqual(args[1], {
          email: 'testuser@testuser.com',
          keyFetchToken: 'new-key-fetch-token',
          sessionToken: 'new-session-token',
          uid,
          unwrapBKey: 'new-unwrap-b-key',
          verified: true,
        });
      });
  });

  describe('completeAccountPasswordReset', function() {
    var account;
    var relierMock = {};

    beforeEach(function() {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: 'sessionToken',
        sessionTokenContext: 'sessionTokenContext',
        uid: createUid(),
      });

      sinon.stub(account, 'completePasswordReset').callsFake(function() {
        return Promise.resolve();
      });

      sinon.stub(user, 'setSignedInAccount').callsFake(function(account) {
        return Promise.resolve(account);
      });

      sinon.spy(notifier, 'triggerRemote');

      return user.completeAccountPasswordReset(
        account,
        'password',
        'token',
        'code',
        relierMock,
        EMAIL
      );
    });

    it('delegates to the account', function() {
      assert.isTrue(
        account.completePasswordReset.calledWith(
          'password',
          'token',
          'code',
          relierMock,
          EMAIL
        )
      );
    });

    it('saves the updated account data', function() {
      assert.isTrue(user.setSignedInAccount.calledWith(account));
    });

    it('notifies remote listeners', function() {
      testRemoteSignInMessageSent(account);
    });
  });

  describe('completeAccountPasswordResetWithRecoveryKey', () => {
    let account;
    const relierMock = {};
    const recoveryKeyId = 'recoveryKeyId';
    const kB = 'kB';

    beforeEach(() => {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: 'sessionToken',
        sessionTokenContext: 'sessionTokenContext',
        uid: createUid(),
      });

      sinon
        .stub(account, 'resetPasswordWithRecoveryKey')
        .callsFake(() => Promise.resolve());
      sinon
        .stub(user, 'setSignedInAccount')
        .callsFake(account => Promise.resolve(account));
      sinon.spy(notifier, 'triggerRemote');

      return user.completeAccountPasswordResetWithRecoveryKey(
        account,
        'password',
        'token',
        recoveryKeyId,
        kB,
        relierMock,
        EMAIL
      );
    });

    it('delegates to the account', () => {
      assert.isTrue(
        account.resetPasswordWithRecoveryKey.calledWith(
          'token',
          'password',
          recoveryKeyId,
          kB,
          relierMock,
          EMAIL
        )
      );
    });

    it('saves the updated account data', () => {
      assert.isTrue(user.setSignedInAccount.calledWith(account));
    });

    it('notifies remote listeners', () => {
      testRemoteSignInMessageSent(account);
    });
  });

  describe('pickResumeTokenInfo', function() {
    it('returns the uniqueUserId', function() {
      var resumeTokenInfo = user.pickResumeTokenInfo();
      assert.equal(resumeTokenInfo.uniqueUserId, UUID);
    });
  });

  describe('fetchAccountAttachedClients', function() {
    var account;

    beforeEach(function() {
      account = user.initAccount({});
      sinon.stub(account, 'fetchAttachedClients').callsFake(function() {
        return Promise.resolve();
      });
      return user.fetchAccountAttachedClients(account);
    });

    it('delegates to the account to fetch devices', function() {
      assert.isTrue(account.fetchAttachedClients.calledOnce);
    });
  });

  describe('destroyAccountAttachedClient', function() {
    var account;
    var client;

    beforeEach(() => {
      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: 'sessionTokenContext',
        uid: createUid(),
      });

      sinon
        .stub(account, 'destroyAttachedClient')
        .callsFake(() => Promise.resolve());
      sinon.stub(account, 'fetch').callsFake(() => Promise.resolve());
      sinon.spy(user, 'removeAccount');

      client = new AttachedClient({
        deviceId: 'device-1',
        name: 'alpha',
        sessionTokenId: 'session token',
      });

      return user.setSignedInAccount(account);
    });

    describe('with a remote device', () => {
      beforeEach(() => {
        client.set('isCurrentSession', false);
        return user.destroyAccountAttachedClient(account, client);
      });

      it('delegates to the account, does not remove the account', () => {
        assert.isTrue(account.destroyAttachedClient.calledWith(client));
        assert.isFalse(user.removeAccount.called);
      });
    });

    describe("with the current account's current session", () => {
      beforeEach(() => {
        sinon.stub(user, 'isSignedInAccount').callsFake(function() {
          return true;
        });
        client.set('isCurrentSession', true);
        return user.destroyAccountAttachedClient(account, client);
      });

      it('delegates to the account', () => {
        assert.isTrue(account.destroyAttachedClient.calledWith(client));
      });

      it('removes the account from local storage', () => {
        assert.isTrue(user.isSignedInAccount.calledWith(account));
        assert.isTrue(user.removeAccount.calledOnceWith(account));
      });
    });
  });

  describe('checkAccountUidExists', function() {
    var account;
    var exists;

    beforeEach(function() {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: SESSION_TOKEN,
        uid: UUID,
      });

      sinon.stub(account, 'checkUidExists').callsFake(function() {
        return Promise.resolve(false);
      });

      sinon.spy(user, 'removeAccount');

      return user.checkAccountUidExists(account).then(function(_exists) {
        exists = _exists;
      });
    });

    it('delegates to the account model', function() {
      assert.isTrue(account.checkUidExists.called);
    });

    it('removes the account if it does not exist', function() {
      assert.isTrue(user.removeAccount.calledWith(account));
    });

    it('returns a promise that resolves to whether the account exists', function() {
      assert.isFalse(exists);
    });
  });

  describe('checkAccountEmailExists', function() {
    var account;
    var exists;

    beforeEach(function() {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: SESSION_TOKEN,
        uid: UUID,
      });

      sinon.stub(account, 'checkEmailExists').callsFake(function() {
        return Promise.resolve(false);
      });

      sinon.spy(user, 'removeAccount');

      return user.checkAccountEmailExists(account).then(function(_exists) {
        exists = _exists;
      });
    });

    it('delegates to the account model', function() {
      assert.isTrue(account.checkEmailExists.called);
    });

    it('removes the account if it does not exist', function() {
      assert.isTrue(user.removeAccount.calledWith(account));
    });

    it('returns a promise that resolves to whether the account exists', function() {
      assert.isFalse(exists);
    });
  });

  describe('rejectAccountUnblockCode', () => {
    const UNBLOCK_CODE = '12345678';
    let account;

    beforeEach(() => {
      account = user.initAccount({});
      sinon
        .stub(account, 'rejectUnblockCode')
        .callsFake(() => Promise.resolve());

      return user.rejectAccountUnblockCode(account, UNBLOCK_CODE);
    });

    it('delegates to the account', () => {
      assert.isTrue(account.rejectUnblockCode.calledOnce);
      assert.isTrue(account.rejectUnblockCode.calledWith(UNBLOCK_CODE));
    });
  });

  describe('logNumStoredAccounts', () => {
    let account;

    beforeEach(() => {
      account = user.initAccount({
        email: 'testuser@testuser.com',
        uid: createUid(),
      });
    });

    it('logs the number of stored accounts', () => {
      // no accounts to begin with.
      user.logNumStoredAccounts();
      assert.equal(metrics.logNumStoredAccounts.callCount, 1);
      assert.isTrue(metrics.logNumStoredAccounts.calledWith(0));

      // add an account to storage.
      user._persistAccount(account);
      user.logNumStoredAccounts();
      assert.equal(metrics.logNumStoredAccounts.callCount, 2);
      assert.isTrue(metrics.logNumStoredAccounts.calledWith(1));
    });
  });

  describe('isSignedInAccount', () => {
    let account;

    beforeEach(() => {
      account = user.initAccount({
        email: 'testuser@testuser.com',
        uid: createUid(),
      });
    });

    describe('no account signed in', () => {
      it('returns false', () => {
        user.clearSignedInAccount();
        assert.isFalse(user.isSignedInAccount(account));
      });
    });

    describe('no account signed in, pass in a `default` account', () => {
      it('returns false', () => {
        user.clearSignedInAccount();
        assert.isFalse(user.isSignedInAccount(user.initAccount({})));
      });
    });

    describe('different account signed in', () => {
      it('returns false', () => {
        const signedInAccount = user.initAccount({
          email: 'testuser2@testuser.com',
          uid: 'uid2',
        });

        return user.setSignedInAccount(signedInAccount).then(() => {
          assert.isFalse(user.isSignedInAccount(account));
        });
      });
    });

    describe('same account signed in', () => {
      it('returns true', () => {
        return user.setSignedInAccount(account).then(() => {
          assert.isTrue(user.isSignedInAccount(account));
        });
      });
    });
  });

  describe('isAnotherAccountSignedIn', () => {
    let account;

    beforeEach(() => {
      account = user.initAccount({
        email: 'testuser@testuser.com',
        uid: 'uid',
      });
    });

    describe('no account signed in', () => {
      it('returns false', () => {
        user.clearSignedInAccount();
        assert.isFalse(user.isAnotherAccountSignedIn(account));
      });
    });

    describe('no account signed in, pass in a `default` account', () => {
      it('returns false', () => {
        user.clearSignedInAccount();
        assert.isFalse(user.isAnotherAccountSignedIn(user.initAccount({})));
      });
    });

    describe('different account signed in', () => {
      it('returns true', () => {
        const signedInAccount = user.initAccount({
          email: 'testuser2@testuser.com',
          uid: 'uid2',
        });

        return user.setSignedInAccount(signedInAccount).then(() => {
          assert.isTrue(user.isAnotherAccountSignedIn(account));
        });
      });
    });

    describe('same account signed in', () => {
      it('returns false', () => {
        return user.setSignedInAccount(account).then(() => {
          assert.isFalse(user.isAnotherAccountSignedIn(account));
        });
      });
    });
  });

  describe('shouldSetSignedInAccountFromBrowser', () => {
    it('returns true if service=sync', () => {
      sinon
        .stub(user, 'getSignedInAccount')
        .callsFake(() =>
          user.initAccount({ email: 'already-signed-in@testuser.com' })
        );

      assert.isTrue(user.shouldSetSignedInAccountFromBrowser('sync'));
    });

    it('returns true if pairing as the authority', () => {
      sinon
        .stub(user, 'getSignedInAccount')
        .callsFake(() =>
          user.initAccount({ email: 'already-signed-in@testuser.com' })
        );

      assert.isTrue(user.shouldSetSignedInAccountFromBrowser(null, true));
    });

    it('returns true if no local user, not sync', () => {
      sinon
        .stub(user, 'getSignedInAccount')
        .callsFake(() => user.initAccount({}));

      assert.isTrue(user.shouldSetSignedInAccountFromBrowser(''));
    });

    it('returns false if local user, not sync', () => {
      sinon
        .stub(user, 'getSignedInAccount')
        .callsFake(() =>
          user.initAccount({ email: 'already-signed-in@testuser.com' })
        );

      assert.isFalse(user.shouldSetSignedInAccountFromBrowser(''));
    });
  });

  describe('setSignedInAccountFromBrowserAccountData', () => {
    beforeEach(() => {
      sinon.spy(user, 'setSignedInAccount');
    });

    describe('with account data', () => {
      it('sets the signed in user', () => {
        const browserAccountData = {
          email: 'testuser@testuser.com',
          filtered: true,
          sessionToken: 'sessionToken',
          uid: 'uid',
          verified: true,
        };

        return user
          .setSignedInAccountFromBrowserAccountData(browserAccountData)
          .then(() => {
            assert.isTrue(user.setSignedInAccount.calledOnce);

            const signedInAccount = user.getSignedInAccount();
            assert.deepEqual(
              signedInAccount.pick(
                'email',
                'sessionToken',
                'sessionTokenContext',
                'uid',
                'verified'
              ),
              {
                email: 'testuser@testuser.com',
                sessionToken: 'sessionToken',
                sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
                uid: 'uid',
                verified: true,
              }
            );
            assert.isFalse(signedInAccount.has('filtered'));
          });
      });
    });

    describe('no account data', () => {
      it('does nothing', () => {
        return user.setSignedInAccountFromBrowserAccountData(null).then(() => {
          assert.isFalse(user.setSignedInAccount.called);
        });
      });
    });
  });

  describe('setSigninCodeAccount', () => {
    it('sets the `signinCodeAccount`', () => {
      const signinCodeAccountData = {
        email: 'testuser@testuser.com',
        filtered: true,
      };

      return user.setSigninCodeAccount(signinCodeAccountData).then(() => {
        const signinCodeAccount = user.get('signinCodeAccount');
        assert.equal(signinCodeAccount.get('email'), 'testuser@testuser.com');
        assert.isFalse(signinCodeAccount.has('filtered'));
      });
    });
  });
});
