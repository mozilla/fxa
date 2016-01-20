/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Notifier = require('lib/channels/notifier');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/permissions');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/permissions', function () {
    var account;
    var broker;
    var email;
    var fxaClient;
    var metrics;
    var model;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    var CLIENT_ID = 'relier';
    var PERMISSIONS = ['profile:email', 'profile:uid'];
    var SERVICE_NAME = 'Relier';
    var SERVICE_URI = 'relier.com';

    beforeEach(function () {
      broker = new Broker();
      email = TestHelpers.createEmail();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      relier.set({
        clientId: CLIENT_ID,
        permissions: PERMISSIONS,
        serviceName: SERVICE_NAME,
        serviceUri: SERVICE_URI
      });
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

    function initView (type) {
      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        type: type,
        user: user,
        viewName: 'permissions',
        window: windowMock
      });

      sinon.spy(view, 'navigate');

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    describe('renders', function () {
      it('coming from sign in, redirects to /signin when session token missing', function () {
        account.clear('sessionToken');
        return initView('sign_in')
          .then(function () {
            assert.isTrue(view.navigate.calledWith('/signin'));
          });
      });
      it('coming from sign up, redirects to /signup when session token missing', function () {
        account.clear('sessionToken');
        return initView('sign_up')
          .then(function () {
            assert.isTrue(view.navigate.calledWith('/signup'));
          });
      });
      it('renders relier info', function () {
        return initView('sign_up')
          .then(function () {
            assert.include(view.$('#permission-request').text(), SERVICE_NAME,
              'service name shows in paragraph');

            assert.equal(view.$('.email').val(), email,
              'shows email in permissions list');
          });
      });
    });

    describe('submit', function () {
      beforeEach(function () {
        sinon.spy(account, 'saveGrantedPermissions');
        sinon.spy(user, 'setAccount');
      });

      it('coming from sign in, redirects unverified users to the confirm page on success', function () {
        return initView('sign_in')
          .then(function () {

            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(view.navigate.calledWith('confirm', {
                  account: account
                }));
              });
          });
      });

      it('coming from sign up, redirects unverified users to the confirm page on success', function () {
        return initView('sign_up')
          .then(function () {

            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(view.navigate.calledWith('confirm', {
                  account: account
                }));
              });
          });
      });

      it('notifies the broker when a verified user signs in', function () {
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        return initView('sign_in')
          .then(function () {
            account.set('verified', true);
            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'permissions.success'));
                assert.isTrue(broker.afterSignIn.calledWith(account));
                assert.isTrue(view.navigate.calledWith('settings'));
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

        return initView('sign_up')
          .then(function () {
            account.set('verified', true);
            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(broker.afterSignIn.calledWith(account));
                assert.isTrue(view.navigate.calledWith('signup_complete'));
              });
          });
      });

    });

  });
});
