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
  'models/reliers/oauth',
  'models/auth_brokers/oauth',
  'models/user',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, p, Session, FxaClient, Metrics, AuthErrors,
      OAuthClient, Assertion, OAuthRelier, OAuthBroker, User, WindowMock,
      RouterMock, TestHelpers) {
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
    var broker;
    var user;

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();

      router = new RouterMock();

      windowMock = new WindowMock();
      windowMock.location.pathname = 'oauth/signup';
      metrics = new Metrics();
      relier = new OAuthRelier({
        window: windowMock
      });
      relier.set({
        clientId: CLIENT_ID,
        redirectUri: BASE_REDIRECT_URL,
        state: STATE,
        scope: SCOPE,
        serviceName: CLIENT_NAME
      });
      broker = new OAuthBroker({
        session: Session,
        relier: relier,
        window: windowMock
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
      user = new User();

      view = new View({
        router: router,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        user: user,
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
      it('redirects to confirm on success', function () {
        fillOutSignUp(email, 'password', { year: nowYear - 14, context: view });

        sinon.stub(fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p(user.createAccount({
            sessionToken: 'asessiontoken',
            verified: false
          }));
        });

        return view.submit()
          .then(function () {
            assert.isTrue(fxaClient.signUp.calledWith(
                email, 'password', relier));
            assert.equal(router.page, 'confirm');
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signup.success'));
          });
      });
    });

    describe('submit with a preVerifyToken', function () {
      beforeEach(function () {
        relier.set('preVerifyToken', 'preverifytoken');
      });

      it('notifies the broker when a pre-verified user signs up', function () {
        sinon.stub(fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p(user.createAccount({
            sessionToken: 'asessiontoken',
            verified: true
          }));
        });

        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        fillOutSignUp(email, 'password', { year: nowYear - 14, context: view });

        return view.submit()
          .then(function () {
            assert.isTrue(broker.afterSignIn.called);
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signup.preverified'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signup.preverified.success'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signup.success'));
          });
      });

      it('redirects to /confirm if pre-verification is not successful', function () {
        sinon.stub(fxaClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p(user.createAccount({
            sessionToken: 'asessiontoken',
            // verified: false simulates the preVerifyToken failing.
            verified: false
          }));
        });


        var password = 'password';
        fillOutSignUp(email, password, { year: nowYear - 14, context: view });
        return view.submit()
          .then(function () {
            assert.equal(router.page, 'confirm');
            assert.isTrue(fxaClient.signUp.calledWith(
                email, password, relier));
            assert.isTrue(fxaClient.signIn.calledWith(
                email, password, relier));
          });
      });
    });
  });
});


