/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  'models/form-prefill',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, Session, FxaClient, p, Metrics, OAuthRelier,
      OAuthBroker, User, FormPrefill, WindowMock, RouterMock, TestHelpers) {
  'use strict';

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
    var formPrefill;

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
      fxaClient = new FxaClient();
      user = new User({
        fxaClient: fxaClient
      });
      metrics = new Metrics();
      profileClientMock = TestHelpers.stubbedProfileClient();
      formPrefill = new FormPrefill();

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
        broker: broker,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        profileClient: profileClientMock,
        relier: relier,
        router: router,
        screenName: 'oauth.signin',
        user: user,
        window: windowMock
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
        formPrefill.set('email', 'testuser@testuser.com');
        formPrefill.set('password', 'prefilled password');

        initView();
        return view.render()
          .then(function () {
            assert.isFalse(view.$('button').hasClass('disabled'));
          });
      });
    });

    describe('submit', function () {
      it('notifies the broker when a verified user signs in', function () {
        sinon.spy(user, 'initAccount');
        sinon.stub(user, 'signInAccount', function (account) {
          account.set('verified', true);
          return p(account);
        });
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return false;
        });
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        var password = 'password';
        $('.email').val(email);
        $('[type=password]').val(password);

        return view.submit()
          .then(function () {
            var account = user.initAccount.returnValues[0];

            assert.isTrue(user.signInAccount.calledWith(account));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'oauth.signin.success'));
            assert.isTrue(broker.afterSignIn.calledWith(account));
            assert.equal(router.page, 'settings');
          });
      });
    });
  });
});
