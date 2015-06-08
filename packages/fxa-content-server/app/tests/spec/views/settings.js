/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'sinon',
  'views/settings',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers',
  'lib/fxa-client',
  'lib/promise',
  'lib/profile-errors',
  'lib/auth-errors',
  'lib/able',
  'lib/metrics',
  'models/reliers/relier',
  'models/profile-image',
  'models/user'
],
function (chai, $, sinon, View, RouterMock, WindowMock, TestHelpers,
      FxaClient, p, ProfileErrors, AuthErrors, Able, Metrics, Relier, ProfileImage, User) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view;
    var routerMock;
    var windowMock;
    var fxaClient;
    var relier;
    var user;
    var account;
    var metrics;
    var UID = 'uid';
    var able;

    function createView () {
      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        relier: relier,
        user: user,
        metrics: metrics,
        able: able,
        screenName: 'settings'
      });
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      metrics = new Metrics();
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
        return view.afterVisible()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper a').length, 0);
            assert.notEqual(view.$('.change-avatar-text')[0].style.visibility, 'visible');
          });
      });

      describe('with mozilla email', function () {
        beforeEach(function () {
          account.set('email', 'test@mozilla.com');

          sinon.stub(able, 'choose', function () {
            return true;
          });

          return view.render()
            .then(function () {
              $('body').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for mozilla account', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
          assert.equal(view.$('.change-avatar-text')[0].style.visibility, 'visible');
        });
      });

      describe('with a profile image set', function () {
        beforeEach(function () {
          var image = new ProfileImage({ url: 'url', id: 'foo', img: new Image() });
          sinon.stub(account, 'fetchCurrentProfileImage', function () {
            return p(image);
          });

          return view.render()
            .then(function () {
              $('body').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for account with profile image set', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
          assert.equal(view.$('.change-avatar-text')[0].style.visibility, 'visible');
        });
      });

      describe('with a profile image previously set', function () {
        beforeEach(function () {
          account.set('hadProfileImageSetBefore', true);

          return view.render()
            .then(function () {
              $('body').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for account with profile image set', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
          assert.equal(view.$('.change-avatar-text')[0].style.visibility, 'visible');
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

      it('has avatar but does not load', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: 'blah.jpg', id: 'foo' });
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 0);
            assert.equal(view.$('.avatar-wrapper.with-default').length, 1);

            var err = ProfileErrors.toError('IMAGE_LOAD_ERROR');
            err.context = 'blah.jpg';
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          });
      });

      it('has an avatar set', function () {
        var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';
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
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.submit'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.success'));
              assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.signout.error'));
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
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.submit'));
              // track the error, but success is still finally called
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.error'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.success'));
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

    describe('communication preferences link', function () {
      it('is visible if enabled', function () {
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(true);
        });

        sinon.stub(able, 'choose', function () {
          return true;
        });

        return view.render()
          .then(function () {
            assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
            assert.equal(view.$('#communications').length, 1);
          });
      });

      it('is not visible if disabled', function () {
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(true);
        });

        sinon.stub(able, 'choose', function () {
          return false;
        });

        return view.render()
          .then(function () {
            assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
            assert.equal(view.$('#communications').length, 0);
          });
      });
    });
  });
});


