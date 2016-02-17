/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
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
    var metrics;
    var model;
    var notifier;
    var onSubmitComplete;
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
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      onSubmitComplete = sinon.spy();
      relier = new Relier();
      windowMock = new WindowMock();

      relier.set({
        clientId: CLIENT_ID,
        permissions: PERMISSIONS,
        serviceName: SERVICE_NAME,
        serviceUri: SERVICE_URI
      });
      user = new User({});
      account = user.initAccount({
        email: email,
        sessionToken: 'fake session token',
        uid: 'uid'
      });
      model.set({
        account: account,
        onSubmitComplete: onSubmitComplete
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
        sinon.stub(user, 'setAccount', function (account) {
          return p(account);
        });

        return initView('sign_in')
          .then(function () {

            return view.submit();
          });
      });

      it('saves the granted permissions', function () {
        assert.isTrue(
          account.saveGrantedPermissions.calledWith(CLIENT_ID, PERMISSIONS));
      });

      it('sets the account', function () {
        assert.isTrue(user.setAccount.calledWith(account));
      });

      it('calls onSubmitComplete', function () {
        assert.isTrue(onSubmitComplete.calledWith(account));
      });
    });

  });
});
