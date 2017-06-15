/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const CommunicationPreferencesView = require('views/settings/communication_preferences');
  const ExperimentGroupingRules = require('lib/experiments/grouping-rules/index');
  const FormPrefill = require('models/form-prefill');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const ProfileClient = require('lib/profile-client');
  const ProfileErrors = require('lib/profile-errors');
  const ProfileImage = require('models/profile-image');
  const Relier = require('models/reliers/relier');
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const sinon = require('sinon');
  const SubPanels = require('views/sub_panels');
  const TestHelpers = require('../../lib/helpers');
  const TestTemplate = require('stache!templates/test_template');
  const User = require('models/user');
  const View = require('views/settings');

  const SettingsPanelView = BaseView.extend({
    className: 'panel',
    template: TestTemplate
  });

  Cocktail.mixin(
    SettingsPanelView,
    SettingsPanelMixin
  );

  describe('views/settings', function () {
    var account;
    var experimentGroupingRules;
    var formPrefill;
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
    var UID = TestHelpers.createUid();

    function createView(Constructor, options) {
      return new Constructor(options);
    }

    function createSettingsView () {
      view = new View({
        childView: initialChildView,
        createView,
        experimentGroupingRules,
        formPrefill,
        metrics,
        notifier,
        panelViews,
        relier,
        subPanels,
        user,
        viewName: 'settings'
      });

      sinon.spy(view, 'navigate');
      sinon.stub(view, 'clearSessionAndNavigateToSignIn', () => {});
    }

    beforeEach(function () {
      experimentGroupingRules = new ExperimentGroupingRules();
      formPrefill = new FormPrefill();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      profileClient = new ProfileClient();
      relier = new Relier();

      user = new User({
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
        sinon.stub(view, 'checkAuthorization', function () {
          return p(true);
        });
        return view.render()
          .then(function () {
            $('#container').append(view.el);
          })
          .then(function () {
            assert.ok(view.$('#fxa-settings-header').length);
            assert.isTrue(view.mustVerify);
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.setSignedInAccountByUid.calledWith(UID));
          });
      });

      it('clears session information if uid is not found', function () {
        var account = user.initAccount({});

        sinon.stub(user, 'sessionStatus', () => p.reject(AuthErrors.toError('INVALID_TOKEN')));
        sinon.stub(user, 'getAccountByUid', () => account);
        sinon.spy(user, 'clearSignedInAccount');

        relier.set('uid', UID);

        createSettingsView();

        return view.render()
          .then(function () {
            assert.isTrue(user.getAccountByUid.calledWith(UID));
            assert.isTrue(user.clearSignedInAccount.calledOnce);
          });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        sinon.stub(view, 'checkAuthorization', function () {
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
        sinon.spy(view, 'displayStatusMessages');
        sinon.spy(view, 'logView');
        sinon.stub($.modal, 'isActive', function () {
          return true;
        });
        sinon.stub($.modal, 'close', function () { });
        notifier.trigger('navigate-from-child-view');
        assert.isTrue(view.displayStatusMessages.called);
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

      it('handles signed in account displayName/email change', () => {
        const account = user.getSignedInAccount();
        account.set({
          displayName: 'testuser',
          email: 'testuser@testuser.com'
        });

        return view.render()
          .then(() => {
            account.set('displayName', '');

            assert.equal(view.$('.card-header').text(), 'testuser@testuser.com');
            assert.equal(view.$('.card-subheader').text(), '');

            account.set('displayName', 'testuser');
            assert.equal(view.$('.card-header').text(), 'testuser');
            assert.equal(view.$('.card-subheader').text(), 'testuser@testuser.com');

            account.set('email', 'testuser2@testuser.com');
            assert.equal(view.$('.card-header').text(), 'testuser');
            assert.equal(view.$('.card-subheader').text(), 'testuser2@testuser.com');
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

      describe('signOut', () => {
        it('on success, logs events and calls clearSessionAndNavigateToSignIn', () => {
          sinon.stub(account, 'signOut', () => p());

          return view.signOut()
            .then(() => {
              assert.isTrue(account.signOut.calledOnce);

              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.submit'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.success'));
              assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.signout.error'));

              assert.equal(view.clearSessionAndNavigateToSignIn.callCount, 1);
              assert.lengthOf(view.clearSessionAndNavigateToSignIn.args[0], 0);
            });
        });

        it('on error, logs events and calls clearSessionAndNavigateToSignIn', () => {
          sinon.stub(account, 'signOut', () => {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          return view.signOut()
            .then(() => {
              assert.isTrue(account.signOut.calledOnce);

              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.submit'));
              // track the error, but success is still finally called
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.error'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.signout.success'));
              assert.equal(view.clearSessionAndNavigateToSignIn.callCount, 1);
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
        it('unsafeDisplaySuccess', function () {
          view.SUCCESS_MESSAGE_DELAY_MS = 5;
          var spy = sinon.spy(view, 'hideSuccess');

          return view.render()
            .then(function () {
              view.unsafeDisplaySuccess('hi');
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

        var options = {};
        return view.showChildView(SettingsPanelView, options)
          .then(function () {
            assert.isTrue(subPanels.showChildView.calledWith(SettingsPanelView, options));
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
          sinon.stub(experimentGroupingRules, 'choose', function () {
            return true;
          });
          createSettingsView();

          assert.isTrue(experimentGroupingRules.choose.calledWith('communicationPrefsVisible'));
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
          sinon.stub(experimentGroupingRules, 'choose', function () {
            return false;
          });
          createSettingsView();

          assert.isTrue(experimentGroupingRules.choose.calledWith('communicationPrefsVisible'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.communication-prefs-link.visible.false'));
          assert.isTrue(SubPanels.prototype.initialize.calledWith({
            createView: createView,
            initialChildView: SettingsPanelView,
            panelViews: [SettingsPanelView],
            parent: view
          }));
        });

        it('initialize SubPanels without CommunicationPreferencesView', function () {
          sinon.spy(experimentGroupingRules, 'choose');
          createSettingsView();

          assert.isFalse(experimentGroupingRules.choose.called);
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

    describe('with no relier specified uid', function () {
      it('does nothing', function () {
        relier.unset('uid');

        var sandbox = new sinon.sandbox.create(); // eslint-disable-line new-cap
        sandbox.spy(user, 'setSignedInAccountByUid');
        sandbox.spy(user, 'clearSignedInAccount');

        assert.isFalse(user.setSignedInAccountByUid.called);
        assert.isFalse(user.clearSignedInAccount.called);
        sandbox.restore();

      });
    });

    describe('cached/uncached', function () {
      beforeEach(function () {
        sinon.spy(user, 'setSignedInAccountByUid');
        sinon.spy(user, 'clearSignedInAccount');

        relier.set('uid', 'uid');
      });

      describe('with uncached relier specified uid', function () {
        it('clears the signed in account', function () {
          createSettingsView();

          assert.isFalse(user.setSignedInAccountByUid.called);
          assert.isTrue(user.clearSignedInAccount.called);
        });
      });

      describe('with cached relier specified uid', function () {
        it('sets the signed in account', function () {
          return user.setAccount({ uid: 'uid' })
            .then(function () {
              createSettingsView();

              assert.isTrue(user.setSignedInAccountByUid.calledWith('uid'));
              assert.isFalse(user.clearSignedInAccount.called);
            });
        });
      });

      describe('with uncached relier specified uid', function () {
        it('clears the signed in account', function () {
          createSettingsView();

          assert.isFalse(user.setSignedInAccountByUid.called);
          assert.isTrue(user.clearSignedInAccount.called);
        });
      });
    });
  });
});
