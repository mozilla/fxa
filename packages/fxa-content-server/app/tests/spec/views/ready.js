/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/ready',
  'lib/session',
  '../../mocks/window'
],
function (chai, View, Session, WindowMock) {
  var assert = chai.assert;
  //var redirectUri =  'https://sync.firefox.com';

  describe('views/ready', function () {
    var view, windowMock;

    function createViewWithMarketing() {
      createView(0);
    }

    function createViewWithSurvey() {
      createView(100);
    }

    function createView(surveyPercentage) {
      windowMock = new WindowMock();

      view = new View({
        surveyPercentage: surveyPercentage,
        window: windowMock
      });
    }

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      beforeEach(function () {
        createViewWithMarketing();
      });

      it('renders with correct header for reset_password type', function () {
        view.type = 'reset_password';

        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-reset-password-complete-header').length);
            });
      });

      it('renders with correct header for sign_in type', function () {
        view.type = 'sign_in';
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-sign-in-complete-header').length);
            });
      });

      it('renders with correct header for sign_up type', function () {
        view.type = 'sign_up';
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-sign-up-complete-header').length);
            });
      });

      it('shows service name if available', function () {
        Session.set('service', 'sync');

        return view.render()
            .then(function () {
              var html = view.$('section').text();
              assert.include(html, 'Firefox Sync');
            });
      });

      // TODO Renable these (issue #1141)
      //it('shows redirectTo link and service name if available', function () {
        //// This would be fetched from the OAuth server, but set it
        //// explicitly for tests that use the mock `sync` service ID.
        //view.serviceRedirectURI = redirectUri;
        //Session.set('service', 'sync');

        //return view.render()
            //.then(function () {
              //assert.equal(view.$('#redirectTo').length, 1);
              //var html = view.$('section').text();
              //assert.include(html, 'Firefox Sync');
              //assert.ok(view.isOAuth());
              //assert.notOk(view.isOAuthSameBrowser());
            //});
      //});

      //it('shows redirectTo link and service name if continuing OAuth flow', function () {
        //[> jshint camelcase: false <]
        //Session.set('service', 'sync');

        //// oauth is set if using the same browser
        //Session.set('oauth', {
          //client_id: 'sync'
        //});

        //// This would be fetched from the OAuth server, but set it
        //// explicitly for tests that use the mock `sync` service ID.
        //view.serviceRedirectURI = redirectUri;

        //return view.render()
            //.then(function () {
              //assert.ok(view.isOAuth());
              //assert.ok(view.isOAuthSameBrowser());

              //assert.equal(view.$('#redirectTo').length, 1);
              //var html = view.$('section').text();
              //assert.include(html, 'Firefox Sync');
            //});
      //});

      it('does not show redirectTo link if unavailable', function () {
        return view.render()
            .then(function () {
              assert.equal(view.$('#redirectTo').length, 0);
            });
      });

      it('normally shows sign up marketing material', function () {
        view.type = 'sign_up';
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 1);
            });
      });

      it('does not show sign up marketing material if on Firefox for Android', function () {
        view.type = 'sign_up';
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
            });
      });

      it('does not show sign up marketing material if on B2G', function () {
        view.type = 'sign_up';
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
            });
      });
    });

    describe('render/show survey', function () {
      it('shows survey to english users', function () {
        Session.set('language', 'en_GB');
        createViewWithSurvey();

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
              assert.equal(view.$('.marketing.survey').length, 1);
            });
      });

      it('still shows default marketing to non-english users', function () {
        Session.set('language', 'de');
        createViewWithSurvey();
        view.type = 'sign_up';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 1);
              assert.equal(view.$('.marketing.survey').length, 0);
            });
      });

    });
  });
});



