/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const { assert } = require('chai');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const SyncEngines = require('models/sync-engines');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/choose_what_to_sync');
  const WindowMock = require('../../mocks/window');

  describe('views/choose_what_to_sync', () => {
    let account;
    let broker;
    let email;
    let model;
    let metrics;
    let notifier;
    let onSubmitComplete;
    let syncEngines;
    let user;
    let view;
    let windowMock;

    const DISPLAYED_ENGINE_IDS = [
      'tabs',
      'bookmarks',
      'addons',
      'passwords',
      'history',
      'prefs',
      'creditcards'
    ];

    beforeEach(() => {
      windowMock = new WindowMock();

      syncEngines = new SyncEngines(null, {
        engines: DISPLAYED_ENGINE_IDS,
        window: windowMock
      });
      broker = new Broker({
        chooseWhatToSyncWebV1Engines: syncEngines
      });
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
      metrics = null;

      view.remove();
      view.destroy();
      view = null;
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

      return view.render();
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
            const $rowEls = view.$('.choose-what-to-sync-row');
            assert.lengthOf($rowEls, DISPLAYED_ENGINE_IDS.length);
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

    describe('_getOfferedEngines', () => {
      it('gets a list of offered engines, suitable for displaying', () => {
        return initView()
          .then(() => {
            const offeredEngines = view._getOfferedEngines();
            assert.lengthOf(offeredEngines, DISPLAYED_ENGINE_IDS.length);
            offeredEngines.forEach((offeredEngine) => {
              assert.ok(offeredEngine.tabindex);
              assert.ok(offeredEngine.text);
            });
          });
      });
    });

    describe('_getDeclinedEngineIds', () => {
      it('returns an array of declined engines', () => {
        return initView()
          .then(() => {
            $('#container').html(view.el);
            //decline the first engine
            $('.customize-sync').first().click();
            const declined = view._getDeclinedEngineIds();
            assert.sameMembers(declined, ['tabs', 'creditcards']);
          });
      });
    });

    describe('_getOfferedEngineIds', () => {
      it('returns an array of offered engine ids', () => {
        return initView()
          .then(() => {
            const offered = view._getOfferedEngineIds();
            assert.sameMembers(offered, DISPLAYED_ENGINE_IDS);
          });
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        sinon.stub(user, 'setAccount', () => p(account));

        return initView()
          .then(() => {
            $('#container').html(view.el);
            $('.customize-sync').first().click();

            return view.validateAndSubmit();
          });
      });

      it('updates and saves the account, logs metrics, calls onSubmitComplete', () => {
        const declined = account.get('declinedSyncEngines');
        assert.sameMembers(declined, ['tabs', 'creditcards']);

        const offered = account.get('offeredSyncEngines');
        assert.sameMembers(offered, DISPLAYED_ENGINE_IDS);

        assert.isTrue(user.setAccount.calledWith(account));

        assert.isTrue(view.onSubmitComplete.calledOnce);
        assert.instanceOf(view.onSubmitComplete.args[0][0], Account);

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'choose-what-to-sync.engine-unchecked.tabs'));
      });
    });
  });
});
