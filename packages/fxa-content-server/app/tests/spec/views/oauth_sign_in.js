/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'jquery',
  'sinon',
  'views/sign_in',
  'lib/session',
  'lib/fxa-client',
  'lib/promise',
  'lib/metrics',
  'models/reliers/oauth',
  'models/auth_brokers/oauth',
  'models/user',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, Session, FxaClient, p, Metrics, OAuthRelier,
      OAuthBroker, User, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/sign_in for /oauth/signin', function () {
    var view;
    var email;
    var router;
    var windowMock;
    var fxaClient;
    var relier;
    var metrics;
    var broker;
    var profileClientMock;
    var user;

    var CLIENT_ID = 'dcdb5ae7add825d2';
    var STATE = '123';
    var SCOPE = 'profile:email';
    var CLIENT_NAME = '123Done';

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();
      router = new RouterMock();
      windowMock = new WindowMock();
      windowMock.location.search = '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE;

      relier = new OAuthRelier();
      relier.set('serviceName', CLIENT_NAME);
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });
      user = new User();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      profileClientMock = TestHelpers.stubbedProfileClient();

      initView();
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

    function initView () {
      view = new View({
        router: router,
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        user: user,
        profileClient: profileClientMock,
        metrics: metrics,
        screenName: 'oauth/signin'
      });
    }

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

        initView();
        return view.render()
          .then(function () {
            assert.isFalse(view.$('button').hasClass('disabled'));
          });
      });
    });

    describe('submit', function () {
      it('notifies the broker when a verified user signs in', function () {
        var password = 'password';

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p({ verified: true });
        });

        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        $('.email').val(email);
        $('[type=password]').val(password);
        return view.submit()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signin.success'));
            assert.isTrue(view.fxaClient.signIn.calledWith(
                email, password, relier));
            assert.isTrue(broker.afterSignIn.called);
          });
      });

      it('sends an unverified user to the confirm screen', function () {
        var password = 'password';

        sinon.stub(view.fxaClient, 'signIn', function () {
          return p({ verified: false });
        });

        sinon.stub(view, 'accountScopedToView', function () {
          return user.createAccount({ sessionToken: 'abc123' });
        });

        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p();
        });

        $('.email').val(email);
        $('[type=password]').val(password);
        return view.submit()
          .then(function () {
            assert.isTrue(view.fxaClient.signIn.calledWith(
                email, password, relier));
            assert.equal(router.page, 'confirm');
          });
      });
    });

    describe('resetPasswordIfKnownValidEmail', function () {
      it('goes to the reset_password page if user types a valid, known email', function () {
        // the screen is rendered, we can take over from here.
        $('.email').val(email);
        return view.resetPasswordIfKnownValidEmail()
          .then(function () {
            assert.equal(router.page, 'reset_password');
          });
      });

      it('goes to the reset_password screen if a blank email', function () {
        // the screen is rendered, we can take over from here.
        $('[type=email]').val('');
        return view.resetPasswordIfKnownValidEmail()
            .then(function () {
              assert.ok(router.page, 'reset_password');
            });
      });
    });
  });

});


