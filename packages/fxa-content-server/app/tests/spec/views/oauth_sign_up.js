/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Able = require('lib/able');
  const Assertion = require('lib/assertion');
  const chai = require('chai');
  const FormPrefill = require('models/form-prefill');
  const FxaClient = require('lib/fxa-client');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const OAuthBroker = require('models/auth_brokers/oauth');
  const OAuthClient = require('lib/oauth-client');
  const OAuthRelier = require('models/reliers/oauth');
  const p = require('lib/promise');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/sign_up');
  const WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  function fillOutSignUp (email, password, opts) {
    opts = opts || {};
    var context = opts.context || window;
    var year = opts.year || '24';

    context.$('[type=email]').val(email);
    context.$('[type=password]').val(password);

    if (! opts.ignoreYear) {
      $('#age').val(year);
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

  describe('views/sign_up for /oauth/signup', function () {
    var view;
    var email;
    var metrics;
    var windowMock;
    var fxaClient;
    var oAuthClient;
    var assertionLibrary;
    var relier;
    var broker;
    var user;
    var formPrefill;
    var able;
    var notifier;

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();


      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new OAuthRelier({
        window: windowMock
      });
      relier.set({
        clientId: CLIENT_ID,
        redirectUri: BASE_REDIRECT_URL,
        scope: SCOPE,
        serviceName: CLIENT_NAME,
        state: STATE
      });
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });

      oAuthClient = new OAuthClient();
      sinon.stub(oAuthClient, 'getClientInfo', function () {
        return p({
          name: '123Done',
          redirect_uri: BASE_REDIRECT_URL //eslint-disable-line camelcase
        });
      });

      fxaClient = new FxaClient();
      assertionLibrary = new Assertion({
        fxaClient: fxaClient
      });
      user = new User({
        fxaClient: fxaClient
      });
      formPrefill = new FormPrefill();
      able = new Able();
      notifier = new Notifier();

      view = new View({
        able: able,
        assertionLibrary: assertionLibrary,
        broker: broker,
        formPrefill: formPrefill,
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        oAuthClient: oAuthClient,
        relier: relier,
        user: user,
        viewName: 'oauth.signup',
        window: windowMock
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

    describe('submit', function () {
      it('redirects to /confirm on success', function () {
        fillOutSignUp(email, 'password', { context: view });

        sinon.stub(user, 'signUpAccount', function (account) {
          return p(account);
        });

        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return false;
        });

        sinon.spy(view, 'navigate');

        return view.submit()
          .then(function () {
            assert.equal(user.signUpAccount.args[0][0].get('email'), email);
            assert.equal(user.signUpAccount.args[0][1], 'password');
            assert.isTrue(view.navigate.calledWith('confirm'));
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'oauth.signup.success'));
          });
      });
    });
  });
});
