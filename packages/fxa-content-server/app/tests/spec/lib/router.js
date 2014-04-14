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
  'lib/session',
  '../../mocks/window',
  'lib/constants'
],
function (chai, _, Backbone, Router, SignInView, SignUpView, Session, WindowMock, Constants) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('lib/router', function () {
    var router, windowMock, origNavigate, navigateUrl, navigateOptions;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      $('#container').html('<div id="stage"></div>');

      windowMock = new WindowMock();
      router = new Router({
        window: windowMock
      });

      origNavigate = Backbone.Router.prototype.navigate;
      Backbone.Router.prototype.navigate = function (url, options) {
        navigateUrl = url;
        navigateOptions = options;
      };
    });

    afterEach(function () {
      windowMock = router = navigateUrl = navigateOptions = null;
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
        signInView = new SignInView({});
        signUpView = new SignUpView({});
      });

      afterEach(function() {
        signInView = signUpView = null;
      });

      it('shows a view, then shows the new view', function () {
        return router.showView(signInView)
            .then(function () {
              assert.ok($('#fxa-signin-header').length);

              // session was cleared in beforeEach, simulating a user
              // visiting their first page. The user cannot go back.
              assert.equal(Session.canGoBack, false);
              return router.showView(signUpView);
            })
            .then(function () {
              assert.ok($('#fxa-signup-header').length);
              // if there is a back button, it can be shown now.
              assert.equal(Session.canGoBack, true);
            });
      });
    });
  });
});


