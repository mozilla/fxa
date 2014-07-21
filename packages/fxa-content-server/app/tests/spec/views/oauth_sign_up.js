/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'jquery',
  'views/oauth_sign_up',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router',
  '../../mocks/oauth_servers',
  '../../lib/helpers'
],
function (chai, $, View, Session, FxaClient, WindowMock, RouterMock, OAuthServersMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/oauth_sign_up', function () {
    var view, email, router, windowMock, CLIENT_ID, STATE, SCOPE, CLIENT_NAME, BASE_REDIRECT_URL, fxaClient, oAuthServersMock;

    CLIENT_ID = 'dcdb5ae7add825d2';
    STATE = '123';
    SCOPE = 'profile:email';
    CLIENT_NAME = '123Done';
    BASE_REDIRECT_URL = 'http://127.0.0.1:8080/api/oauth';

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();
      router = new RouterMock();
      windowMock = new WindowMock();
      windowMock.location.search = '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE + '&redirect_uri=' + encodeURIComponent(BASE_REDIRECT_URL);

      oAuthServersMock = new OAuthServersMock();

      fxaClient = new FxaClient();

      view = new View({
        router: router,
        window: windowMock,
        fxaClient: fxaClient
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      Session.clear();
      view.remove();
      view.destroy();
      oAuthServersMock.destroy();
    });

    describe('render', function () {
      it('displays oAuth client name', function () {
        return view.render()
          .then(function () {
            assert.include($('#fxa-signup-header').text(), CLIENT_NAME);
            // also make sure link is correct
            assert.equal($('.sign-in').attr('href'), '/oauth/signin');
          });
      });
    });

    describe('submit', function () {
      it('sets up the user\'s ouath session on success', function () {
        var password = 'password';

        // the screen is rendered, we can take over from here.
        oAuthServersMock.destroy();
        return view.fxaClient.signUp(email, password)
          .then(function () {
            $('.email').val(email);
            $('[type=password]').val(password);
            $('#fxa-age-year').val('1990');
            return view.submit();
          })
          .then(function () {
            assert.equal(Session.oauth.state, STATE);
            assert.equal(Session.service, CLIENT_ID);
          });
      });
    });
  });

});


