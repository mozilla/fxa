/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/fx-fennec-v1');
  var chai = require('chai');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/sync');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/choose_what_to_sync');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/choose_what_to_sync', function () {
    var account;
    var broker;
    var email;
    var model;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    beforeEach(function () {
      broker = new Broker();
      email = TestHelpers.createEmail();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      user = new User({
        fxaClient: fxaClient
      });

      account = user.initAccount({
        email: email,
        sessionToken: 'fake session token',
        uid: 'uid'
      });

      model.set({
        account: account
      });
    });

    afterEach(function () {
      metrics.destroy();
      view.remove();
      view.destroy();
      view = metrics = null;
    });

    function initView () {
      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'choose-what-to-sync',
        window: windowMock
      });

      sinon.spy(view, 'navigate');

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    describe('renders', function () {
      it('coming from sign up, redirects to /signup when email accound data missing', function () {
        account.clear('email');
        return initView()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup'));
          });
      });

      it('renders email info', function () {
        return initView()
          .then(function () {
            assert.include(view.$('#fxa-choose-what-to-sync-header .email').text(), email,
              'email is in the view');
          });
      });
    });

    describe('_getDeclinedEngines', function () {
      it('returns an array of declined engines', function () {
        return initView()
          .then(function () {
            //decline the first engine
            $('.customize-sync').first().click();
            var declined = view._getDeclinedEngines();
            assert.equal(declined.length, 1, 'has declined engines');
            assert.equal(declined[0], 'tabs', 'has engine value');
          });
      });
    });

    describe('submit', function () {
      beforeEach(function () {
        sinon.spy(user, 'setAccount');
      });

      it('coming from sign up, redirects unverified users to the confirm page on success', function () {
        return initView()
          .then(function () {
            $('.customize-sync').first().click();

            return view.validateAndSubmit()
              .then(function () {
                var declined = account.get('declinedSyncEngines');
                assert.equal(declined.length, 1, 'has declined engines');
                assert.equal(declined[0], 'tabs', 'has engine value');
                assert.isTrue(account.get('customizeSync'), 'sync customization is on');
                assert.isTrue(TestHelpers.isEventLogged(metrics, 'choose-what-to-sync.engine-unchecked.tabs'), 'tracks unchecked');
                assert.isTrue(user.setAccount.calledWith(account), 'user called with account');
                assert.isTrue(view.navigate.calledWith('confirm', {
                  account: account
                }), 'navigates to confirm');
              });
          });
      });

      it('notifies the broker when a pre-verified user signs up', function () {
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });
        sinon.stub(relier, 'has', function () {
          return true;
        });

        return initView()
          .then(function () {
            account.set('verified', true);

            return view.submit()
              .then(function () {
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(broker.afterSignIn.calledWith(account));
                assert.isTrue(view.navigate.calledWith('signup_complete'));
              });
          });
      });
    });
  });
});
