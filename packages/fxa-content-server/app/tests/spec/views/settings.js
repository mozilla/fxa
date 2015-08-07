/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'underscore',
  'cocktail',
  'views/settings',
  'views/base',
  'views/settings/communication_preferences',
  'views/mixins/modal-settings-panel-mixin',
  'views/mixins/settings-panel-mixin',
  '../../mocks/router',
  '../../lib/helpers',
  'lib/fxa-client',
  'lib/promise',
  'lib/profile-client',
  'lib/profile-errors',
  'lib/auth-errors',
  'lib/able',
  'lib/metrics',
  'models/notifications',
  'models/reliers/relier',
  'models/profile-image',
  'models/user',
  'stache!templates/test_template',
],
function (chai, $, sinon, _, Cocktail, View, BaseView, CommunicationPreferencesView,
  ModalSettingsPanelMixin, SettingsPanelMixin, RouterMock, TestHelpers, FxaClient, p,
  ProfileClient, ProfileErrors, AuthErrors, Able, Metrics, Notifications,
  Relier, ProfileImage, User, TestTemplate) {
  'use strict';

  var assert = chai.assert;

  var SettingsPanelView = BaseView.extend({
    template: TestTemplate,
    className: 'panel'
  });

  var SettingsPanelView2 = BaseView.extend({
    template: TestTemplate,
    className: 'panel2'
  });

  var ModalSettingsPanelView = BaseView.extend({
    template: TestTemplate,
    className: 'modal-panel'
  });

  Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);
  Cocktail.mixin(SettingsPanelView2, SettingsPanelMixin);
  Cocktail.mixin(ModalSettingsPanelView, ModalSettingsPanelMixin);

  describe('views/settings', function () {
    var view;
    var routerMock;
    var fxaClient;
    var profileClient;
    var relier;
    var user;
    var account;
    var metrics;
    var able;
    var notifications;
    var panelViews;
    var subViewToShow;

    var ACCESS_TOKEN = 'access token';
    var UID = 'uid';

    function createView () {
      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        relier: relier,
        user: user,
        metrics: metrics,
        able: able,
        subView: subViewToShow,
        notifications: notifications,
        panelViews: panelViews,
        screenName: 'settings'
      });
      view.FADE_OUT_SETTINGS_MS = 0;
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient();
      profileClient = new ProfileClient();

      user = new User({
        fxaClient: fxaClient,
        profileClient: profileClient
      });
      notifications = new Notifications();

      account = user.initAccount({
        uid: UID,
        email: 'a@a.com',
        sessionToken: 'abc123',
        verified: true
      });
      sinon.stub(account, 'fetchProfile', function () {
        return p();
      });

      able = new Able();

      panelViews = [
        SettingsPanelView,
        SettingsPanelView2,
        ModalSettingsPanelView
      ];

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
        relier.set('uid', UID);
      });

      it('shows the settings page for a selected uid', function () {
        sinon.stub(user, 'getAccountByUid', function () {
          return account;
        });
        sinon.stub(user, 'setSignedInAccountByUid', function () {
          return p();
        });
        account.set('accessToken', ACCESS_TOKEN);

        createView();
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(true);
        });
        return view.render()
          .then(function () {
            $('#container').append(view.el);
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
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(false);
        });
        sinon.stub(view, 'navigate', function () { });

        return view.render()
          .then(function () {
            $('#container').append(view.el);
          })
          .then(function () {
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.clearSignedInAccount.called);
            assert.equal(view.navigate.args[0][0], 'signin');
          });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(true);
        });
        account.set('accessToken', ACCESS_TOKEN);
      });

      it('shows the settings page', function () {
        return view.render()
          .then(function () {
            $('#container').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue($('body').hasClass('settings'));
          });
      });

      describe('subviews', function () {
        it('shows subview if initialized with one', function () {
          subViewToShow = SettingsPanelView;
          createView();
          sinon.stub(view, 'isUserAuthorized', function () {
            return p(true);
          });
          sinon.stub(view, 'showSubView', function () {
            return p();
          });

          return view.render()
            .then(function () {
              $('#container').append(view.el);
              return view.afterVisible();
            })
            .then(function () {
              assert.isTrue(view.showSubView.calledWith(SettingsPanelView));
            });
        });

        it('renders non-modal subviews on render', function () {
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new View();
            return subview;
          });

          return view.render()
            .then(function () {
              assert.isTrue(routerMock.createView.calledTwice, 'is only called for the non-modal views');
              assert.equal(routerMock.createView.args[0][0], SettingsPanelView);
              assert.equal(routerMock.createView.args[1][0], SettingsPanelView2);
            });
        });

        it('showSubView with undeclared view returns', function () {
          var result = view.showSubView(BaseView);
          assert.isUndefined(result);
        });

        it('showSubView opens and logs', function () {
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new View();
            sinon.stub(subview, 'afterVisible', function () { });
            sinon.stub(subview, 'openPanel', function () { });
            sinon.stub(subview, 'logScreen', function () { });
            return subview;
          });
          var spy = sinon.spy(view, 'trackSubview');

          return view.showSubView(SettingsPanelView)
            .then(function () {
              assert.isTrue(routerMock.createView.called);
              assert.equal(routerMock.createView.args[0][0], SettingsPanelView);
              assert.equal(routerMock.createView.args[0][1].superView, view);
              assert.isTrue(routerMock.createView.returnValues[0].afterVisible.called);
              assert.isTrue(routerMock.createView.returnValues[0].openPanel.called);
              assert.isTrue(routerMock.createView.returnValues[0].logScreen.called);
              assert.isTrue(spy.calledWith(routerMock.createView.returnValues[0]));
            });
        });

        it('showSubView only creates view once', function () {
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new View();
            sinon.stub(subview, 'openPanel', function () { });
            sinon.stub(subview, 'logScreen', function () { });
            return subview;
          });
          var returnedView;

          return view.showSubView(SettingsPanelView)
            .then(function (subView) {
              returnedView = subView;
              return view.showSubView(SettingsPanelView);
            })
            .then(function (subView) {
              assert.equal(returnedView, subView);
              assert.isTrue(routerMock.createView.calledOnce);
            });
        });

        it('showSubView destroys subview if fails to render', function () {
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new View();
            sinon.stub(subview, 'afterVisible', function () { });
            sinon.stub(subview, 'destroy', function () { });
            sinon.stub(subview, 'render', function () {
              return p(false);
            });
            return subview;
          });

          return view.showSubView(SettingsPanelView)
            .then(function () {
              assert.isTrue(routerMock.createView.called);
              assert.equal(routerMock.createView.args[0][0], SettingsPanelView);
              assert.isTrue(routerMock.createView.returnValues[0].render.called);
              assert.isTrue(routerMock.createView.returnValues[0].destroy.calledWith(true));
              assert.isFalse(routerMock.createView.returnValues[0].afterVisible.called);
            });
        });

        it('showSubView destroys previous modal view', function () {
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new View();
            sinon.stub(subview, 'openPanel', function () { });
            sinon.stub(subview, 'logScreen', function () { });
            return subview;
          });

          return view.showSubView(ModalSettingsPanelView)
            .then(function (subView) {
              sinon.stub(subView, 'closePanel', function () { });
              return view.showSubView(SettingsPanelView);
            })
            .then(function (subView) {
              assert.isTrue(routerMock.createView.returnValues[0].closePanel.called);
            });
        });

        it('on navigate from subview', function () {
          var spy1 = sinon.spy(view, 'showEphemeralMessages');
          var spy2 = sinon.spy(view, 'logScreen');
          sinon.stub($.modal, 'isActive', function () {
            return true;
          });
          sinon.stub($.modal, 'close', function () { });
          routerMock.trigger(routerMock.NAVIGATE_FROM_SUBVIEW);
          assert.isTrue(spy1.called);
          assert.isTrue(spy2.called);
          assert.isTrue($.modal.isActive.called);
          assert.isTrue($.modal.close.called);
          $.modal.isActive.restore();
          $.modal.close.restore();
        });
      });

      it('on profile change', function () {
        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.afterVisible();
          })
          .then(function () {
            sinon.spy(view, 'displayAccountProfileImage');
            view.onProfileUpdate();
            assert.isTrue(view.displayAccountProfileImage.calledWith(account));
          });
      });

      it('does not shows avatar change link non-mozilla account', function () {
        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper a').length, 0);
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
              $('#container').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for mozilla account', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
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
              $('#container').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for account with profile image set', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
        });
      });

      describe('with a profile image previously set', function () {
        beforeEach(function () {
          account.set('hadProfileImageSetBefore', true);

          return view.render()
            .then(function () {
              $('#container').append(view.el);
              return view.afterVisible();
            });
        });

        it('shows avatar change link for account with profile image set', function () {
          assert.ok(view.$('.avatar-wrapper a').length);
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

      describe('signOut', function () {
        it('on success, signs the user out, redirects to the signin page', function () {
          sinon.stub(fxaClient, 'signOut', function () {
            return p();
          });
          sinon.spy(user, 'clearSignedInAccount');

          return view.signOut()
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

          return view.signOut()
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
              return view.afterVisible();
            })
            .then(function () {
              assert.equal(routerMock.page, 'settings/avatar/change');
            });
        });
      });

      describe('hide success', function () {
        it('displaySuccessUnsafe', function () {
          view.SUCCESS_MESSAGE_DELAY_MS = 5;
          var spy = sinon.spy(view, 'hideSuccess');

          return view.render()
            .then(function () {
              view.displaySuccessUnsafe('hi');
              return p().delay(10);
            })
            .then(function () {
              assert.isTrue(spy.called, 'hide success called');
            });
        });

        it('displaySuccess', function () {
          view.SUCCESS_MESSAGE_DELAY_MS = 5;
          var spy = sinon.spy(view, 'hideSuccess');

          return view.render()
            .then(function () {
              view.displaySuccess('hi');
              return p().delay(10);
            })
            .then(function () {
              assert.isTrue(spy.called, 'hide success called');
            });
        });
      });

      describe('communication preferences link', function () {
        beforeEach(function () {
          panelViews.push(CommunicationPreferencesView);
          createView();
          sinon.stub(routerMock, 'createView', function (View) {
            var subview = new SettingsPanelView();
            sinon.stub(subview, 'render', function () {
              return p('');
            });
            return subview;
          });
          sinon.stub(view, 'isUserAuthorized', function () {
            return p(true);
          });
        });

        it('is visible if enabled', function () {
          sinon.stub(able, 'choose', function () {
            return true;
          });

          return view.render()
            .then(function () {
              assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.true'));
              assert.isTrue(routerMock.createView.calledThrice);
              assert.equal(routerMock.createView.args[2][0], CommunicationPreferencesView);
            });
        });

        it('is not visible if disabled', function () {

          sinon.stub(able, 'choose', function () {
            return false;
          });

          return view.render()
            .then(function () {
              assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
              assert.isTrue(routerMock.createView.calledTwice, 'is only called for non-comm pref views');
            });
        });
      });

    });
  });
});
