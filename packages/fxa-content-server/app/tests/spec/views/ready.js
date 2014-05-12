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

  describe('views/ready', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      view = new View({
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
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

      it('shows redirectTo link and service name if available', function () {
        // This would be fetched from the OAuth server, but set it
        // explicitly for tests that use the mock `sync` service ID.
        view.serviceRedirectURI = 'https://sync.firefox.com';
        Session.set('service', 'sync');

        return view.render()
            .then(function () {
              assert.equal(view.$('#redirectTo').length, 1);
              var html = view.$('section').text();
              assert.notEqual(html.indexOf('Firefox Sync'), -1);
              assert.ok(view.isOAuth());
              assert.notOk(view.isOAuthSameBrowser());
            });
      });

      it('shows redirectTo link and service name if continuing OAuth flow', function () {
        Session.set('service', 'sync');

        // oauth is set if using the same browser
        Session.set('oauth', {
          client_id: 'sync'
        });

        // This would be fetched from the OAuth server, but set it
        // explicitly for tests that use the mock `sync` service ID.
        view.serviceRedirectURI = 'https://sync.firefox.com';

        return view.render()
            .then(function () {
              assert.ok(view.isOAuth());
              assert.ok(view.isOAuthSameBrowser());

              assert.equal(view.$('#redirectTo').length, 1);
              var html = view.$('section').text();
              assert.notEqual(html.indexOf('Firefox Sync'), -1);
            });
      });

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
              assert.equal(view.$('.marketing').length, 1);
            });
      });

      it('does not show sign up marketing material if on Firefox for Android', function () {
        view.type = 'sign_up';
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing').length, 0);
            });
      });

      it('does not show sign up marketing material if on B2G', function () {
        view.type = 'sign_up';
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing').length, 0);
            });
      });
    });
  });
});



