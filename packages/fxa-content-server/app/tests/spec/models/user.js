/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var Device = require('models/device');
  var Devices = require('models/devices');
  var FxaClient = require('lib/fxa-client');
  var MarketingEmailErrors = require('lib/marketing-email-errors');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var User = require('models/user');

  var assert = chai.assert;
  var CODE = 'verification code';
  var UUID = 'a mock uuid';

  describe('models/user', function () {
    var fxaClientMock;
    var notifier;
    var user;

    function testRemoteSignInMessageSent(account) {
      assert.equal(notifier.triggerRemote.callCount, 1);
      var args = notifier.triggerRemote.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], notifier.COMMANDS.SIGNED_IN);

      // unwrapBKey and keyFetchToken are used in password reset
      // to enable the original tab to send encryption keys
      // to Firefox Hello.
      assert.deepEqual(
        args[1], account.pick('uid', 'unwrapBKey', 'keyFetchToken'));
    }

    beforeEach(function () {
      fxaClientMock = new FxaClient();
      notifier = new Notifier();
      user = new User({
        notifier: notifier,
        uniqueUserId: UUID
      });
    });

    afterEach(function () {
      user = null;
    });

    describe('initAccount', function () {
      var account;
      var email = 'a@a.com';

      beforeEach(function () {
        account = user.initAccount({
          email: email
        });
      });

      it('creates an account', function () {
        assert.equal(account.get('email'), email);
        assert.deepEqual(account.pick('email'), { email: email });
      });
    });

    it('isSyncAccount', function () {
      var account = user.initAccount({
        email: 'email',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC
      });

      assert.isTrue(user.isSyncAccount(account));
    });

    it('getAccountByUid', function () {
      return user.setAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          assert.equal(user.getAccountByUid('uid').get('uid'), 'uid');
        });
    });

    it('getAccountByEmail', function () {
      return user.setAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          assert.equal(user.getAccountByEmail('email').get('email'), 'email');
        });
    });

    it('getAccountByEmail gets the last added if there are multiple', function () {
      return user.setAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          return user.setAccount({ email: 'email', uid: 'uid2' });
        })
        .then(function () {
          return user.setAccount({ email: 'email', uid: 'uid3' });
        })
        .then(function () {
          assert.equal(user.getAccountByEmail('email').get('uid'), 'uid3');
        });
    });

    it('getSignedInAccount', function () {
      var account = user.initAccount({
        email: 'email',
        grantedPermissions: { 'someClientId': ['profile:email'] },
        uid: 'uid'
      });
      return user.setSignedInAccount(account)
        .then(function () {
          assert.equal(user.getSignedInAccount().get('uid'), account.get('uid'));
          assert.deepEqual(user.getSignedInAccount().get('grantedPermissions')['someClientId'], ['profile:email']);
        });
    });

    it('getChooserAccount', function () {
      return user.setSignedInAccount({
        email: 'email',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
        uid: 'uid2'
      })
      .then(function () {
        return user.setSignedInAccount({ email: 'email', uid: 'uid' });
      })
      .then(function () {
        assert.equal(user.getChooserAccount().get('uid'), 'uid2');
      });
    });

    it('clearSignedInAccount', function () {
      sinon.spy(notifier, 'triggerRemote');
      return user.setSignedInAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          user.clearSignedInAccount();
          assert.isTrue(user.getSignedInAccount().isDefault());
          assert.equal(user.getAccountByUid('uid').get('uid'), 'uid');
          assert.equal(notifier.triggerRemote.callCount, 1);
          var args = notifier.triggerRemote.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], notifier.COMMANDS.SIGNED_OUT);
        });
    });

    it('removeAllAccounts', function () {
      return user.setAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          return user.setAccount({ email: 'email', uid: 'uid2' });
        })
        .then(function () {
          user.removeAllAccounts();
          assert.isTrue(user.getAccountByUid('uid').isDefault());
          assert.isTrue(user.getAccountByUid('uid2').isDefault());
        });
    });

    it('removeAccount', function () {
      var account = { email: 'email', uid: 'uid' };
      return user.setSignedInAccount(account)
        .then(function () {
          user.removeAccount(account);
          assert.isTrue(user.getAccountByUid(account.uid).isDefault());
          assert.isTrue(user.getSignedInAccount().isDefault());
        });
    });

    describe('deleteAccount', function () {
      var account;

      beforeEach(function () {
        account = user.initAccount({
          email: 'testuser@testuser.com',
          uid: 'uid'
        });

        sinon.stub(account, 'destroy', function () {
          return p();
        });

        sinon.spy(notifier, 'triggerAll');

        user._persistAccount(account);

        return user.deleteAccount(account, 'password');
      });

      it('should delegate to the account to remove itself', function () {
        assert.isTrue(account.destroy.calledOnce);
        assert.isTrue(account.destroy.calledWith('password'));
      });

      it('should remove the account from storage', function () {
        assert.isNull(user._getAccount(account.get('uid')));
      });

      it('should trigger a notification', function () {
        assert.isTrue(notifier.triggerAll.calledWith(notifier.COMMANDS.DELETE, {
          uid: account.get('uid')
        }));
      });
    });

    it('setAccount', function () {
      return user.setAccount({ email: 'email', uid: 'uid' });
    });

    it('setSignedInAccount', function () {
      sinon.spy(notifier, 'triggerRemote');
      return user.setSignedInAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          assert.equal(user.getSignedInAccount().get('uid'), 'uid');
          assert.equal(notifier.triggerRemote.callCount, 0);
        });
    });


    describe('in memory caching of signed in account', function () {
      it('getSignedInAccount returns same instance from setSignedInAccount', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });
        return user.setSignedInAccount(account)
          .then(function () {
            assert.strictEqual(user.getSignedInAccount(), account);
          });
      });

      it('account is not cached in memory if setAccount fails', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });

        return user.setSignedInAccount({ email: 'email', uid: 'foo' })
          .then(function () {
            sinon.stub(user, 'setAccount', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });
            return user.setSignedInAccount(account);
          })
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            assert.isFalse(user.getSignedInAccount() === account);
          });
      });

      it('getSignedInAccount returns same instance when called multiple times', function () {
        return user.setSignedInAccount({ email: 'email', uid: 'uid' })
          .then(function () {
            assert.strictEqual(user.getSignedInAccount(), user.getSignedInAccount());
          });
      });

      it('getSignedInAccount returns same instance as getChooserAccount', function () {
        return user.setSignedInAccount({ email: 'email', uid: 'uid' })
          .then(function () {
            assert.strictEqual(user.getSignedInAccount(), user.getChooserAccount());
          });
      });

      it('getSignedInAccount does not return previously cached account after clearSignedInAccount', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });
        return user.setSignedInAccount(account)
          .then(function () {
            user.clearSignedInAccount();
            assert.isFalse(user.getSignedInAccount() === account);
          });
      });

      it('getSignedInAccount does not return previously cached account after removeAccount', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });
        return user.setSignedInAccount(account)
          .then(function () {
            user.removeAccount(account);
            assert.isFalse(user.getSignedInAccount() === account);
          });
      });

      it('getSignedInAccount does not return previously cached account after removeAllAccounts', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });
        return user.setSignedInAccount(account)
          .then(function () {
            user.removeAllAccounts();
            assert.isFalse(user.getSignedInAccount() === account);
          });
      });

      it('getSignedInAccount does not return previously cached account after setSignedInAccountByUid with different account uid', function () {
        var uid = 'abc123';
        var account = user.initAccount({ email: 'email', uid: 'uid' });

        return user.setSignedInAccount(account)
          .then(function () {
            return user.setAccount({ email: 'email', uid: uid })
              .then(function () {
                user.setSignedInAccountByUid(uid);
                assert.isFalse(user.getSignedInAccount() === account);
              });
          });
      });

      it('getSignedInAccount returns previously cached account after setSignedInAccountByUid with same account uid', function () {
        var account = user.initAccount({ email: 'email', uid: 'uid' });

        return user.setSignedInAccount(account)
          .then(function () {
            user.setSignedInAccountByUid('uid');
            assert.strictEqual(user.getSignedInAccount(), account);
          });
      });
    });

    it('setSignedInAccountByUid works if account is already cached', function () {
      var uid = 'abc123';
      sinon.spy(notifier, 'triggerRemote');
      return user.setSignedInAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          return user.setAccount({ email: 'email', uid: uid })
            .then(function () {
              user.setSignedInAccountByUid(uid);
              assert.equal(user.getSignedInAccount().get('uid'), uid);
              assert.equal(notifier.triggerRemote.callCount, 0);
            });
        });
    });

    it('setSignedInAccountByUid does nothing if account is not cached', function () {
      var uid = 'abc123';

      return user.setSignedInAccount({ email: 'email', uid: 'uid' })
        .then(function () {
          user.setSignedInAccountByUid(uid);
          assert.equal(user.getSignedInAccount().get('uid'), 'uid');
        });
    });


    it('does not upgrade if already upgraded', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);

      sinon.stub(user, 'getSignedInAccount', function () {
        return user.initAccount({
          email: 'b@b.com',
          sessionToken: 'session token'
        });
      });

      sinon.stub(user, 'setSignedInAccount', function () { });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(user.getSignedInAccount.called);
          assert.isTrue(user.getAccountByEmail('b@b.com').isDefault());
        });
    });

    it('upgrades an old Sync account session', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);

      sinon.stub(user, 'setSignedInAccount', function () { });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(user.setSignedInAccount.calledWith(accountData));
        });
    });

    it('upgrades an old Sync account session and ignores regular account session with the same email', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);
      Session.set('email', 'a@a.com');
      Session.set('sessionToken', 'session token too');

      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(user.setSignedInAccount.calledOnce);
          assert.isTrue(user.setSignedInAccount.calledWith(accountData));
        });
    });

    it('upgrades a regular account session', function () {
      Session.set('email', 'a@a.com');
      Session.set('sessionToken', 'session token');

      sinon.stub(fxaClientMock, 'sessionStatus', function () {
        return {
          uid: 'uid'
        };
      });

      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(fxaClientMock.sessionStatus.calledWith('session token'));
          assert.isTrue(user.setSignedInAccount.calledWith({
            email: 'a@a.com',
            sessionToken: 'session token',
            sessionTokenContext: undefined,
            uid: 'uid'
          }));
        });
    });

    it('upgrades an old Sync account session and a regular account session with a different email', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);
      Session.set('email', 'b@b.com');
      Session.set('sessionToken', 'session token too');

      sinon.stub(fxaClientMock, 'sessionStatus', function () {
        return {
          uid: 'uid too'
        };
      });

      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(fxaClientMock.sessionStatus.calledWith('session token too'));
          assert.isTrue(user.setSignedInAccount.calledTwice);
        });
    });


    describe('signInAccount', function () {
      var account;
      var relierMock = {};

      describe('with a new account', function () {
        beforeEach(function () {
          account = user.initAccount({ email: 'email', uid: 'uid' });

          sinon.stub(account, 'signIn', function () {
            return p();
          });

          sinon.stub(user, 'setSignedInAccount', function () {
            return p(account);
          });

          sinon.spy(notifier, 'triggerRemote');

          return user.signInAccount(
            account, 'password', relierMock, { resume: 'resume token'});
        });

        it('delegates to the account', function () {
          assert.isTrue(account.signIn.calledWith(
            'password',
            relierMock,
            {
              resume: 'resume token'
            }
          ));
        });

        it('saves the account', function () {
          assert.isTrue(user.setSignedInAccount.calledWith(account));
        });

        it('notifies remote listeners of the signin', function () {
          testRemoteSignInMessageSent(account);
        });
      });

      describe('with an already saved account', function () {
        beforeEach(function () {
          account = user.initAccount({
            displayName: 'fx user',
            email: 'email',
            uid: 'uid'
          });

          var oldAccount = user.initAccount({
            email: 'email',
            grantedPermissions: { foo: ['bar'] },
            uid: 'uid2'
          });

          sinon.stub(account, 'signIn', function () {
            return p();
          });

          sinon.stub(user, 'setSignedInAccount', function () {
            return p(account);
          });

          sinon.stub(user, 'getAccountByUid', function () {
            return oldAccount;
          });

          return user.signInAccount(account, 'password', relierMock);
        });

        it('merges data with old and new account', function () {
          var updatedAccount = user.setSignedInAccount.args[0][0];
          assert.deepEqual(
            updatedAccount.get('grantedPermissions').foo, ['bar']);
          assert.equal(updatedAccount.get('displayName'), 'fx user');
        });
      });
    });

    describe('signUpAccount', function () {
      var account;
      var relierMock = {};

      beforeEach(function () {
        account = user.initAccount({ email: 'email', uid: 'uid' });
        sinon.stub(account, 'signUp', function () {
          return p();
        });
        sinon.stub(user, 'setSignedInAccount', function () {
          return p();
        });

        return user.signUpAccount(
          account, 'password', relierMock, { resume: 'resume token'});
      });

      it('delegates to the account', function () {
        assert.isTrue(account.signUp.calledWith(
          'password',
          relierMock,
          {
            resume: 'resume token'
          }
        ));
      });

      it('stores the updated data', function () {
        assert.isTrue(user.setSignedInAccount.calledWith(account));
      });
    });

    describe('signUpAccount, account already exists', function () {
      var account;
      var relierMock = {};

      beforeEach(function () {
        account = user.initAccount({ email: 'email', uid: 'uid' });
        sinon.stub(account, 'signUp', function () {
          return p.reject(AuthErrors.toError('ACCOUNT_ALREADY_EXISTS'));
        });
        sinon.stub(user, 'setSignedInAccount', function () {
          return p();
        });
        sinon.stub(user, 'signInAccount', function () {
          return p();
        });

        return user.signUpAccount(account, 'foo', relierMock, { resume: 'bar' });
      });

      afterEach(function () {
        account.signUp.restore();
        user.setSignedInAccount.restore();
        user.signInAccount.restore();
      });

      it('does not call user.setSignedInAccount', function () {
        assert.equal(user.setSignedInAccount.callCount, 0);
      });

      it('calls user.signInAccount correctly', function () {
        assert.equal(user.signInAccount.callCount, 1);
        assert.equal(user.signInAccount.thisValues[0], user);
        var args = user.signInAccount.args[0];
        assert.lengthOf(args, 4);
        assert.equal(args[0], account);
        assert.equal(args[1], 'foo');
        assert.equal(args[2], relierMock);
        assert.isObject(args[3]);
        assert.lengthOf(Object.keys(args[3]), 1);
        assert.equal(args[3].resume, 'bar');
      });
    });

    describe('signUpAccount, some other error', function () {
      var account;
      var relierMock = {};
      var failed;

      beforeEach(function () {
        account = user.initAccount({ email: 'email', uid: 'uid' });
        sinon.stub(account, 'signUp', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });
        sinon.stub(user, 'setSignedInAccount', function () {
          return p();
        });
        sinon.stub(user, 'signInAccount', function () {
          return p();
        });

        return user.signUpAccount(account, 'foo', relierMock, { resume: 'bar' })
          .fail(function (err) {
            failed = err;
          });
      });

      afterEach(function () {
        account.signUp.restore();
        user.setSignedInAccount.restore();
        user.signInAccount.restore();
      });

      it('does not call user.setSignedInAccount', function () {
        assert.equal(user.setSignedInAccount.callCount, 0);
      });

      it('does not call user.signInAccount', function () {
        assert.equal(user.signInAccount.callCount, 0);
      });

      it('propagates the error', function () {
        assert.isTrue(AuthErrors.is(failed, 'UNEXPECTED_ERROR'));
      });
    });

    describe('completeAccountSignUp', function () {
      var account;

      beforeEach(function () {
        account = user.initAccount({ email: 'email', uid: 'uid' });

        sinon.spy(notifier, 'triggerRemote');
      });

      describe('without a basket error', function () {
        beforeEach(function () {
          account = user.initAccount({ email: 'email', uid: 'uid' });
          sinon.stub(account, 'verifySignUp', function () {
            return p();
          });
        });

        describe('without a sessionToken', function () {
          beforeEach(function () {
            return user.completeAccountSignUp(account, CODE);
          });

          it('delegates to the account', function () {
            assert.isTrue(account.verifySignUp.calledWith(CODE));
          });

          it('does not notify remotes of signin', function () {
            assert.isFalse(notifier.triggerRemote.called);
          });
        });

        describe('with a sessionToken', function () {
          beforeEach(function () {
            account.set('sessionToken', 'session token');
            return user.completeAccountSignUp(account, CODE);
          });

          it('notifies remotes of signin', function () {
            testRemoteSignInMessageSent(account);
          });
        });
      });

      describe('with a basket error', function () {
        var err;

        beforeEach(function () {
          err = null;

          account = user.initAccount({ email: 'email', uid: 'uid' });
          sinon.stub(account, 'verifySignUp', function () {
            return p.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
          });
        });

        describe('without a sessionToken', function () {
          beforeEach(function () {
            return user.completeAccountSignUp(account, CODE)
              .then(assert.fail, function (_err) {
                err = _err;
              });
          });

          it('throws the error', function () {
            assert.isTrue(MarketingEmailErrors.is(err, 'USAGE_ERROR'));
          });

          it('does not notify remotes of signin', function () {
            assert.isFalse(notifier.triggerRemote.called);
          });
        });

        describe('with a sessionToken', function () {
          beforeEach(function () {
            account.set('sessionToken', 'session token');
            return user.completeAccountSignUp(account, CODE)
              .then(assert.fail, function (_err) {
                err = _err;
              });
          });

          it('throws the error', function () {
            assert.isTrue(MarketingEmailErrors.is(err, 'USAGE_ERROR'));
          });

          it('but still notifies remotes of signin', function () {
            testRemoteSignInMessageSent(account);
          });
        });
      });
    });

    it('changeAccountPassword changes the account password', function () {
      var relierMock = {};
      var account = user.initAccount({ email: 'email', uid: 'uid' });

      sinon.stub(account, 'changePassword', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      var oldPassword = 'password';
      var newPassword = 'new_password';

      return user.changeAccountPassword(account, oldPassword, newPassword, relierMock)
        .then(function () {
          assert.isTrue(account.changePassword.calledWith(
            oldPassword,
            newPassword,
            relierMock
          ));

          assert.isTrue(user.setSignedInAccount.calledWith(account));
        });
    });

    describe('completeAccountPasswordReset', function () {
      var account;
      var relierMock = {};

      beforeEach(function () {
        account = user.initAccount({ email: 'email', uid: 'uid' });

        sinon.stub(account, 'completePasswordReset', function () {
          return p();
        });

        sinon.stub(user, 'setSignedInAccount', function (account) {
          return p(account);
        });

        sinon.spy(notifier, 'triggerRemote');

        return user.completeAccountPasswordReset(
          account, 'password', 'token', 'code', relierMock);
      });

      it('delegates to the account', function () {
        assert.isTrue(account.completePasswordReset.calledWith(
          'password',
          'token',
          'code',
          relierMock
        ));
      });

      it('saves the updated account data', function () {
        assert.isTrue(user.setSignedInAccount.calledWith(account));
      });

      it('notifies remote listeners', function () {
        testRemoteSignInMessageSent(account);
      });
    });

    describe('pickResumeTokenInfo', function () {
      it('returns the uniqueUserId', function () {
        var resumeTokenInfo = user.pickResumeTokenInfo();
        assert.equal(resumeTokenInfo.uniqueUserId, UUID);
      });
    });

    describe('fetchAccountDevices', function () {
      var account;
      var devices;

      beforeEach(function () {
        account = user.initAccount({});
        sinon.stub(account, 'fetchDevices', function () {
          return p();
        });

        devices = new Devices([], {
          notifier: {
            on: sinon.spy()
          }
        });

        return user.fetchAccountDevices(account, devices);
      });

      it('delegates to the account to fetch devices', function () {
        assert.isTrue(account.fetchDevices.calledWith(devices));
      });
    });

    describe('destroyAccountDevice', function () {
      var account;
      var device;

      beforeEach(function () {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'session token',
          uid: 'the uid'
        });

        sinon.stub(account, 'destroyDevice', function () {
          return p();
        });

        sinon.stub(account, 'fetch', function () {
          return p();
        });


        sinon.spy(user, 'clearSignedInAccount');

        device = new Device({
          id: 'device-1',
          name: 'alpha',
          sessionToken: 'session token'
        });

        return user.destroyAccountDevice(account, device);
      });

      it('delegates to the account to destroy the device', function () {
        assert.isTrue(account.destroyDevice.calledWith(device));
      });

      describe('with a remote device', function () {
        it('does not sign out the current user', function () {
          assert.isFalse(user.clearSignedInAccount.called);
        });
      });


      describe('with the current account\'s current device', function () {
        beforeEach(function () {
          device.set('isCurrentDevice', true);

          return user.setSignedInAccount(account)
            .then(function () {
              return user.destroyAccountDevice(account, device);
            });
        });

        it('signs out the current account', function () {
          assert.isTrue(user.clearSignedInAccount.called);
        });
      });
    });
  });
});
