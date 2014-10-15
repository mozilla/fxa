/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'jquery',
  'sinon',
  'views/oauth_sign_up',
  'lib/promise',
  'lib/session',
  'lib/fxa-client',
  'lib/metrics',
  'lib/auth-errors',
  'lib/oauth-client',
  'lib/assertion',
  'models/reliers/relier',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, p, Session, FxaClient, Metrics, AuthErrors,
      OAuthClient, Assertion, Relier, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;

  function fillOutSignUp (email, password, opts) {
    opts = opts || {};
    var context = opts.context || window;
    var year = opts.year || '1960';

    context.$('[type=email]').val(email);
    context.$('[type=password]').val(password);

    if (!opts.ignoreYear) {
      $('#fxa-age-year').val(year);
    }

    if (context.enableSubmitIfValid) {
      context.enableSubmitIfValid();
    }
  }

  var CLIENT_ID = 'dcdb5ae7add825d2';
  var STATE = '123';
  var SCOPE = 'profile:email';
  var CLIENT_NAME = '123Done';
  var BASE_REDIRECT_URL = 'http://127.0.0.1:8080/api/oauth';

  describe('views/oauth_sign_up', function () {
    var nowYear = (new Date()).getFullYear();
    var view;
    var router;
    var email;
    var metrics;
    var windowMock;
    var fxaClient;
    var oAuthClient;
    var assertionLibrary;
    var relier;

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();

      router = new RouterMock();

      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier({
        window: windowMock
      });
      relier.set({
        clientId: CLIENT_ID,
        redirectUri: BASE_REDIRECT_URL,
        state: STATE,
        scope: SCOPE,
        serviceName: CLIENT_NAME
      });

      oAuthClient = new OAuthClient();
      sinon.stub(oAuthClient, 'getClientInfo', function () {
        return p({
          name: '123Done',
          //jshint camelcase: false
          redirect_uri: BASE_REDIRECT_URL
        });
      });

      fxaClient = new FxaClient();
      assertionLibrary = new Assertion({
        fxaClient: fxaClient
      });

      view = new View({
        router: router,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier,
        assertionLibrary: assertionLibrary,
        oAuthClient: oAuthClient
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

    describe('submit without a preVerifyToken', function () {
      it('sets up the user\'s oauth session and redirects to confirm on success', function () {
        fillOutSignUp(email, 'password', { year: nowYear - 14, context: view });

        sinon.stub(fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'asessiontoken',
            verified: false
          });
        });

        return view.submit()
          .then(function () {
            //jshint camelcase: false
            assert.equal(Session.oauth.client_id, CLIENT_ID);
            assert.isTrue(fxaClient.signUp.calledWith(email, 'password'));
            assert.equal(router.page, 'confirm');
          });
      });
    });

    describe('submit with a preVerifyToken', function () {
      beforeEach(function () {
        relier.set('preVerifyToken', 'preverifytoken');
      });

      it('redirects to the rp if pre-verification is successful', function () {
        sinon.stub(fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'asessiontoken',
            verified: true
          });
        });

        fillOutSignUp(email, 'password', { year: nowYear - 14, context: view });

        var isOAuthFlowFinished = false;
        view.finishOAuthFlow = function () {
          isOAuthFlowFinished = true;
          return p(true);
        };
        return view.submit()
            .then(function () {
              assert.isTrue(isOAuthFlowFinished);
            });
      });

      it('redirects to /confirm if pre-verification is not successful', function () {
        sinon.stub(fxaClient, 'signUp', function (email, password, options) {
          // force the preVerifyToken to be invalid
          if (options.preVerifyToken) {
            return p.reject(AuthErrors.toError('INVALID_VERIFICATION_CODE'));
          } else {
            return p({});
          }
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'asessiontoken',
            verified: false
          });
        });


        fillOutSignUp(email, 'password', { year: nowYear - 14, context: view });
        return view.submit()
            .then(function () {
              assert.equal(router.page, 'confirm');
            });
      });
    });
  });
});


