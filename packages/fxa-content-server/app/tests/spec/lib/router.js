/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const BaseView = require('views/base');
  const chai = require('chai');
  const Constants = require('lib/constants');
  const DisplayNameView = require('views/settings/display_name');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const NullBroker = require('models/auth_brokers/base');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const Router = require('lib/router');
  const SettingsView = require('views/settings');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/router', function () {
    var broker;
    var metrics;
    var navigateOptions;
    var navigateUrl;
    var notifier;
    var relier;
    var router;
    var user;
    var windowMock;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      metrics = new Metrics();
      notifier = new Notifier();
      user = new User();
      windowMock = new WindowMock();

      relier = new Relier({
        window: windowMock
      });

      broker = new NullBroker({
        relier: relier
      });

      router = new Router({
        broker: broker,
        metrics: metrics,
        notifier: notifier,
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
    });

    describe('navigate', function () {
      it('tells the router to navigate to a page', function () {
        windowMock.location.search = '';
        router.navigate('/signin');
        assert.equal(navigateUrl, '/signin');
        assert.deepEqual(navigateOptions, { trigger: true });
      });
    });

    describe('`navigate` notifier message', function () {
      beforeEach(function () {
        sinon.spy(router, 'navigate');

        notifier.trigger('navigate', {
          nextViewData: {
            key: 'value'
          },
          routerOptions: {
            clearQueryParams: true,
            trigger: true
          },
          url: 'signin'
        });
      });

      it('calls `navigate` correctly', function () {
        assert.isTrue(router.navigate.calledWith('signin', {
          clearQueryParams: true,
          trigger: true
        }));
      });
    });

    describe('`navigate` notifier message with `server: true`', () => {
      beforeEach(() => {
        sinon.spy(router, 'navigate');
        sinon.spy(router, 'navigateAway');

        notifier.trigger('navigate', {
          server: true,
          url: 'wibble'
        });
      });

      it('navigated correctly', () => {
        assert.equal(router.navigate.callCount, 0);
        assert.equal(router.navigateAway.callCount, 1);
        const args = router.navigateAway.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'wibble');
      });
    });

    describe('navigateAway', () => {
      beforeEach(() => {
        sinon.spy(metrics, 'flush');
        sinon.spy(router, 'navigate');

        return router.navigateAway('blee');
      });

      it('called metrics.flush correctly', () => {
        assert.equal(metrics.flush.callCount, 1);
        assert.lengthOf(metrics.flush.args[0], 0);
      });

      it('navigated correctly', function () {
        assert.equal(router.navigate.callCount, 0);
        assert.equal(windowMock.location.href, 'blee');
      });
    });

    describe('`navigate-back` notifier message', function () {
      beforeEach(function () {
        sinon.spy(router, 'navigateBack');

        notifier.trigger('navigate-back', {
          nextViewData: {
            key: 'value'
          }
        });
      });

      it('calls `navigateBack` correctly', function () {
        assert.isTrue(router.navigateBack.called);
      });
    });

    describe('set query params', function () {
      beforeEach(function () {
        windowMock.location.search = '?context=' + Constants.FX_DESKTOP_V1_CONTEXT;
      });

      describe('navigate with default options', function () {
        beforeEach(function () {
          router.navigate('/forgot');
        });

        it('preserves query params', function () {
          assert.equal(navigateUrl, '/forgot?context=' + Constants.FX_DESKTOP_V1_CONTEXT);
          assert.deepEqual(navigateOptions, { trigger: true });
        });
      });

      describe('navigate with clearQueryParams option set', function () {
        beforeEach(function () {
          router.navigate('/forgot', { clearQueryParams: true });
        });

        it('clears the query params if clearQueryString option is set', function () {
          assert.equal(navigateUrl, '/forgot');
          assert.deepEqual(navigateOptions, { clearQueryParams: true, trigger: true });
        });
      });
    });

    describe('navigateBack', function () {
      beforeEach(function () {
        sinon.spy(windowMock.history, 'back');

        router.navigateBack();
      });

      it('calls `window.history.back`', function () {
        assert.isTrue(windowMock.history.back.called);
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
      describe('no email in params', function () {
        it('replaces current page with the signup page if there is no current account', function () {
          windowMock.location.search = '';
          return router.redirectToBestOAuthChoice()
            .then(function () {
              assert.equal(navigateUrl, '/oauth/signup');
              assert.deepEqual(navigateOptions, { replace: true, trigger: true });
            });
        });

        it('replaces the current page with the signin page', function () {
          windowMock.location.search = '';
          sinon.stub(user, 'getChooserAccount', function () {
            return user.initAccount({
              sessionToken: 'abc123'
            });
          });

          return router.redirectToBestOAuthChoice()
            .then(function () {
              assert.equal(navigateUrl, '/oauth/signin');
              assert.deepEqual(navigateOptions, { replace: true, trigger: true });
            });
        });
      });

      describe('email in params', function () {
        var accountExists;
        beforeEach(function () {
          accountExists = false;

          sinon.stub(user, 'checkAccountEmailExists', function () {
            if (accountExists instanceof Error) {
              return p.reject(accountExists);
            } else {
              return p(accountExists);
            }
          });

          relier.set('email', 'test@email.com');
        });

        it('navigate to signup page if email is not associated with account', function () {
          accountExists = false;

          return router.redirectToBestOAuthChoice()
            .then(function () {
              assert.include(navigateUrl, '/oauth/signup');
              assert.deepEqual(navigateOptions, { replace: true, trigger: true });
            });
        });

        it('navigate to signin page if email is associated with account', function () {
          accountExists = true;

          return router.redirectToBestOAuthChoice()
            .then(function () {
              assert.include(navigateUrl, '/oauth/signin');
              assert.deepEqual(navigateOptions, { replace: true, trigger: true });
            });
        });

        it('logs and swallows any errors that are thrown checking whether the email is registered', function () {
          var err = AuthErrors.toError('THROTTLED');
          accountExists = err;

          sinon.spy(metrics, 'logError');
          sinon.stub(user, 'getChooserAccount', function () {
            // return a default account to ensure user is sent to signup
            return new Account({});
          });

          return router.redirectToBestOAuthChoice()
            .then(function () {
              assert.isTrue(metrics.logError.calledWith(err));
              assert.include(navigateUrl, '/oauth/signup');
              assert.deepEqual(navigateOptions, { replace: true, trigger: true });
            });
        });
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

    describe('pathToViewName', function () {
      it('strips leading /', function () {
        assert.equal(router.fragmentToViewName('/signin'), 'signin');
      });

      it('strips trailing /', function () {
        assert.equal(router.fragmentToViewName('signup/'), 'signup');
      });

      it('converts middle / to .', function () {
        assert.equal(router.fragmentToViewName('/legal/tos/'), 'legal.tos');
      });

      it('converts _ to -', function () {
        assert.equal(router.fragmentToViewName('complete_sign_up'),
            'complete-sign-up');
      });

      it('strips search parameters', function () {
        assert.equal(router.fragmentToViewName('complete_sign_up?email=testuser@testuser.com'),
            'complete-sign-up');
      });

    });

    describe('showView', function () {
      it('triggers a `show-view` notification', function () {
        sinon.spy(notifier, 'trigger');

        var options = { key: 'value' };

        router.showView(BaseView, options);
        assert.isTrue(
          notifier.trigger.calledWith('show-view', BaseView));
      });
    });

    describe('showChildView', function () {
      it('triggers a `show-child-view` notification', function () {
        sinon.spy(notifier, 'trigger');

        var options = { key: 'value' };

        router.showChildView(DisplayNameView, SettingsView, options);
        assert.isTrue(notifier.trigger.calledWith(
            'show-child-view', DisplayNameView, SettingsView));
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
          metrics: metrics,
          notifier: notifier,
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

      it('strips any query parameters from the fragment', () => {
        Backbone.history.fragment = 'force_auth?email=testuser@testuser.com';
        assert.equal(router.getCurrentPage(), 'force_auth');
      });

      it('strips leading `/` from the fragment', () => {
        Backbone.history.fragment = '/force_auth';
        assert.equal(router.getCurrentPage(), 'force_auth');
      });

      it('strips trailing `/` from the fragment', () => {
        Backbone.history.fragment = 'force_auth/';
        assert.equal(router.getCurrentPage(), 'force_auth');
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

    describe('createChildViewHandler', function () {
      function ParentView() {
      }
      function ChildView() {
      }

      var viewConstructorOptions = {};

      it('returns a function that can be used by the router to show a ChildView within a ParentView', function () {
        sinon.spy(router, 'showChildView');

        var routeHandler = router.createChildViewHandler(
            ChildView, ParentView, viewConstructorOptions);

        assert.isFunction(routeHandler);
        assert.isFalse(router.showChildView.called);

        routeHandler.call(router);

        assert.isTrue(router.showChildView.calledWith(
            ChildView, ParentView, viewConstructorOptions));
      });
    });
  });
});


