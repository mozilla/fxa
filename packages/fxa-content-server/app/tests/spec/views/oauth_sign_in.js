/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var FormPrefill = require('models/form-prefill');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var OAuthBroker = require('models/auth_brokers/oauth');
  var OAuthRelier = require('models/reliers/oauth');
  var p = require('lib/promise');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/sign_in');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/sign_in for /oauth/signin', function () {
    var view;
    var email;
    var windowMock;
    var fxaClient;
    var relier;
    var metrics;
    var broker;
    var profileClientMock;
    var user;
    var formPrefill;
    var notifier;

    var CLIENT_ID = 'dcdb5ae7add825d2';
    var STATE = '123';
    var SCOPE = 'profile:email';
    var CLIENT_NAME = '123Done';

    beforeEach(function () {
      Session.clear();
      email = TestHelpers.createEmail();
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
        fxaClient: fxaClient,
        notifier: notifier
      });
      metrics = new Metrics();
      profileClientMock = TestHelpers.stubbedProfileClient();
      formPrefill = new FormPrefill();
      notifier = new Notifier();

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
        notifier: notifier,
        profileClient: profileClientMock,
        relier: relier,
        user: user,
        viewName: 'oauth.signin',
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
        sinon.spy(view, 'navigate');

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
            assert.isTrue(view.navigate.calledWith('settings'));
          });
      });
    });
  });
});
