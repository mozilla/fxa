/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  '../../../lib/helpers',
  '../../../mocks/window',
  'lib/session',
  'lib/able',
  'lib/metrics',
  'models/user',
  'models/account',
  'models/notifications',
  'lib/experiments/open-gmail'
],
function (chai, sinon, TestHelpers, WindowMock, Session, Able,
  Metrics, User, Account, Notifications, Experiment) {
  'use strict';

  var assert = chai.assert;
  var experiment;
  var notifications;
  var windowMock;
  var able;
  var metrics;
  var user;
  var account;
  var UUID = 'a mock uuid';

  describe('lib/experiments/open-gmail', function () {
    beforeEach(function () {
      account = new Account({
        email: 'some@gmail.com'
      });
      windowMock = new WindowMock();
      able = new Able();
      metrics = new Metrics();
      user = new User({
        uniqueUserId: UUID
      });

      sinon.stub(able, 'choose', function () {
        return 'treatment';
      });

      notifications = new Notifications();
      experiment = new Experiment();
      experiment.initialize('openGmail', {
        window: windowMock,
        able: able,
        metrics: metrics,
        account: account,
        user: user,
        notifications: notifications
      });

    });

    afterEach(function () {
      Session.testClear();
    });

    describe('initialize', function () {
      it('initializes', function () {
        assert.isTrue(experiment._initialized);
      });

      it('requires account', function () {
        var experiment = new Experiment();
        var initResult = experiment.initialize('openGmail', {
          window: windowMock,
          able: able,
          metrics: metrics,
          user: user,
          notifications: notifications
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
