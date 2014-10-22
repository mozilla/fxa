/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'backbone',
  'router',
  'views/sign_in',
  'views/sign_up',
  'views/ready',
  'lib/session',
  'lib/constants',
  'lib/metrics',
  'lib/ephemeral-messages',
  'models/reliers/relier',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, _, Backbone, Router, SignInView, SignUpView, ReadyView,
      Session, Constants, Metrics, EphemeralMessages, Relier,
      WindowMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('lib/router', function () {
    var router;
    var windowMock;
    var origNavigate;
    var navigateUrl;
    var navigateOptions;
    var metrics;
    var relier;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      $('#container').html('<div id="stage"></div>');

      windowMock = new WindowMock();
      metrics = new Metrics();

      relier = new Relier({
        window: windowMock
      });

      router = new Router({
        window: windowMock,
        metrics: metrics
      });

      origNavigate = Backbone.Router.prototype.navigate;
      Backbone.Router.prototype.navigate = function (url, options) {
        navigateUrl = url;
        navigateOptions = options;
      };
    });

    afterEach(function () {
      metrics.destroy();
      windowMock = router = navigateUrl = navigateOptions = metrics = null;
      Backbone.Router.prototype.navigate = origNavigate;
      $('#container').empty();
    });

    describe('navigate', function () {
      it('Tells the router to navigate to a page', function () {
        windowMock.location.search = '';
        router.navigate('/signin');
        assert.equal(navigateUrl, '/signin');
        assert.deepEqual(navigateOptions, { trigger: true });
      });

      it('preserves window search parameters across screen transition',
        function () {
          windowMock.location.search = '?context=' + Constants.FX_DESKTOP_CONTEXT;
          router.navigate('/forgot');
          assert.equal(navigateUrl, '/forgot?context=' + Constants.FX_DESKTOP_CONTEXT);
          assert.deepEqual(navigateOptions, { trigger: true });
        });
    });

    describe('redirectToSignupOrSettings', function () {
      it('replaces current page with the signup page if there is no sessionToken', function () {
        windowMock.location.search = '';
        Session.set('sessionToken', null);
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/signup');
        assert.deepEqual(navigateOptions, { trigger: true, replace: true });
      });

      it('replaces the current page with the settings page if there is a sessionToken', function () {
        windowMock.location.search = '';
        Session.set('sessionToken', 'abc123');
        router.redirectToSignupOrSettings();
        assert.equal(navigateUrl, '/settings');
        assert.deepEqual(navigateOptions, { trigger: true, replace: true });
      });
    });

    describe('showView, then another showView', function () {
      var signInView, signUpView;

      beforeEach(function () {
        signInView = new SignInView({
          metrics: metrics,
          window: windowMock,
          relier: relier
        });
        signUpView = new SignUpView({
          metrics: metrics,
          window: windowMock,
          relier: relier
        });
      });

      afterEach(function () {
        signInView = signUpView = null;
      });

      it('shows a view, then shows the new view', function () {
        windowMock.location.pathname = '/signin';
        return router.showView(signInView)
            .then(function () {
              assert.ok($('#fxa-signin-header').length);

              windowMock.location.pathname = '/signup';
              return router.showView(signUpView);
            })
            .then(function () {
              assert.ok($('#fxa-signup-header').length);

              assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signin'));
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signup'));
            });
      });
    });

    describe('showView', function () {
      var view;

      beforeEach(function () {
        view = new SignUpView({
          metrics: metrics,
          window: windowMock,
          router: router,
          // ensure there is no cross talk with other tests.
          ephemeralMessages: new EphemeralMessages(),
          relier: relier
        });
      });

      afterEach(function () {
        view = null;
      });

      it('navigates to unexpected error view on beforeRender errors', function () {
        windowMock.location.pathname = '/signup';
        view.beforeRender = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('navigates to unexpected error view on context errors', function () {
        windowMock.location.pathname = '/signup';
        view.context = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('navigates to unexpected error view on afterRender errors', function () {
        windowMock.location.pathname = '/signup';
        view.afterRender = function () {
          throw new Error('boom');
        };

        var navigate = view.navigate;
        view.navigate = function (url, options) {
          assert.equal(options.error.message, 'boom');
          return navigate.call(this, url, options);
        };

        return router.showView(view)
          .then(function () {
            assert.include(navigateUrl, 'unexpected_error');
          });
      });

      it('only logs a screen that has children once', function () {
        windowMock.location.pathname = '/signup_complete';

        view = new ReadyView({
          metrics: metrics,
          window: windowMock,
          router: router,
          // ensure there is no cross talk with other tests.
          ephemeralMessages: new EphemeralMessages(),
          relier: relier
        });

        return router.showView(view)
          .then(function () {
            assert.equal(metrics.getFilteredData().events.length, 1);
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signup_complete'));
          });
      });
    });
  });
});


