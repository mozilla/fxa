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
  'models/notifications',
  'lib/experiments/sync-checkbox'
],
function (chai, sinon, TestHelpers, WindowMock, Session, Able,
          Metrics, User, Notifications, Experiment) {
  'use strict';

  var assert = chai.assert;
  var experiment;
  var notifications;
  var windowMock;
  var able;
  var metrics;
  var user;
  var UUID = 'a mock uuid';

  describe('lib/experiments/sync-checkbox', function () {
    beforeEach(function () {
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
      experiment.initialize('syncCheckbox', {
        window: windowMock,
        able: able,
        metrics: metrics,
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
    });

    describe('notifications', function () {
      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered'), 'not triggered');
        experiment._notifications.trigger('syncCheckbox.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered'), 'triggered');

        experiment._notifications.trigger('syncCheckbox.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked'), 'clicked');

        experiment._notifications.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        experiment._notifications.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
