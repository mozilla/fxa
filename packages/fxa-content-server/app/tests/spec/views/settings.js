/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'cocktail',
  'underscore',
  'views/settings',
  'views/base',
  'views/sub_panels',
  'views/settings/communication_preferences',
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
  'models/form-prefill',
  'models/notifications',
  'models/reliers/relier',
  'models/profile-image',
  'models/user',
  'stache!templates/test_template'
],
function (chai, $, sinon, Cocktail, _, View, BaseView, SubPanels,
  CommunicationPreferencesView, SettingsPanelMixin, RouterMock, TestHelpers,
  FxaClient, p, ProfileClient, ProfileErrors, AuthErrors, Able, Metrics,
  FormPrefill, Notifications, Relier, ProfileImage, User, TestTemplate) {
  'use strict';

  var assert = chai.assert;

  var SettingsPanelView = BaseView.extend({
    className: 'panel',
    template: TestTemplate
  });

  Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);

  describe('views/settings', function () {
    var able;
    var account;
    var formPrefill;
    var fxaClient;
    var initialChildView;
    var metrics;
    var notifications;
    var panelViews;
    var profileClient;
    var relier;
    var routerMock;
    var subPanels;
    var user;
    var view;

    var ACCESS_TOKEN = 'access token';
    var UID = 'uid';

    function createView () {
      view = new View({
        able: able,
        childView: initialChildView,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        notifications: notifications,
        panelViews: panelViews,
        relier: relier,
        router: routerMock,
        subPanels: subPanels,
        user: user,
        viewName: 'settings'
      });
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

      formPrefill = new FormPrefill();

      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'abc123',
        uid: UID,
        verified: true
      });
      sinon.stub(account, 'fetchProfile', function () {
        return p();
      });

      able = new Able();

      subPanels = new SubPanels();
      sinon.stub(subPanels, 'render', function () {
        return p();
      });

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

      it('on navigate from childView', function () {
        sinon.spy(view, 'showEphemeralMessages');
        sinon.spy(view, 'logView');
        sinon.stub($.modal, 'isActive', function () {
          return true;
        });
        sinon.stub($.modal, 'close', function () { });
        notifications.trigger('navigate-from-child-view');
        assert.isTrue(view.showEphemeralMessages.called);
        assert.isTrue(view.logView.called);
        assert.isTrue($.modal.isActive.called);
        assert.isTrue($.modal.close.called);
        $.modal.isActive.restore();
        $.modal.close.restore();
      });

      it('afterVisible', function () {
        sinon.stub(subPanels, 'setElement', function () {});
        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.afterVisible();
          })
          .then(function () {
            assert.isTrue(subPanels.setElement.called);
            assert.isTrue(subPanels.render.called);
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

      it('shows avatar change link', function () {
        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.afterVisible();
          })
          .then(function () {
            assert.ok(view.$('.avatar-wrapper a').length);
          });
      });

      describe('with a profile image set', function () {
        beforeEach(function () {
          var image = new ProfileImage({ id: 'foo', img: new Image(), url: 'url' });
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
        it('on success, signs the user out, clears formPrefill info, redirects to the signin page', function () {
          sinon.stub(fxaClient, 'signOut', function () {
            return p();
          });
          sinon.spy(user, 'clearSignedInAccount');
          sinon.spy(view, 'navigate');

          formPrefill.set('email', 'testuser@testuser.com');
          formPrefill.set('password', 'password');

          return view.signOut()
            .then(function () {
              assert.isTrue(user.clearSignedInAccount.called);

              assert.equal(view.navigate.callCount, 1);
              var args = view.navigate.args[0];
              assert.lengthOf(args, 2);
              assert.equal(args[0], 'signin');
              assert.deepEqual(args[1], {
                clearQueryParams: true,
                success: 'Signed out successfully'
              });

              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.submit'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.success'));
              assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.signout.error'));

              assert.isFalse(formPrefill.has('email'));
              assert.isFalse(formPrefill.has('password'));

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

      it('it calls showChildView on subPanels', function () {
        sinon.stub(subPanels, 'showChildView', function () {
          return p();
        });

        return view.showChildView(SettingsPanelView)
          .then(function () {
            assert.isTrue(subPanels.showChildView.calledWith(SettingsPanelView));
          });
      });

      describe('initialize subPanels', function () {
        beforeEach(function () {
          subPanels = null;
          panelViews = [
            SettingsPanelView
          ];
          sinon.stub(SubPanels.prototype, 'initialize', function () {
          });
          initialChildView = SettingsPanelView;
        });

        afterEach(function () {
          SubPanels.prototype.initialize.restore();
        });

        it('CommunicationPreferencesView is visible if enabled', function () {
          panelViews.push(CommunicationPreferencesView);
          sinon.stub(able, 'choose', function () {
            return true;
          });
          createView();

          assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.true'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            initialChildView: SettingsPanelView,
            panelViews: panelViews,
            parent: view,
            router: routerMock
          }));
        });

        it('CommunicationPreferencesView is not visible if disabled', function () {
          panelViews.push(CommunicationPreferencesView);
          sinon.stub(able, 'choose', function () {
            return false;
          });
          createView();

          assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            initialChildView: SettingsPanelView,
            panelViews: [SettingsPanelView],
            parent: view,
            router: routerMock
          }));
        });

        it('initialize SubPanels without CommunicationPreferencesView', function () {
          sinon.spy(able, 'choose');
          createView();

          assert.isFalse(able.choose.called);
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            initialChildView: SettingsPanelView,
            panelViews: [SettingsPanelView],
            parent: view,
            router: routerMock
          }));
        });
      });

      describe('render with a displayName that contains XSS', function () {
        it('should escape the displayName', function () {
          var xssDisplayName = '<script>alert(1)</script>';
          account.set('displayName', xssDisplayName);

          return view.render()
            .then(function () {
              assert.equal(view.$('.card-header').html(), _.escape(xssDisplayName));
            });
        });
      });

      describe('render with an email that contains XSS', function () {
        it('should escape the email', function () {
          var xssEmail = '<script>alert(1)</script>';
          account.unset('displayName');
          account.set('email', xssEmail);

          return view.render()
            .then(function () {
              assert.equal(view.$('.card-header').html(), _.escape(xssEmail));
            });
        });
      });

      describe('render with both displayName and email that contains XSS', function () {
        it('should escape the email', function () {
          var xssDisplayName = '<script>alert(1)</script>';
          account.set('displayName', xssDisplayName);

          var xssEmail = '<script>alert(2)</script>';
          account.set('email', xssEmail);

          return view.render()
            .then(function () {
              assert.equal(view.$('.card-header').html(), _.escape(xssDisplayName));
              assert.equal(view.$('.card-subheader').html(), _.escape(xssEmail));
            });
        });
      });
    });


    describe('_swapDisplayName', function () {
      beforeEach(function () {
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(true);
        });
        account.set('accessToken', ACCESS_TOKEN);
      });

      // the following four tests
      // confirm that the dom displays correctly
      // when the _swapDisplayName method is called
      describe('with no display name', function () {
        it('should show email address in header', function () {
          return view.render()
            .then(function () {
              view._swapDisplayName();

              assert.equal(view.$('.card-header').text(), 'a@a.com');
              assert.equal(view.$('.card-subheader').text(), '');
            });
        });
      });

      describe('with display name removed', function () {
        it('should place the email in the header', function () {
          account.set('displayName', 'test user');

          return view.render()
            .then(function () {
              account.unset('displayName');

              view._swapDisplayName();

              assert.equal(view.$('.card-header').text(), 'a@a.com');
              assert.equal(view.$('.card-subheader').text(), '');
            });
        });
      });

      describe('with display name changed', function () {
        it('should place a new display name in the header', function () {
          account.set('displayName', 'test user one');

          return view.render()
            .then(function () {
              account.set('displayName', 'test user two');

              view._swapDisplayName();

              assert.equal(view.$('.card-header').text(), 'test user two');
              assert.equal(view.$('.card-subheader').text(), 'a@a.com');
            });
        });
      });

      describe('with display name added', function () {
        it('should show email by default then add display name to header and email to subheader', function () {
          return view.render()
            .then(function () {
              assert.equal(view.$('.card-header').text(), 'a@a.com');
              assert.equal(view.$('.card-subheader').text(), '');

              account.set('displayName', 'test user');

              view._swapDisplayName();

              assert.equal(view.$('.card-header').text(), 'test user');
              assert.equal(view.$('.card-subheader').text(), 'a@a.com');
            });
        });
      });

      describe('with a displayName that contains XSS', function () {
        it('should escape the displayName', function () {

          return view.render()
            .then(function () {
              var xssDisplayName = '<script>alert(1)</script>';
              account.set('displayName', xssDisplayName);

              view._swapDisplayName();

              assert.equal(
                view.$('.card-header').html(), _.escape(xssDisplayName));
            });
        });
      });

      describe('with an email that contains XSS', function () {
        it('should escape the email', function () {

          return view.render()
            .then(function () {
              var xssEmail = '<script>alert(1)</script>';
              account.unset('displayName');
              account.set('email', xssEmail);

              view._swapDisplayName();

              assert.equal(view.$('.card-header').html(), _.escape(xssEmail));
            });
        });
      });

      describe('with both displayName and email that contains XSS', function () {
        it('should escape the email', function () {
          return view.render()
            .then(function () {
              var xssDisplayName = '<script>alert(1)</script>';
              account.set('displayName', xssDisplayName);

              var xssEmail = '<script>alert(2)</script>';
              account.set('email', xssEmail);

              view._swapDisplayName();

              assert.equal(
                  view.$('.card-header').html(), _.escape(xssDisplayName));
              assert.equal(
                  view.$('.card-subheader').html(), _.escape(xssEmail));
            });
        });
      });
    });
  });
});
