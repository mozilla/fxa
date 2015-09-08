/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/able',
  'lib/experiments/coppa-view',
  'lib/metrics',
  'lib/storage',
  'models/notifications',
  'models/user',
  'sinon',
  '../../../lib/helpers',
  '../../../mocks/window'
],
function (chai, Able, Experiment, Metrics, Storage, Notifications, User,
  sinon, TestHelpers, WindowMock) {
  'use strict';

  var able;
  var assert = chai.assert;
  var experiment;
  var metrics;
  var notifications;
  var storage;
  var user;
  var UUID = 'a mock uuid';
  var windowMock;

  describe('lib/experiments/coppa-view', function () {
    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return 'treatment';
      });

      metrics = new Metrics();
      notifications = new Notifications();
      storage = new Storage();
      user = new User({
        uniqueUserId: UUID
      });
      windowMock = new WindowMock();

      experiment = new Experiment();
      experiment.initialize('coppaView', {
        able: able,
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
