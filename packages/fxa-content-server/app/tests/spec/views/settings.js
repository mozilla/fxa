/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'sinon',
  'views/settings',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers',
  'lib/constants',
  'lib/fxa-client',
  'lib/promise',
  'lib/auth-errors',
  'lib/able',
  'models/reliers/relier',
  'models/user'
],
function (chai, _, $, sinon, View, RouterMock, WindowMock, TestHelpers,
      Constants, FxaClient, p, AuthErrors, Able, Relier, User) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view;
    var routerMock;
    var windowMock;
    var fxaClient;
    var relier;
    var user;
    var account;
    var UID = 'uid';
    var able;

    function createView () {
      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        relier: relier,
        user: user,
        able: able
      });
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      relier = new Relier();
      fxaClient = new FxaClient();
      user = new User();
      account = user.initAccount({
        uid: UID,
        email: 'a@a.com',
        sessionToken: 'abc123',
        verified: true
      });
      able = new Able();

      createView();

      sinon.stub(user, 'getSignedInAccount', function () {
        return account;
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        user.getSignedInAccount.restore();
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with uid', function () {
      beforeEach(function () {
        sinon.stub(view.fxaClient, 'isSignedIn', function () {
          return p(true);
        });
        relier.set('uid', UID);
      });

      it('shows the settings page for a selected uid', function () {
        sinon.stub(user, 'getAccountByUid', function () {
          return account;
        });
        sinon.stub(user, 'setSignedInAccountByUid', function () {
          return p();
        });

        createView();

        return view.render()
          .then(function () {
            $('body').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.setSignedInAccountByUid.calledWith(UID));
          });
      });

      it('redirects to signin if uid is not found', function () {
        sinon.stub(user, 'getAccountByUid', function () {
          return user.initAccount();
        });

        sinon.stub(user, 'clearSignedInAccount', function () {
        });

        createView();

        return view.render()
          .then(function () {
            $('body').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.clearSignedInAccount.called);
          });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        sinon.stub(view.fxaClient, 'isSignedIn', function () {
          return p(true);
        });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          });
      });

      it('shows the settings page', function () {
        assert.ok(view.$('#fxa-settings-header').length);
      });

      it('does not shows avatar change link non-mozilla account', function () {
        assert.notOk(view.$('.avatar-wrapper a.change-avatar').length);
        assert.notOk(view.$('.change-avatar-text a').length);
      });

      describe('with avatar change link enabled', function () {
        beforeEach(function () {
          account.set('email', 'test@mozilla.com');

          sinon.stub(able, 'choose', function () {
            return true;
          });

          return view.render()
            .then(function () {
              $('body').append(view.el);
            });
        });

        it('shows avatar change link for mozilla account', function () {
          assert.ok(view.$('.avatar-wrapper a.change-avatar').length);
          assert.ok(view.$('.change-avatar-text a').length);
        });

        it('shows avatar change link for automated testing account', function () {
          assert.ok(view.$('.avatar-wrapper a.change-avatar').length);
          assert.ok(view.$('.change-avatar-text a').length);
        });
      });

      it('has no avatar set', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p({});
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 0);
            assert.equal(view.$('.avatar-wrapper.with-default').length, 1);
          });
      });

      it('has an avatar set', function () {
        var url = 'https://example.com/avatar.jpg';
        var id = 'foo';

        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: url, id: id });
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').attr('src'), url);
            assert.equal(view.$('.avatar-wrapper.with-default').length, 0);
          });
      });

      describe('submit', function () {
        it('on success, signs the user out, redirects to the signin page', function () {
          sinon.stub(fxaClient, 'signOut', function () {
            return p();
          });
          sinon.spy(user, 'clearSignedInAccount');

          return view.submit()
            .then(function () {
              assert.isTrue(user.clearSignedInAccount.called);
              assert.equal(routerMock.page, 'signin');
            });
        });

        it('on error, signs the user out, redirects to signin page', function () {
          sinon.stub(fxaClient, 'signOut', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });
          sinon.spy(user, 'clearSignedInAccount');

          return view.submit()
            .then(function () {
              assert.isTrue(user.clearSignedInAccount.called);
              assert.equal(routerMock.page, 'signin');
            });
        });
      });

      describe('desktop context', function () {
        it('does not show sign out link', function () {
          sinon.stub(account, 'isFromSync', function () {
            return true;
          });

          return view.render()
            .then(function () {
              assert.equal(view.$('#signout').length, 0);
            });
        });
      });

      describe('setting param', function () {
        it('when setting param is set to avatar, navigates to avatar change view', function () {
          relier.set('setting', 'avatar');

          return view.render()
            .then(function () {
              assert.equal(routerMock.page, '/settings/avatar/change');
            });
        });
      });

    });
  });
});


