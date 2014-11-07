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
  'models/reliers/relier',
  'models/user'
],
function (chai, _, $, sinon, View, RouterMock, WindowMock, TestHelpers,
      Constants, FxaClient, p, Relier, User) {
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

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      relier = new Relier();
      fxaClient = new FxaClient();
      user = new User();
      account = user.createAccount({
        uid: UID,
        email: 'a@a.com',
        sessionToken: 'abc123',
        verified: true
      });

      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        relier: relier,
        user: user
      });

      sinon.stub(user, 'getCurrentAccount', function () {
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
        user.getCurrentAccount.restore();
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
        windowMock.location.search = '?uid=' + UID;
      });

      it('shows the settings page for a selected uid', function () {
        sinon.stub(user, 'getAccountByUid', function () {
          return account;
        });
        sinon.stub(user, 'setCurrentAccountByUid', function () {
          return p();
        });

        view = new View({
          window: windowMock,
          router: routerMock,
          fxaClient: fxaClient,
          relier: relier,
          user: user
        });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.setCurrentAccountByUid.calledWith(UID));
          });
      });

      it('redirects to signin if uid is not found', function () {
        sinon.stub(user, 'getAccountByUid', function () {
          return user.createAccount();
        });

        sinon.stub(user, 'clearCurrentAccount', function () {
        });

        view = new View({
          window: windowMock,
          router: routerMock,
          fxaClient: fxaClient,
          relier: relier,
          user: user
        });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.clearCurrentAccount.called);
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
          });
      });

      describe('submit', function () {
        it('signs the user out, redirects to signin page', function () {
          return view.submit()
              .then(function () {
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
    });
  });
});


