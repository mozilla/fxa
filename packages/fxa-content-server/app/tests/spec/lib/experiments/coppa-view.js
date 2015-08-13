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
  'lib/experiments/coppa-view'
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

  describe('lib/experiments/coppa-view', function () {
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
      experiment.initialize('coppaView', {
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

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');

        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.triggered'), 'not triggered');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.tooyoung'), 'not tooyoung');

        experiment._notifications.trigger('coppaView.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.triggered'), 'triggered');

        experiment._notifications.trigger('signup.tooyoung');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.tooyoung'), 'tooyoung');

        experiment._notifications.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.coppaView.verified'), 'verified');

        assert.equal(metrics.getFilteredData().events.length, 4, 'should log the events that happened');
        experiment._notifications.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 4, 'should not log events that already happened');
      });
    });

  });
});
