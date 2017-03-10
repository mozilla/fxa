/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const { assert } = require('chai');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/fx-fennec-v1');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/choose_what_to_sync');

  describe('views/choose_what_to_sync', () => {
    var account;
    var broker;
    var email;
    var model;
    var metrics;
    var notifier;
    var onSubmitComplete;
    var user;
    var view;

    beforeEach(() => {
      broker = new Broker();
      email = TestHelpers.createEmail();
      model = new Backbone.Model();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
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

    afterEach(() => {
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
        .then(() => {
          $('#container').html(view.el);
        });
    }

    describe('renders', () => {
      it('coming from sign up, redirects to /signup when email accound data missing', () => {
        account.clear('email');
        return initView()
          .then(() => {
            assert.isTrue(view.navigate.calledWith('signup'));
          });
      });

      it('renders email info, adds SCREEN_CLASS to body', () => {
        return initView()
          .then(() => {
            assert.include(view.$('.success-email-created').text(), email,
              'email is in the view');
            assert.isTrue($('body').hasClass(View.SCREEN_CLASS));
          });
      });
    });

    describe('destroy', () => {
      it('removes SCREEN_CLASS from body, calls the parent', () => {
        return initView()
          .then(() => {
            const deferred = p.defer();
            view.on('destroyed', () => deferred.resolve());

            view.destroy();
            assert.isFalse($('body').hasClass(View.SCREEN_CLASS));

            return deferred.promise;
          });
      });
    });

    describe('_getDeclinedEngines', () => {
      it('returns an array of declined engines', () => {
        return initView()
          .then(() => {
            //decline the first engine
            $('.customize-sync').first().click();
            var declined = view._getDeclinedEngines();
            assert.equal(declined.length, 1, 'has declined engines');
            assert.equal(declined[0], 'tabs', 'has engine value');
          });
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        sinon.stub(user, 'setAccount', () => {
          return p(account);
        });

        return initView()
          .then(() => {
            $('.customize-sync').first().click();

            return view.validateAndSubmit();
          });
      });

      it('sets declinedSyncEngines', () => {
        var declined = account.get('declinedSyncEngines');
        assert.equal(declined.length, 1, 'has declined engines');
        assert.equal(declined[0], 'tabs', 'has engine value');
      });

      it('calls onSubmitComplete with the account', () => {
        assert.isTrue(view.onSubmitComplete.calledOnce);
        assert.instanceOf(view.onSubmitComplete.args[0][0], Account);
      });

      it('logs the expected metrics', () => {
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'choose-what-to-sync.engine-unchecked.tabs'));
      });

      it('saves the account', () => {
        assert.isTrue(user.setAccount.calledWith(account));
      });
    });
  });
});
