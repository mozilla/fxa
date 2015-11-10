/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var Able = require('lib/able');
  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var CommunicationPreferencesView = require('views/settings/communication_preferences');
  var FormPrefill = require('models/form-prefill');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var ProfileClient = require('lib/profile-client');
  var ProfileErrors = require('lib/profile-errors');
  var ProfileImage = require('models/profile-image');
  var Relier = require('models/reliers/relier');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var sinon = require('sinon');
  var SubPanels = require('views/sub_panels');
  var TestHelpers = require('../../lib/helpers');
  var TestTemplate = require('stache!templates/test_template');
  var User = require('models/user');
  var View = require('views/settings');

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
    var notifier;
    var panelViews;
    var profileClient;
    var relier;
    var subPanels;
    var user;
    var view;

    var ACCESS_TOKEN = 'access token';
    var UID = 'uid';

    function createView(Constructor, options) {
      return new Constructor(options);
    }

    function createSettingsView () {
      view = new View({
        able: able,
        childView: initialChildView,
        createView: createView,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        panelViews: panelViews,
        relier: relier,
        subPanels: subPanels,
        user: user,
        viewName: 'settings'
      });

      sinon.spy(view, 'navigate');
    }

    beforeEach(function () {
      able = new Able();
      formPrefill = new FormPrefill();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      profileClient = new ProfileClient();
      relier = new Relier();

      user = new User({
        fxaClient: fxaClient,
        notifier: notifier,
        profileClient: profileClient
      });


      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'abc123',
        uid: UID,
        verified: true
      });
      sinon.stub(account, 'fetchProfile', function () {
        return p();
      });

      subPanels = new SubPanels();
      sinon.stub(subPanels, 'render', function () {
        return p();
      });

      createSettingsView();

      sinon.stub(user, 'getSignedInAccount', function () {
        return account;
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        user.getSignedInAccount.restore();
        return view.render()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signin'));
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

        createSettingsView();
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

        createSettingsView();
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(false);
        });

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
        notifier.trigger('navigate-from-child-view');
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
          sinon.spy(relier, 'unset');

          formPrefill.set('email', 'testuser@testuser.com');
          formPrefill.set('password', 'password');

          return view.signOut()
            .then(function () {
              assert.isTrue(user.clearSignedInAccount.called);

              assert.equal(relier.unset.callCount, 3);
              var args = relier.unset.args[0];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'uid');
              args = relier.unset.args[1];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'email');
              args = relier.unset.args[2];
              assert.lengthOf(args, 1);
              assert.equal(args[0], 'preVerifyToken');

              assert.equal(view.navigate.callCount, 1);
              args = view.navigate.args[0];
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

              assert.isTrue(view.navigate.calledWith('signin'));
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
              assert.isTrue(view.navigate.calledWith('signin'));
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
              assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
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
          createSettingsView();

          assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.true'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            createView: createView,
            initialChildView: SettingsPanelView,
            panelViews: panelViews,
            parent: view
          }));
        });

        it('CommunicationPreferencesView is not visible if disabled', function () {
          panelViews.push(CommunicationPreferencesView);
          sinon.stub(able, 'choose', function () {
            return false;
          });
          createSettingsView();

          assert.isTrue(able.choose.calledWith('communicationPrefsVisible'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            createView: createView,
            initialChildView: SettingsPanelView,
            panelViews: [SettingsPanelView],
            parent: view
          }));
        });

        it('initialize SubPanels without CommunicationPreferencesView', function () {
          sinon.spy(able, 'choose');
          createSettingsView();

          assert.isFalse(able.choose.called);
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            createView: createView,
            initialChildView: SettingsPanelView,
            panelViews: [SettingsPanelView],
            parent: view
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
