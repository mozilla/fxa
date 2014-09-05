/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'jquery',
  'views/oauth_sign_in',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router',
  '../../mocks/oauth_servers',
  '../../lib/helpers'
],
function (chai, $, View, Session, FxaClient, WindowMock, RouterMock, OAuthServersMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/oauth_sign_in', function () {
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
      windowMock.location.search = '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE;

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
            assert.include($('#fxa-signin-header').text(), CLIENT_NAME);
            // also make sure link is correct
            assert.equal($('.sign-up').attr('href'), '/oauth/signup');
          });
      });

      it('is enabled if prefills are valid', function () {
        Session.set('prefillEmail', 'testuser@testuser.com');
        Session.set('prefillPassword', 'prefilled password');
        return view.render()
          .then(function () {
            assert.isFalse(view.$('button').hasClass('disabled'));
          });
      });
    });

    /*
    // TODO Renable (issue #1141)
    describe('submit', function () {
      it('signs the user in on success', function () {
        var password = 'password';
        return view.fxaClient.signUp(email, password, { preVerified: true })
          .then(function () {
            $('.email').val(email);
            $('[type=password]').val(password);
            return view.submit();
          })
          .then(function () {
            assert.include(windowMock.location.href, BASE_REDIRECT_URL);
          });
      });
    });
    */

    describe('resetPasswordIfKnownValidEmail', function () {
      it('goes to the reset_password page if user types a valid, known email', function () {
        // the screen is rendered, we can take over from here.
        oAuthServersMock.destroy();

        var password = 'password';
        return view.fxaClient.signUp(email, password, { preVerified: true })
              .then(function () {
                $('.email').val(email);
                return view.resetPasswordIfKnownValidEmail();
              })
              .then(function () {
                assert.ok(Session.oauth, 'oauth params are set');
                assert.equal(router.page, 'reset_password');
              });
      });

      it('goes to the reset_password screen if a blank email', function () {
        // the screen is rendered, we can take over from here.
        oAuthServersMock.destroy();

        $('[type=email]').val('');
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.ok(Session.oauth, 'oauth params are set');
              assert.ok(router.page, 'reset_password');
            });
      });
    });
  });

});


