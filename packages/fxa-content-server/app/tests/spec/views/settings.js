/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Cocktail from 'cocktail';
import CommunicationPreferencesView from 'views/settings/communication_preferences';
import SubscriptionView from 'views/settings/subscription';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules/index';
import FormPrefill from 'models/form-prefill';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import p from 'lib/promise';
import ProfileClient from 'lib/profile-client';
import ProfileErrors from 'lib/profile-errors';
import ProfileImage from 'models/profile-image';
import Relier from 'models/reliers/relier';
import SettingsPanelMixin from 'views/mixins/settings-panel-mixin';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import TestTemplate from 'templates/test_template.mustache';
import User from 'models/user';
import View from 'views/settings';

const SettingsPanelView = BaseView.extend({
  className: 'panel',
  template: TestTemplate,
});

Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);

describe('views/settings', function() {
  var account;
  var broker;
  var experimentGroupingRules;
  var formPrefill;
  var initialChildView;
  var marketingEmailEnabled;
  var subscriptionsManagementEnabled;
  var subscriptionsManagementLanguages;
  var metrics;
  var notifier;
  var profileClient;
  var relier;
  var user;
  var view;

  var ACCESS_TOKEN = 'access token';
  var UID = TestHelpers.createUid();
  let subPanelRenderSpy;

  function createView(Constructor, options) {
    return new Constructor(options);
  }

  function createSettingsView() {
    subPanelRenderSpy = sinon.spy(() => Promise.resolve());
    broker = new Broker();
    view = new View({
      broker: broker,
      childView: initialChildView,
      config: {
        lang: 'en',
      },
      createView,
      experimentGroupingRules,
      formPrefill,
      marketingEmailEnabled,
      metrics,
      notifier,
      relier,
      subscriptionsManagementEnabled,
      subscriptionsManagementLanguages,
      user,
      viewName: 'settings',
    });

    sinon.spy(view, 'navigate');
    sinon.stub(view, 'clearSessionAndNavigateToSignIn').callsFake(() => {});
    sinon.stub(view, '_initializeSubPanels').callsFake(() => {
      return {
        render: subPanelRenderSpy,
      };
    });
  }

  beforeEach(function() {
    experimentGroupingRules = new ExperimentGroupingRules();
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    marketingEmailEnabled = true;
    metrics = new Metrics({ notifier });
    // prevents metrics from being flushed
    // so we can check if they were emit
    sinon.stub(metrics, 'flush');

    profileClient = new ProfileClient();
    subscriptionsManagementEnabled = false;
    subscriptionsManagementLanguages = ['en'];
    relier = new Relier();
    relier.set('uid', 'wibble');

    user = new User({
      notifier: notifier,
      profileClient: profileClient,
    });

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    sinon.stub(account, 'fetchProfile').callsFake(function() {
      return Promise.resolve();
    });
    sinon.spy(notifier, 'trigger');

    createSettingsView();

    sinon.stub(user, 'getSignedInAccount').callsFake(function() {
      return account;
    });
  });

  afterEach(function() {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  it('emits set-uid event correctly', () => {
    assert.equal(notifier.trigger.callCount, 1);
    const args = notifier.trigger.args[0];
    assert.equal(args[0], 'set-uid');
    assert.equal(args[1], 'wibble');
  });

  describe('setInitialContext:', () => {
    let context;

    beforeEach(() => {
      context = {
        set: sinon.spy(),
      };
      view.displayError = sinon.spy();
    });

    it('called context.set', () => {
      view.setInitialContext(context);
      assert.equal(context.set.callCount, 1);
      const args = context.set.args[0];
      assert.lengthOf(args, 1);
      assert.isFalse(args[0].ccExpired);
      assert.equal(
        args[0].escapedCcExpiredLinkAttrs,
        'href="/subscriptions" class="alert-link"'
      );
      assert.isTrue(args[0].showSignOut);
      assert.isString(args[0].unsafeHeaderHTML);
    });

    describe('beforeRender with expired card:', () => {
      beforeEach(() => {
        sinon.stub(account, 'settingsData').callsFake(() =>
          Promise.resolve({
            subscriptions: [
              { foo: 'bar' },
              { baz: 'qux', failure_code: 'expired_card' },
            ],
          })
        );
        return view.beforeRender();
      });

      it('set ccExpired to true', () => {
        view.setInitialContext(context);
        assert.equal(context.set.callCount, 1);
        assert.isTrue(context.set.args[0][0].ccExpired);
        assert.equal(view.displayError.callCount, 0);
      });

      it('did not set error on the model', () => {
        const error = view.model.get('error');
        assert.isUndefined(error);
      });
    });

    describe('beforeRender with some other failure:', () => {
      beforeEach(() => {
        sinon.stub(account, 'settingsData').callsFake(() =>
          Promise.resolve({
            subscriptions: [
              { foo: 'bar' },
              { baz: 'qux', failure_code: 'email_invalid' },
            ],
          })
        );
        return view.beforeRender();
      });

      it('set ccExpired to false', () => {
        view.setInitialContext(context);
        assert.equal(context.set.callCount, 1);
        assert.isFalse(context.set.args[0][0].ccExpired);
        assert.equal(view.displayError.callCount, 0);
      });

      it('did not set error on the model', () => {
        const error = view.model.get('error');
        assert.isUndefined(error);
      });
    });

    describe('beforeRender without subscriptions:', () => {
      beforeEach(() => {
        sinon.stub(account, 'settingsData').callsFake(() =>
          Promise.resolve({
            subscriptions: {},
          })
        );
        return view.beforeRender();
      });

      it('set ccExpired to false', () => {
        view.setInitialContext(context);
        assert.equal(context.set.callCount, 1);
        assert.isFalse(context.set.args[0][0].ccExpired);
        assert.equal(view.displayError.callCount, 0);
      });

      it('did not set error on the model', () => {
        const error = view.model.get('error');
        assert.isUndefined(error);
      });
    });

    describe('beforeRender with settingsData rejection:', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'settingsData')
          .callsFake(() => Promise.reject(new Error('WIBBLE')));
        return view.beforeRender();
      });

      it('set ccExpired to false', () => {
        view.setInitialContext(context);
        assert.equal(context.set.callCount, 1);
        assert.isFalse(context.set.args[0][0].ccExpired);
        assert.equal(view.displayError.callCount, 0);
      });

      it('set error on the model', () => {
        const error = view.model.get('error');
        assert.instanceOf(error, Error);
        assert.equal(error.message, 'WIBBLE');
      });
    });

    describe('beforeRender with Firefox iOS entrypoint', () => {
      beforeEach(() => {
        relier.set('entrypoint', 'ios_settings_manage');
        return view.beforeRender();
      });

      it('set showSignOut to false', () => {
        view.setInitialContext(context);
        assert.equal(context.set.callCount, 1);
        assert.isFalse(context.set.args[0][0].showSignOut);
      });
    });
  });

  describe('with uid', function() {
    beforeEach(function() {
      sinon.stub(account, 'settingsData').callsFake(() => Promise.resolve({}));
      relier.set('uid', UID);
    });

    it('shows the settings page for a selected uid', function() {
      sinon.stub(user, 'getAccountByUid').callsFake(function() {
        return account;
      });
      sinon.stub(user, 'setSignedInAccountByUid').callsFake(function() {
        return Promise.resolve();
      });
      account.set('accessToken', ACCESS_TOKEN);

      createSettingsView();
      sinon.stub(view, 'checkAuthorization').callsFake(function() {
        return Promise.resolve(true);
      });
      return view
        .render()
        .then(function() {
          $('#container').append(view.el);
        })
        .then(function() {
          assert.ok(view.$('#fxa-settings-header').length);
          assert.isTrue(view.mustVerify);
          assert.isTrue(user.getAccountByUid.calledWith(UID));
          assert.isTrue(user.setSignedInAccountByUid.calledWith(UID));
        });
    });

    it('clears session information if uid is not found', function() {
      var account = user.initAccount({});

      sinon
        .stub(user, 'sessionStatus')
        .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));
      sinon.stub(user, 'getAccountByUid').callsFake(() => account);
      sinon.spy(user, 'clearSignedInAccount');

      relier.set('uid', UID);
      sinon.spy(metrics, 'logEvent');

      createSettingsView();

      return view.render().then(function() {
        assert.isTrue(user.getAccountByUid.calledWith(UID));
        assert.isTrue(user.clearSignedInAccount.calledOnce);
        assert.isTrue(metrics.logEvent.calledWith('settings.signout.forced'));
      });
    });
  });

  describe('with session', function() {
    beforeEach(function() {
      sinon.stub(account, 'settingsData').callsFake(() => Promise.resolve({}));
      sinon.stub(view, 'checkAuthorization').callsFake(function() {
        return Promise.resolve(true);
      });
      account.set('accessToken', ACCESS_TOKEN);
    });

    it('shows the settings page and sub panels', function() {
      return view.render().then(function() {
        assert.ok(view.$('#fxa-settings-header').length);
        assert.isTrue($('body').hasClass('settings'));
        assert.isTrue(view._initializeSubPanels.calledOnce);
        assert.isTrue(subPanelRenderSpy.calledOnce);
      });
    });

    it('on navigate from childView', function() {
      sinon.spy(view, 'displayStatusMessages');
      sinon.spy(view, 'logView');
      sinon.stub($.modal, 'isActive').callsFake(function() {
        return true;
      });
      sinon.stub($.modal, 'close').callsFake(function() {});
      notifier.trigger('navigate-from-child-view');
      assert.isTrue(view.displayStatusMessages.called);
      assert.isFalse(view.logView.called);
      assert.isTrue($.modal.isActive.called);
      assert.isTrue($.modal.close.called);
      $.modal.isActive.restore();
      $.modal.close.restore();
    });

    it('on profile change', function() {
      return view
        .render()
        .then(function() {
          $('#container').append(view.el);
          return view.afterVisible();
        })
        .then(function() {
          sinon.spy(view, 'displayAccountProfileImage');
          view.onProfileUpdate();
          assert.isTrue(view.displayAccountProfileImage.calledWith(account));
        });
    });

    it('handles signed in account displayName/email change', () => {
      const account = user.getSignedInAccount();
      account.set({
        displayName: 'testuser',
        email: 'testuser@testuser.com',
      });

      return view.render().then(() => {
        account.set('displayName', '');

        assert.equal(view.$('.card-header').text(), 'testuser@testuser.com');
        assert.equal(view.$('.card-subheader').text(), '');

        account.set('displayName', 'testuser');
        assert.equal(view.$('.card-header').text(), 'testuser');
        assert.equal(view.$('.card-subheader').text(), 'testuser@testuser.com');

        account.set('email', 'testuser2@testuser.com');
        assert.equal(view.$('.card-header').text(), 'testuser');
        assert.equal(
          view.$('.card-subheader').text(),
          'testuser2@testuser.com'
        );
      });
    });

    it('shows avatar change link', function() {
      return view
        .render()
        .then(function() {
          $('#container').append(view.el);
          return view.afterVisible();
        })
        .then(function() {
          assert.ok(view.$('.avatar-wrapper a').length);
        });
    });

    describe('with a profile image set', function() {
      beforeEach(function() {
        var image = new ProfileImage({
          id: 'foo',
          img: new Image(),
          url: 'url',
        });
        sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
          return Promise.resolve(image);
        });

        return view.render().then(function() {
          $('#container').append(view.el);
          return view.afterVisible();
        });
      });

      it('shows avatar change link for account with profile image set', function() {
        assert.ok(view.$('.avatar-wrapper a').length);
      });
    });

    describe('with a profile image previously set', function() {
      beforeEach(function() {
        account.set('hadProfileImageSetBefore', true);

        return view.render().then(function() {
          $('#container').append(view.el);
          return view.afterVisible();
        });
      });

      it('shows avatar change link for account with profile image set', function() {
        assert.ok(view.$('.avatar-wrapper a').length);
      });
    });

    it('has no avatar set', function() {
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({});
      });

      return view
        .render()
        .then(function() {
          return view.afterVisible();
        })
        .then(function() {
          assert.equal(view.$('.avatar-wrapper img').length, 0);
          assert.equal(view.$('.avatar-wrapper.with-default').length, 1);
        });
    });

    it('has avatar but does not load', function() {
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({ avatar: 'blah.jpg', id: 'foo' });
      });

      return view
        .render()
        .then(function() {
          return view.afterVisible();
        })
        .then(function() {
          assert.equal(view.$('.avatar-wrapper img').length, 0);
          assert.equal(view.$('.avatar-wrapper.with-default').length, 1);

          var err = ProfileErrors.toError('IMAGE_LOAD_ERROR');
          err.context = 'blah.jpg';
          assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
        });
    });

    it('has an avatar set', function() {
      var url =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';
      var id = 'foo';

      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({ avatar: url, id: id });
      });

      return view
        .render()
        .then(function() {
          return view.afterVisible();
        })
        .then(function() {
          assert.equal(view.$('.avatar-wrapper img').attr('src'), url);
          assert.equal(view.$('.avatar-wrapper.with-default').length, 0);
        });
    });

    describe('signOut', () => {
      it('on success, logs events and calls clearSessionAndNavigateToSignIn', () => {
        sinon.stub(account, 'signOut').callsFake(() => Promise.resolve());

        return view.signOut().then(() => {
          assert.isTrue(account.signOut.calledOnce);

          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.signout.submit')
          );
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.signout.success')
          );
          assert.isFalse(
            TestHelpers.isEventLogged(metrics, 'settings.signout.error')
          );

          assert.equal(view.clearSessionAndNavigateToSignIn.callCount, 1);
          assert.lengthOf(view.clearSessionAndNavigateToSignIn.args[0], 0);
        });
      });

      it('on error, logs events and calls clearSessionAndNavigateToSignIn', () => {
        sinon.stub(account, 'signOut').callsFake(() => {
          return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.signOut().then(() => {
          assert.isTrue(account.signOut.calledOnce);

          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.signout.submit')
          );
          // track the error, but success is still finally called
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.signout.error')
          );
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.signout.success')
          );
          assert.equal(view.clearSessionAndNavigateToSignIn.callCount, 1);
        });
      });
    });

    describe('desktop context', function() {
      it('does not show sign out link', function() {
        sinon.stub(account, 'isFromSync').callsFake(function() {
          return true;
        });

        return view.render().then(function() {
          assert.equal(view.$('#signout').length, 0);
        });
      });
    });

    describe('setting param', function() {
      it('when setting param is set to avatar, navigates to avatar change view', function() {
        relier.set('setting', 'avatar');

        return view
          .render()
          .then(function() {
            return view.afterVisible();
          })
          .then(function() {
            assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
          });
      });
    });

    describe('hide success', function() {
      it('unsafeDisplaySuccess', function() {
        view.SUCCESS_MESSAGE_DELAY_MS = 5;
        var spy = sinon.spy(view, 'hideSuccess');

        return view
          .render()
          .then(function() {
            view.unsafeDisplaySuccess('hi');
            return p.delay(10);
          })
          .then(function() {
            assert.isTrue(spy.called, 'hide success called');
          });
      });

      it('displaySuccess', function() {
        view.SUCCESS_MESSAGE_DELAY_MS = 5;
        var spy = sinon.spy(view, 'hideSuccess');

        return view
          .render()
          .then(function() {
            view.displaySuccess('hi');
            return p.delay(10);
          })
          .then(function() {
            assert.isTrue(spy.called, 'hide success called');
          });
      });
    });

    it('it calls showChildView on subPanels', function() {
      view._subPanels = {
        showChildView: sinon.spy(() => Promise.resolve()),
      };
      const options = {};
      return view.showChildView(SettingsPanelView, options).then(() => {
        assert.isTrue(
          view._subPanels.showChildView.calledWith(SettingsPanelView, options)
        );
      });
    });

    it('_initializeSubPanels initializes a SubPanels instance', function() {
      view._initializeSubPanels.restore();
      sinon.spy(view, '_getPanelsToDisplay');
      const subPanels = view._initializeSubPanels($('#container')[0]);
      assert.ok(subPanels);
      assert.isTrue(view._getPanelsToDisplay.called);
    });

    describe('_getPanelsToDisplay', () => {
      it('CommunicationPreferencesView is visible if enabled', function() {
        sinon.stub(view, '_areCommunicationPrefsVisible').callsFake(() => true);
        const panelsToDisplay = view._getPanelsToDisplay();
        assert.include(panelsToDisplay, CommunicationPreferencesView);
      });

      it('CommunicationPreferencesView is not visible if disabled', function() {
        sinon
          .stub(view, '_areCommunicationPrefsVisible')
          .callsFake(() => false);
        const panelsToDisplay = view._getPanelsToDisplay();
        assert.notInclude(panelsToDisplay, CommunicationPreferencesView);
      });

      it('SubscriptionView is visible if enabled', function() {
        const tmp = view._subscriptionsManagementEnabled;
        view._subscriptionsManagementEnabled = true;
        const panelsToDisplay = view._getPanelsToDisplay();
        assert.include(panelsToDisplay, SubscriptionView);
        view._subscriptionsManagementEnabled = tmp;
      });

      it('SubscriptionView is not visible if disabled', function() {
        const tmp = view._subscriptionsManagementEnabled;
        view._subscriptionsManagementEnabled = false;
        const panelsToDisplay = view._getPanelsToDisplay();
        assert.notInclude(panelsToDisplay, SubscriptionView);
        view._subscriptionsManagementEnabled = tmp;
      });
    });

    describe('_areCommunicationPrefsVisible', () => {
      beforeEach(() => {
        createSettingsView();
      });

      it('returns `false` if the grouping rules says false', () => {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(() => false);
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isFirefoxIos: () => false,
          };
        });
        assert.isFalse(view._areCommunicationPrefsVisible());
      });

      it('returns `false` if on Fx for iOS', () => {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(() => true);
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isFirefoxIos: () => true,
          };
        });
        assert.isFalse(view._areCommunicationPrefsVisible());
      });

      it('returns `true` if not Fx for iOS and grouping rules says true', () => {
        sinon.stub(experimentGroupingRules, 'choose').callsFake(() => true);
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isFirefoxIos: () => false,
          };
        });
        assert.isTrue(view._areCommunicationPrefsVisible());
      });
    });

    describe('render with a displayName that contains XSS', function() {
      it('should escape the displayName', function() {
        var xssDisplayName = '<script>alert(1)</script>';
        account.set('displayName', xssDisplayName);

        return view.render().then(function() {
          assert.equal(view.$('.card-header').html(), _.escape(xssDisplayName));
        });
      });
    });

    describe('render with an email that contains XSS', function() {
      it('should escape the email', function() {
        var xssEmail = '<script>alert(1)</script>';
        account.unset('displayName');
        account.set('email', xssEmail);

        return view.render().then(function() {
          assert.equal(view.$('.card-header').html(), _.escape(xssEmail));
        });
      });
    });

    describe('render with both displayName and email that contains XSS', function() {
      it('should escape the email', function() {
        var xssDisplayName = '<script>alert(1)</script>';
        account.set('displayName', xssDisplayName);

        var xssEmail = '<script>alert(2)</script>';
        account.set('email', xssEmail);

        return view.render().then(function() {
          assert.equal(view.$('.card-header').html(), _.escape(xssDisplayName));
          assert.equal(view.$('.card-subheader').html(), _.escape(xssEmail));
        });
      });
    });

    describe('render with expired card:', () => {
      beforeEach(() => {
        account.settingsData.restore();
        sinon.stub(account, 'settingsData').callsFake(() =>
          Promise.resolve({
            subscriptions: [
              { foo: 'bar' },
              { baz: 'qux', failure_code: 'expired_card' },
            ],
          })
        );
        return view.render();
      });

      it('rendered the alert', () => {
        const $el = view.$('.cc-expired-alert');
        assert.lengthOf($el, 1);
        assert.equal(
          $el[0].innerHTML.trim(),
          'Your credit card has expired. Please update it <a href="/subscriptions" class="alert-link">here</a>.'
        );
      });

      it('did not render an error', () => {
        const $el = view.$('.error');
        assert.lengthOf($el, 1);
        assert.isFalse($el.hasClass('visible'));
        assert.equal($el[0].innerHTML.trim(), '');
      });
    });

    describe('render with non-expired card:', () => {
      beforeEach(() => {
        account.settingsData.restore();
        sinon.stub(account, 'settingsData').callsFake(() =>
          Promise.resolve({
            subscriptions: [
              { foo: 'bar' },
              { baz: 'qux', failure_code: 'wibble' },
            ],
          })
        );
        return view.render();
      });

      it('did not render the alert', () => {
        const $el = view.$('.cc-expired-alert');
        assert.lengthOf($el, 0);
      });

      it('did not render an error', () => {
        const $el = view.$('.error');
        assert.lengthOf($el, 1);
        assert.isFalse($el.hasClass('visible'));
        assert.equal($el[0].innerHTML.trim(), '');
      });
    });

    describe('render with a failed request:', () => {
      beforeEach(() => {
        account.settingsData.restore();
        sinon
          .stub(account, 'settingsData')
          .callsFake(() => Promise.reject(new Error('WIBBLE')));
        return view.render();
      });

      it('did not render the alert', () => {
        const $el = view.$('.cc-expired-alert');
        assert.lengthOf($el, 0);
      });

      it('did not render an error', () => {
        const $el = view.$('.error');
        assert.lengthOf($el, 1);
        assert.isTrue($el.hasClass('visible'));
        assert.equal($el[0].innerHTML.trim(), 'Error: WIBBLE');
      });
    });
  });

  describe('with no relier specified uid', function() {
    it('does nothing', function() {
      relier.unset('uid');

      var sandbox = new sinon.sandbox.create(); // eslint-disable-line new-cap
      sandbox.spy(user, 'setSignedInAccountByUid');
      sandbox.spy(user, 'clearSignedInAccount');

      assert.isFalse(user.setSignedInAccountByUid.called);
      assert.isFalse(user.clearSignedInAccount.called);
      sandbox.restore();
    });
  });

  describe('cached/uncached', function() {
    beforeEach(function() {
      sinon.spy(user, 'setSignedInAccountByUid');
      sinon.spy(user, 'clearSignedInAccount');

      relier.set('uid', 'uid');
    });

    describe('with uncached relier specified uid', function() {
      it('clears the signed in account', function() {
        createSettingsView();

        assert.isFalse(user.setSignedInAccountByUid.called);
        assert.isTrue(user.clearSignedInAccount.called);
      });
    });

    describe('with cached relier specified uid', function() {
      it('sets the signed in account', function() {
        return user.setAccount({ email: 'email', uid: 'uid' }).then(function() {
          createSettingsView();

          assert.isTrue(user.setSignedInAccountByUid.calledWith('uid'));
          assert.isFalse(user.clearSignedInAccount.called);
        });
      });
    });

    describe('with uncached relier specified uid', function() {
      it('clears the signed in account', function() {
        createSettingsView();

        assert.isFalse(user.setSignedInAccountByUid.called);
        assert.isTrue(user.clearSignedInAccount.called);
      });
    });
  });
});
