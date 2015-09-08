/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/able',
  'lib/experiments/open-gmail',
  'lib/metrics',
  'lib/storage',
  'models/account',
  'models/notifications',
  'models/user',
  'sinon',
  '../../../lib/helpers',
  '../../../mocks/window'
],
function (chai, Able, Experiment, Metrics, Storage, Account, Notifications,
  User, sinon, TestHelpers, WindowMock) {
  'use strict';

  var able;
  var account;
  var assert = chai.assert;
  var experiment;
  var metrics;
  var notifications;
  var storage;
  var user;
  var UUID = 'a mock uuid';
  var windowMock;

  describe('lib/experiments/open-gmail', function () {
    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return 'treatment';
      });
      account = new Account({
        email: 'some@gmail.com'
      });
      metrics = new Metrics();
      notifications = new Notifications();
      storage = new Storage();
      user = new User({
        uniqueUserId: UUID
      });
      windowMock = new WindowMock();

      experiment = new Experiment();
      experiment.initialize('openGmail', {
        able: able,
        account: account,
        metrics: metrics,
        notifications: notifications,
        storage: storage,
        user: user,
        window: windowMock
      });
    });

    describe('initialize', function () {
      it('initializes', function () {
        assert.isTrue(experiment._initialized);
      });

      it('requires account', function () {
        var experiment = new Experiment();
        var initResult = experiment.initialize('openGmail', {
          able: able,
          metrics: metrics,
          notifications: notifications,
          storage: storage,
          user: user,
          window: windowMock,
        });

        assert.isFalse(initResult);
      });
    });

    describe('_onVerificationSuccess', function () {
      it('works with plain saveState', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.enrolled'));
        experiment._notifications.trigger('verification.success');

        assert.isTrue(experiment.saveState.called);
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.verified'));

        experiment._notifications.trigger('verification.success');
        experiment._notifications.trigger('verification.success');

        assert.isTrue(experiment.metrics.logEvent.calledOnce, 'verification event logged');
      });

      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered'), 'not triggered');
        experiment._notifications.trigger('openGmail.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered'), 'triggered');

        experiment._notifications.trigger('openGmail.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked'), 'clicked');

        experiment._notifications.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        experiment._notifications.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
