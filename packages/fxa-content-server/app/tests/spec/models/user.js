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
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var User = require('models/user');

  var assert = chai.assert;
  var UUID = 'a mock uuid';

  describe('models/user', function () {
    var fxaClientMock;
    var notifier;
    var user;

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

    it('creates an account', function () {
      var email = 'a@a.com';
      var account = user.initAccount({
        email: email
      });
      assert.equal(account.get('email'), email);
      assert.ok(account.toJSON());
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
          assert.equal(args[0], notifier.EVENTS.SIGNED_OUT);
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


    it('signInAccount', function () {
      var relierMock = {};
      var account = user.initAccount({ email: 'email', uid: 'uid' });
      sinon.stub(account, 'signIn', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p(account);
      });
      sinon.spy(notifier, 'triggerRemote');

      return user.signInAccount(account, relierMock, { resume: 'resume token'})
        .then(function () {
          assert.isTrue(account.signIn.calledWith(
            relierMock,
            {
              resume: 'resume token'
            }
          ));
          assert.isTrue(user.setSignedInAccount.calledWith(account));
          assert.equal(notifier.triggerRemote.callCount, 1);
          var args = notifier.triggerRemote.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], notifier.EVENTS.SIGNED_IN);
          assert.deepEqual(args[1], account.toJSON());
        });
    });

    it('signInAccount with existing account keeps data', function () {
      var relierMock = {};
      var account = user.initAccount({ email: 'email', password: 'foo', uid: 'uid' });
      var oldAccount = user.initAccount({ email: 'email', grantedPermissions: { foo: ['bar'] }, uid: 'uid2' });
      sinon.stub(account, 'signIn', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p(account);
      });
      sinon.stub(user, 'getAccountByUid', function () {
        return oldAccount;
      });

      return user.signInAccount(account, relierMock)
        .then(function () {
          assert.isTrue(account.signIn.calledWith(relierMock));
          assert.isTrue(user.getAccountByUid.calledWith(account.get('uid')));
          assert.isTrue(user.setSignedInAccount.calledWith(oldAccount));
          assert.deepEqual(user.setSignedInAccount.args[0][0].get('grantedPermissions').foo, ['bar']);
          assert.equal(user.setSignedInAccount.args[0][0].get('password'), 'foo');
        });
    });

    it('signUpAccount', function () {
      var relierMock = {};
      var account = user.initAccount({ email: 'email', uid: 'uid' });
      sinon.stub(account, 'signUp', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      return user.signUpAccount(account, relierMock, { resume: 'resume token'})
        .then(function () {
          assert.isTrue(account.signUp.calledWith(
            relierMock,
            {
              resume: 'resume token'
            }
          ));
          assert.isTrue(user.setSignedInAccount.calledWith(account));
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

    it('completeAccountPasswordReset completes the password reset', function () {
      var relierMock = {};
      var account = user.initAccount({ email: 'email', uid: 'uid' });

      sinon.stub(account, 'completePasswordReset', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function (account) {
        return p(account);
      });

      return user.completeAccountPasswordReset(account, 'token', 'code', relierMock)
        .then(function () {
          assert.isTrue(account.completePasswordReset.calledWith(
            'token',
            'code',
            relierMock
          ));

          assert.isTrue(user.setSignedInAccount.calledWith(account));
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
