/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/constants',
  'lib/session',
  'lib/fxa-client',
  'models/user'
],
function (chai, sinon, p, Constants, Session, FxaClient, User) {
  var assert = chai.assert;

  describe('models/user', function () {
    var user;
    var fxaClientMock;

    beforeEach(function () {
      fxaClientMock = new FxaClient();
      user = new User();
    });

    afterEach(function () {
      user = null;
    });

    it('creates an account', function () {
      var email = 'a@a.com';
      var account = user.createAccount({
        email: email
      });
      assert.equal(account.email, email);
      assert.ok(account.toData());
    });

    it('isSyncAccount', function () {
      var account = user.createAccount({
        email: 'email',
        sessionTokenContext: Constants.FX_DESKTOP_CONTEXT
      });

      assert.isTrue(user.isSyncAccount(account));
    });

    it('getAccountByUid', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.ok(user.getAccountByUid('uid'));
        });
    });

    it('getAccountByEmail', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.ok(user.getAccountByEmail('email'));
        });
    });

    it('getCurrentAccount', function () {
      var account = user.createAccount({ uid: 'uid', email: 'email' });
      return user.setCurrentAccount(account)
        .then(function () {
          assert.equal(user.getCurrentAccount().uid, account.uid);
        });
    });

    it('getChooserAccount', function () {
      return user.setCurrentAccount({ uid: 'uid2', email: 'email',
        sessionTokenContext: Constants.FX_DESKTOP_CONTEXT
      })
        .then(function () {
          return user.setCurrentAccount({ uid: 'uid', email: 'email' });
        })
        .then(function () {
          assert.equal(user.getChooserAccount().uid, 'uid2');
        });
    });

    it('clearCurrentAccount', function () {
      return user.setCurrentAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          user.clearCurrentAccount();
          assert.isNull(user.getCurrentAccount());
          assert.ok(user.getAccountByUid('uid'));
        });
    });

    it('removeAccount', function () {
      var account = { uid: 'uid', email: 'email' };
      return user.setCurrentAccount(account)
        .then(function () {
          user.removeAccount(account);
          assert.isNull(user.getAccountByUid(account.uid));
          assert.isNull(user.getCurrentAccount());
        });
    });

    it('removeAllAccounts', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          return user.setAccount({ uid: 'uid2', email: 'email' });
        })
        .then(function () {
          user.removeAllAccounts();
          assert.isNull(user.getAccountByUid('uid'));
          assert.isNull(user.getAccountByUid('uid2'));
        });
    });

    it('setAccount', function () {
      return user.setAccount({ uid: 'uid', email: 'email' });
    });

    it('setCurrentAccount', function () {
      return user.setCurrentAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.equal(user.getCurrentAccount().uid, 'uid');
        });
    });

    it('setCurrentAccountByUid works if account is already cached', function () {
      var uid = 'abc123';

      return user.setCurrentAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          return user.setAccount({ uid: uid, email: 'email' })
            .then(function () {
              user.setCurrentAccountByUid(uid);
              assert.equal(user.getCurrentAccount().uid, uid);
            });
        });
    });

    it('setCurrentAccountByUid does nothing if account is not cached', function () {
      var uid = 'abc123';

      return user.setCurrentAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          user.setCurrentAccountByUid(uid);
          assert.equal(user.getCurrentAccount().uid, 'uid');
        });
    });

    it('upgrades an old Sync account session', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);

      sinon.stub(user, 'setCurrentAccount', function () { });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(user.setCurrentAccount.calledWith(accountData));
        });
    });

    it('upgrades an old Sync account session and ignores regular account session with the same email', function () {
      var accountData = {
        email: 'a@a.com',
        sessionToken: 'session token',
        sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
        uid: 'uid'
      };
      Session.set('cachedCredentials', accountData);
      Session.set('email', 'a@a.com');
      Session.set('sessionToken', 'session token too');

      sinon.stub(user, 'setCurrentAccount', function () {
        return p();
      });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(user.setCurrentAccount.calledOnce);
          assert.isTrue(user.setCurrentAccount.calledWith(accountData));
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

      sinon.stub(user, 'setCurrentAccount', function () { });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(fxaClientMock.sessionStatus.calledWith('session token'));
          console.log(user.setCurrentAccount);
          assert.isTrue(user.setCurrentAccount.calledWith({
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
        sessionTokenContext: Constants.FX_DESKTOP_CONTEXT,
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

      sinon.stub(user, 'setCurrentAccount', function () {
        return p();
      });

      return user.upgradeFromSession(Session, fxaClientMock)
        .then(function () {
          assert.isTrue(fxaClientMock.sessionStatus.calledWith('session token too'));
          assert.isTrue(user.setCurrentAccount.calledTwice);
        });
    });

  });
});
