/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

define([
  'chai',
  'jquery',
  'sinon',
  'lib/promise',
  'views/permissions',
  'lib/metrics',
  'lib/fxa-client',
  'lib/ephemeral-messages',
  'models/reliers/relier',
  'models/user',
  'models/auth_brokers/base',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, p, View, Metrics, FxaClient, EphemeralMessages,
      Relier, User, Broker, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;

  describe('views/permissions', function () {
    var view;
    var routerMock;
    var metrics;
    var windowMock;
    var fxaClient;
    var relier;
    var broker;
    var user;
    var email;
    var ephemeralMessages;
    var account;
    var SERVICE_NAME = 'Relier';
    var CLIENT_ID = 'relier';
    var SERVICE_URI = 'relier.com';
    var PERMISSIONS = ['profile:email', 'profile:uid'];

    beforeEach(function () {
      email = TestHelpers.createEmail();
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      relier.set({
        clientId: CLIENT_ID,
        serviceName: SERVICE_NAME,
        serviceUri: SERVICE_URI,
        permissions: PERMISSIONS
      });
      broker = new Broker();
      fxaClient = new FxaClient();
      user = new User({
        fxaClient: fxaClient
      });
      ephemeralMessages = new EphemeralMessages();
      account = user.initAccount({
        email: email,
        uid: 'uid',
        sessionToken: 'fake session token'
      });
      ephemeralMessages.set('data', {
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
        router: routerMock,
        metrics: metrics,
        window: windowMock,
        fxaClient: fxaClient,
        user: user,
        relier: relier,
        broker: broker,
        screenName: 'permissions',
        ephemeralMessages: ephemeralMessages,
        type: type
      });

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
            assert.equal(routerMock.page, '/signin');
          });
      });
      it('coming from sign up, redirects to /signup when session token missing', function () {
        account.clear('sessionToken');
        return initView('sign_up')
          .then(function () {
            assert.equal(routerMock.page, '/signup');
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
            sinon.spy(view, 'navigate');

            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(view.navigate.calledWith('confirm', {
                  data: { account: account }
                }));
              });
          });
      });

      it('coming from sign up, redirects unverified users to the confirm page on success', function () {
        return initView('sign_up')
          .then(function () {
            sinon.spy(view, 'navigate');

            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(view.navigate.calledWith('confirm', {
                  data: { account: account }
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
                assert.equal(routerMock.page, 'settings');
              });
          });
      });

      it('notifies the broker when a pre-verified user signs up', function () {
        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        return initView('sign_up')
          .then(function () {
            account.set('verified', true);
            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(broker.afterSignIn.calledWith(account));
                assert.equal(routerMock.page, 'signup_complete');
              });
          });
      });

    });

  });
});
