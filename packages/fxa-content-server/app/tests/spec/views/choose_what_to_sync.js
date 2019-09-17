/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import SentryMetrics from 'lib/sentry';
import SessionVerificationPoll from 'models/polls/session-verification';
import SyncEngines from 'models/sync-engines';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/choose_what_to_sync';
import WindowMock from '../../mocks/window';

describe('views/choose_what_to_sync', () => {
  let account;
  let broker;
  let email;
  let model;
  let metrics;
  let notifier;
  let onSubmitComplete;
  let relier;
  let sessionVerificationPoll;
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
    'creditcards',
  ];

  beforeEach(() => {
    windowMock = new WindowMock();

    syncEngines = new SyncEngines(null, {
      engines: DISPLAYED_ENGINE_IDS,
      window: windowMock,
    });
    broker = new Broker({
      chooseWhatToSyncWebV1Engines: syncEngines,
    });
    relier = new Relier();
    sinon
      .stub(broker, 'persistVerificationData')
      .callsFake(() => Promise.resolve());
    email = TestHelpers.createEmail();
    model = new Backbone.Model();
    notifier = new Notifier();
    metrics = new Metrics({ notifier, sentryMetrics: new SentryMetrics() });
    onSubmitComplete = sinon.spy();
    user = new User({});

    account = new Account({
      email: email,
      sessionToken: 'fake session token',
      uid: 'uid',
    });

    model.set({
      account: account,
      onSubmitComplete: onSubmitComplete,
    });

    sessionVerificationPoll = new SessionVerificationPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );
  });

  afterEach(() => {
    metrics.destroy();
    metrics = null;

    view.remove();
    view.destroy();
    view = null;
  });

  function initView() {
    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      sessionVerificationPoll,
      user,
      viewName: 'choose-what-to-sync',
    });

    sinon.spy(view, 'navigate');

    return view.render();
  }

  it('registers for the expected events', () => {
    return initView().then(() => {
      assert.isFunction(view.events['click a']);
      assert.isFunction(view.events['click input']);
      assert.isFunction(view.events['input input']);
      assert.isFunction(view.events['keyup input']);
      assert.isFunction(view.events['submit']);
    });
  });

  describe('renders', () => {
    it('coming from sign up, redirects to /signup when email accound data missing', () => {
      account.clear('email');
      return initView().then(() => {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });
  });

  describe('pollVerification', () => {
    it('polls', () => {
      model.set('pollVerification', true);
      return initView()
        .then(() => {
          sinon.spy(view, 'waitForSessionVerification');
          return view.afterVisible();
        })
        .then(() => {
          assert.isTrue(view.waitForSessionVerification.calledOnce);
        });
    });

    it('does not poll', () => {
      model.set('pollVerification', false);
      return initView()
        .then(() => {
          sinon.spy(view, 'waitForSessionVerification');
          return view.afterVisible();
        })
        .then(() => {
          assert.isFalse(view.waitForSessionVerification.calledOnce);
        });
    });
  });

  describe('showDoNotSyncButton', () => {
    it('shows the do not sync button', () => {
      model.set('allowToDisableSync', true);
      return initView()
        .then(() => {
          return view.afterVisible();
        })
        .then(() => {
          assert.lengthOf(view.$('#do-not-sync-device'), 1);
        });
    });

    it('hides the do not sync button', () => {
      model.set('allowToDisableSync', false);
      return initView()
        .then(() => {
          return view.afterVisible();
        })
        .then(() => {
          assert.lengthOf(view.$('#do-not-sync-device'), 0);
        });
    });
  });

  describe('afterVisible', () => {
    it('persists verification data, starts poll', () => {
      model.set('pollVerification', true);

      return initView()
        .then(() => {
          sinon.stub(view, 'waitForSessionVerification').callsFake(() => {});
          return view.afterVisible();
        })
        .then(() => {
          assert.isTrue(broker.persistVerificationData.calledOnce);
          assert.isTrue(broker.persistVerificationData.calledWith(account));

          assert.isTrue(view.waitForSessionVerification.calledOnce);
          assert.isTrue(view.waitForSessionVerification.calledWith(account));
        });
    });
  });

  describe('session verification polling', () => {
    it('invokes `validateAndSubmit` on verification', () => {
      model.set('pollVerification', true);

      return initView()
        .then(() => {
          sinon.spy(view, 'waitForSessionVerification');
          sinon.stub(view, 'validateAndSubmit').callsFake(() => {});
          sinon.stub(sessionVerificationPoll, 'start').callsFake(() => {});
          return view.afterVisible();
        })
        .then(() => {
          assert.isTrue(sessionVerificationPoll.start.calledOnce);

          assert.isFalse(view.validateAndSubmit.called);
          sessionVerificationPoll.trigger('verified');
          assert.isTrue(view.validateAndSubmit.calledOnce);
        });
    });
  });

  describe('destroy', () => {
    it('removes SCREEN_CLASS from body, calls the parent', () => {
      return initView().then(() => {
        return new Promise(resolve => {
          view.on('destroyed', () => resolve());

          view.destroy();
          assert.isFalse($('body').hasClass(View.SCREEN_CLASS));
        });
      });
    });
  });

  describe('_getOfferedEngines', () => {
    it('gets a list of offered engines, suitable for displaying', () => {
      return initView().then(() => {
        const offeredEngines = view._getOfferedEngines();
        assert.lengthOf(offeredEngines, DISPLAYED_ENGINE_IDS.length);
        offeredEngines.forEach(offeredEngine => {
          assert.ok(offeredEngine.tabindex);
          assert.ok(offeredEngine.text);
        });
      });
    });
  });

  describe('_getDeclinedEngineIds', () => {
    it('returns an array of declined engines', () => {
      return initView().then(() => {
        $('#container').html(view.el);
        //decline the first engine
        $('.customize-sync')
          .first()
          .click();
        const declined = view._getDeclinedEngineIds();
        assert.sameMembers(declined, ['tabs']);
      });
    });
  });

  describe('_getOfferedEngineIds', () => {
    it('returns an array of offered engine ids', () => {
      return initView().then(() => {
        const offered = view._getOfferedEngineIds();
        assert.sameMembers(offered, DISPLAYED_ENGINE_IDS);
      });
    });
  });

  describe('submit', () => {
    it('updates the account, logs metrics, calls onSubmitComplete', () => {
      return initView()
        .then(() => {
          view
            .$('.customize-sync')
            .first()
            .removeAttr('checked');

          sinon.spy(notifier, 'trigger');
          return view.submit();
        })
        .then(() => {
          const declined = account.get('declinedSyncEngines');
          assert.sameMembers(declined, ['tabs']);

          const offered = account.get('offeredSyncEngines');
          assert.sameMembers(offered, DISPLAYED_ENGINE_IDS);

          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.equal(args[0], 'set-sync-engines');
          assert.deepEqual(args[1], [
            'bookmarks',
            'addons',
            'passwords',
            'history',
            'prefs',
            'creditcards',
          ]);

          assert.isTrue(view.onSubmitComplete.calledOnce);
          assert.instanceOf(view.onSubmitComplete.args[0][0], Account);

          assert.isTrue(
            TestHelpers.isEventLogged(
              metrics,
              'choose-what-to-sync.engine-unchecked.tabs'
            )
          );
        });
    });
  });
});
