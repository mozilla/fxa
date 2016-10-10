/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/fx-fennec-v1');
  const chai = require('chai');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/choose_what_to_sync');

  var assert = chai.assert;

  describe('views/choose_what_to_sync', function () {
    var account;
    var broker;
    var email;
    var model;
    var metrics;
    var notifier;
    var onSubmitComplete;
    var user;
    var view;

    beforeEach(function () {
      broker = new Broker();
      email = TestHelpers.createEmail();
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      onSubmitComplete = sinon.spy();
      user = new User({});

      account = new Account({
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

    function initView () {
      view = new View({
        broker: broker,
        metrics: metrics,
        model: model,
        notifier: notifier,
        user: user,
        viewName: 'choose-what-to-sync'
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
        sinon.stub(user, 'setAccount', function () {
          return p(account);
        });

        return initView()
          .then(function () {
            $('.customize-sync').first().click();

            return view.validateAndSubmit();
          });
      });

      it('sets declinedSyncEngines', function () {
        var declined = account.get('declinedSyncEngines');
        assert.equal(declined.length, 1, 'has declined engines');
        assert.equal(declined[0], 'tabs', 'has engine value');
      });

      it('calls onSubmitComplete with the account', function () {
        assert.isTrue(view.onSubmitComplete.calledOnce);
        assert.instanceOf(view.onSubmitComplete.args[0][0], Account);
      });

      it('logs the expected metrics', function () {
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'choose-what-to-sync.engine-unchecked.tabs'));
      });

      it('saves the account', function () {
        assert.isTrue(user.setAccount.calledWith(account));
      });
    });
  });
});
