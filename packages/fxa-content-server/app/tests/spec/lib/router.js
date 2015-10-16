/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'backbone',
  'lib/router',
  'views/base',
  'views/settings/display_name',
  'views/sign_in',
  'views/settings',
  'lib/able',
  'lib/constants',
  'lib/environment',
  'lib/metrics',
  'models/notifications',
  'models/reliers/relier',
  'models/user',
  'models/form-prefill',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, Backbone, Router, BaseView, DisplayNameView,
  SignInView, SettingsView, Able, Constants, Environment, Metrics,
  Notifications, Relier, User, FormPrefill, NullBroker, WindowMock,
  TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('lib/router', function () {
    var able;
    var broker;
    var environment;
    var formPrefill;
    var metrics;
    var navigateOptions;
    var navigateUrl;
    var notifications;
    var relier;
    var router;
    var user;
    var windowMock;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      $('#container').empty().html('<div id="stage"></div>');

      able = new Able();
      formPrefill = new FormPrefill();
      metrics = new Metrics();
      notifications = new Notifications();
      user = new User();
      windowMock = new WindowMock();

      environment = new Environment(windowMock);

      relier = new Relier({
        window: windowMock
      });

      broker = new NullBroker({
        relier: relier
      });

      router = new Router({
        able: able,
        broker: broker,
        environment: environment,
        formPrefill: formPrefill,
        metrics: metrics,
        notifications: notifications,
        relier: relier,
        user: user,
        window: windowMock
      });

      sinon.stub(Backbone.Router.prototype, 'navigate', function (url, options) {
        navigateUrl = url;
        navigateOptions = options;
      });
    });

    afterEach(function () {
      metrics.destroy();
      windowMock = router = navigateUrl = navigateOptions = metrics = null;
      Backbone.Router.prototype.navigate.restore();
      $('#container').empty();
    });

    describe('navigate', function () {
      it('tells the router to navigate to a page', function () {
        windowMock.location.search = '';
        router.navigate('/signin');
        assert.equal(navigateUrl, '/signin');
        assert.deepEqual(navigateOptions, { trigger: true });
      });

      it('preserves window search parameters across screen transition', function () {
        windowMock.location.search = '?context=' + Constants.FX_DESKTOP_V1_CONTEXT;
        router.navigate('/forgot');
        assert.equal(navigateUrl, '/forgot?context=' + Constants.FX_DESKTOP_V1_CONTEXT);
        assert.deepEqual(navigateOptions, { trigger: true });
      });
    });

    describe('redirectToSignupOrSettings', function () {
      it('replaces current page with the signup page if there is no current account', function () {
        windowMock.location.search = '';
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/signup');
        assert.deepEqual(navigateOptions, { replace: true, trigger: true });
      });

      it('replaces the current page with the settings page if there is a current account', function () {
        windowMock.location.search = '';
        sinon.stub(user, 'getSignedInAccount', function () {
          return user.initAccount({
            sessionToken: 'abc123'
          });
        });
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/settings');
        assert.deepEqual(navigateOptions, { replace: true, trigger: true });
      });
    });

    describe('redirectToBestOAuthChoice', function () {
      it('replaces current page with the signup page if there is no current account', function () {
        windowMock.location.search = '';
        router.redirectToBestOAuthChoice();
        assert.equal(navigateUrl, '/oauth/signup');
        assert.deepEqual(navigateOptions, { replace: true, trigger: true });
      });

      it('replaces the current page with the signin page', function () {
        windowMock.location.search = '';
        sinon.stub(user, 'getChooserAccount', function () {
          return user.initAccount({
            sessionToken: 'abc123'
          });
        });
        router.redirectToBestOAuthChoice();
        assert.equal(navigateUrl, '/oauth/signin');
        assert.deepEqual(navigateOptions, { replace: true, trigger: true });
      });
    });

    describe('_checkForRefresh', function () {
      var view;
      before(function () {
        view = new SignInView({
          broker: broker,
          formPrefill: formPrefill,
          metrics: metrics,
          relier: relier,
          router: router,
          screenName: 'signin',
          user: user,
          window: windowMock
        });

        sinon.spy(view, 'logScreenEvent');
      });

      it('logs a `refresh` if the same view is displayed twice in a row', function () {
        router._checkForRefresh(view);
        assert.isFalse(view.logScreenEvent.calledWith('refresh'));

        router._checkForRefresh(view);
        assert.isTrue(view.logScreenEvent.calledWith('refresh'));
      });
    });

    describe('_afterFirstViewHasRendered', function () {
      it('notifies the broker', function () {
        sinon.spy(broker, 'afterLoaded');

        router._afterFirstViewHasRendered();

        assert.isTrue(broker.afterLoaded.called);
      });

      it('logs a `loaded` event', function () {
        router._afterFirstViewHasRendered();

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'loaded'));
      });

      it('sets `canGoBack`', function () {
        router._afterFirstViewHasRendered();

        assert.isTrue(router.storage.get('canGoBack'));
      });
    });

    describe('pathToScreenName', function () {
      it('strips leading /', function () {
        assert.equal(router.fragmentToScreenName('/signin'), 'signin');
      });

      it('strips trailing /', function () {
        assert.equal(router.fragmentToScreenName('signup/'), 'signup');
      });

      it('converts middle / to .', function () {
        assert.equal(router.fragmentToScreenName('/legal/tos/'), 'legal.tos');
      });

      it('converts _ to -', function () {
        assert.equal(router.fragmentToScreenName('complete_sign_up'),
            'complete-sign-up');
      });

      it('strips search parameters', function () {
        assert.equal(router.fragmentToScreenName('complete_sign_up?email=testuser@testuser.com'),
            'complete-sign-up');
      });

    });

    describe('showView', function () {
      it('triggers a `show-view` notification', function () {
        sinon.spy(notifications, 'trigger');

        var options = { key: 'value' };

        router.showView(BaseView, options);
        assert.isTrue(
          notifications.trigger.calledWith('show-view', BaseView));
      });
    });

    describe('showSubView', function () {
      it('triggers a `show-sub-view` notification', function () {
        sinon.spy(notifications, 'trigger');

        var options = { key: 'value' };

        router.showSubView(DisplayNameView, SettingsView, options);
        assert.isTrue(notifications.trigger.calledWith(
            'show-sub-view', DisplayNameView, SettingsView));
      });
    });

    describe('canGoBack initial value', function () {
      it('is `false` if sessionStorage.canGoBack is not set', function () {
        assert.isUndefined(router.storage._backend.getItem('canGoBack'));
      });

      it('is `true` if sessionStorage.canGoBack is set', function () {
        windowMock.sessionStorage.setItem('canGoBack', true);
        router = new Router({
          broker: broker,
          formPrefill: formPrefill,
          metrics: metrics,
          notifications: notifications,
          relier: relier,
          user: user,
          window: windowMock
        });
        assert.isTrue(router.storage._backend.getItem('canGoBack'));
      });
    });

    describe('getCurrentPage', function () {
      it('returns the current screen URL based on Backbone.history.fragment', function () {
        Backbone.history.fragment = 'settings';
        assert.equal(router.getCurrentPage(), 'settings');
      });
    });

    describe('createViewHandler', function () {
      function View() {
      }
      var viewConstructorOptions = {};

      it('returns a function that can be used by the router to show a View', function () {
        sinon.spy(router, 'showView');

        var routeHandler = router.createViewHandler(View, viewConstructorOptions);
        assert.isFunction(routeHandler);
        assert.isFalse(router.showView.called);

        routeHandler.call(router);

        assert.isTrue(
            router.showView.calledWith(View, viewConstructorOptions));
      });
    });

    describe('createSubViewHandler', function () {
      function ParentView() {
      }
      function SubView() {
      }

      var viewConstructorOptions = {};

      it('returns a function that can be used by the router to show a SubView within a ParentView', function () {
        sinon.spy(router, 'showSubView');

        var routeHandler = router.createSubViewHandler(
            SubView, ParentView, viewConstructorOptions);

        assert.isFunction(routeHandler);
        assert.isFalse(router.showSubView.called);

        routeHandler.call(router);

        assert.isTrue(router.showSubView.calledWith(
            SubView, ParentView, viewConstructorOptions));
      });
    });
  });
});


