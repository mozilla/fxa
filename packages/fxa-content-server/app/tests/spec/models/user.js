/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  'use strict';

  var assert = chai.assert;

  describe('models/user', function () {
    var user;
    var fxaClientMock;
    var UUID = 'a mock uuid';

    beforeEach(function () {
      fxaClientMock = new FxaClient();
      user = new User({
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
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.equal(user.getAccountByUid('uid').get('uid'), 'uid');
        });
    });

    it('getAccountByEmail', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.equal(user.getAccountByEmail('email').get('email'), 'email');
        });
    });

    it('getAccountByEmail gets the last added if there are multiple', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          return user.setAccount({ uid: 'uid2', email: 'email' });
        })
        .then(function () {
          return user.setAccount({ uid: 'uid3', email: 'email' });
        })
        .then(function () {
          assert.equal(user.getAccountByEmail('email').get('uid'), 'uid3');
        });
    });

    it('getSignedInAccount', function () {
      var account = user.initAccount({ uid: 'uid', email: 'email', grantedPermissions: {
        'someClientId': ['profile:email']
      }});
      return user.setSignedInAccount(account)
        .then(function () {
          assert.equal(user.getSignedInAccount().get('uid'), account.get('uid'));
          assert.deepEqual(user.getSignedInAccount().get('grantedPermissions')['someClientId'], ['profile:email']);
        });
    });

    it('getChooserAccount', function () {
      return user.setSignedInAccount({ uid: 'uid2', email: 'email',
        sessionTokenContext: Constants.SESSION_TOKEN_USED_FOR_SYNC
      })
        .then(function () {
          return user.setSignedInAccount({ uid: 'uid', email: 'email' });
        })
        .then(function () {
          assert.equal(user.getChooserAccount().get('uid'), 'uid2');
        });
    });

    it('clearSignedInAccount', function () {
      return user.setSignedInAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          user.clearSignedInAccount();
          assert.isTrue(user.getSignedInAccount().isDefault());
          assert.equal(user.getAccountByUid('uid').get('uid'), 'uid');
        });
    });

    it('removeAccount', function () {
      var account = { uid: 'uid', email: 'email' };
      return user.setSignedInAccount(account)
        .then(function () {
          user.removeAccount(account);
          assert.isTrue(user.getAccountByUid(account.uid).isDefault());
          assert.isTrue(user.getSignedInAccount().isDefault());
        });
    });

    it('removeAllAccounts', function () {
      return user.setAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          return user.setAccount({ uid: 'uid2', email: 'email' });
        })
        .then(function () {
          user.removeAllAccounts();
          assert.isTrue(user.getAccountByUid('uid').isDefault());
          assert.isTrue(user.getAccountByUid('uid2').isDefault());
        });
    });

    it('setAccount', function () {
      return user.setAccount({ uid: 'uid', email: 'email' });
    });

    it('setSignedInAccount', function () {
      return user.setSignedInAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          assert.equal(user.getSignedInAccount().get('uid'), 'uid');
        });
    });

    it('setSignedInAccountByUid works if account is already cached', function () {
      var uid = 'abc123';

      return user.setSignedInAccount({ uid: 'uid', email: 'email' })
        .then(function () {
          return user.setAccount({ uid: uid, email: 'email' })
            .then(function () {
              user.setSignedInAccountByUid(uid);
              assert.equal(user.getSignedInAccount().get('uid'), uid);
            });
        });
    });

    it('setSignedInAccountByUid does nothing if account is not cached', function () {
      var uid = 'abc123';

      return user.setSignedInAccount({ uid: 'uid', email: 'email' })
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
      var account = user.initAccount({ uid: 'uid', email: 'email' });
      sinon.stub(account, 'signIn', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      return user.signInAccount(account, relierMock, { resume: 'resume token'})
        .then(function () {
          assert.isTrue(account.signIn.calledWith(
            relierMock,
            {
              resume: 'resume token'
            }
          ));
          assert.isTrue(user.setSignedInAccount.calledWith(account));
        });
    });

    it('signInAccount with existing account keeps data', function () {
      var relierMock = {};
      var account = user.initAccount({ uid: 'uid', email: 'email', password: 'foo' });
      var oldAccount = user.initAccount({ uid: 'uid2', email: 'email', grantedPermissions: { foo: ['bar'] } });
      sinon.stub(account, 'signIn', function () {
        return p();
      });
      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
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
      var account = user.initAccount({ uid: 'uid', email: 'email' });
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
      var account = user.initAccount({ uid: 'uid', email: 'email' });

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
      var account = user.initAccount({ uid: 'uid', email: 'email' });

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
  });
});
