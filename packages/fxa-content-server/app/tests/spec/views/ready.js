/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/ready',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window'
],
function (chai, View, Session, FxaClient, WindowMock) {
  var assert = chai.assert;
  //var redirectUri =  'https://sync.firefox.com';

  describe('views/ready', function () {
    var view, windowMock, fxaClient;

    function createView(surveyPercentage) {
      windowMock = new WindowMock();
      fxaClient = new FxaClient();

      view = new View({
        window: windowMock,
        fxaClient: fxaClient
      });
    }

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      beforeEach(function () {
        createView();
      });

      it('renders with correct header for reset_password type', function () {
        view.type = 'reset_password';

        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-reset-password-complete-header').length);
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

      // regression test for #1216
      it('does not show service name if service is defined but serviceName is not', function () {
        view.context = function () {
          return {
            service: 'sync'
          };
        };

        return view.render()
            .then(function () {
              assert.ok(view.$('.account-ready-generic').length);
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
              //assert.ok(view.hasService());
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
              //assert.ok(view.hasService());
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

      it('shows some form of marketing for english speakers', function () {
        view.type = 'sign_up';
        Session.set('language', 'en');
        Session.set('service', 'sync');

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing').length, 1);
            });
      });

      it('formats the service name correctly depending on the redirect uris', function () {
        view.serviceRedirectURI = 'https://find.firefox.com';
        view.serviceName = 'Find My Device';
        assert.equal(view.context().serviceName, '<a href="https://find.firefox.com" class="no-underline" id="redirectTo">Find My Device</a>');

        view.serviceRedirectURI = 'urn:ietf:wg:oauth:2.0:fx:webchannel';
        assert.equal(view.context().serviceName, view.serviceName);
      });
    });
  });
});



