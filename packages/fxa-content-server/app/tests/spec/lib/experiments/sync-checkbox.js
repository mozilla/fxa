/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/able',
  'lib/experiments/sync-checkbox',
  'lib/metrics',
  'lib/storage',
  'lib/channels/notifier',
  'models/user',
  'sinon',
  '../../../lib/helpers',
  '../../../mocks/window'
],
function (chai, Able, Experiment, Metrics, Storage, Notifier, User,
  sinon, TestHelpers, WindowMock) {
  'use strict';

  var able;
  var assert = chai.assert;
  var experiment;
  var notifier;
  var metrics;
  var storage;
  var user;
  var UUID = 'a mock uuid';
  var windowMock;

  describe('lib/experiments/sync-checkbox', function () {
    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return 'treatment';
      });

      metrics = new Metrics();
      notifier = new Notifier();
      storage = new Storage();
      user = new User({
        uniqueUserId: UUID
      });
      windowMock = new WindowMock();

      experiment = new Experiment();
      experiment.initialize('syncCheckbox', {
        able: able,
        metrics: metrics,
        notifier: notifier,
        storage: storage,
        user: user,
        window: windowMock,
      });

    });

    describe('initialize', function () {
      it('initializes', function () {
        assert.isTrue(experiment._initialized);
      });
    });

    describe('notifier', function () {
      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered'), 'not triggered');
        notifier.trigger('syncCheckbox.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered'), 'triggered');

        notifier.trigger('syncCheckbox.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked'), 'clicked');

        notifier.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.syncCheckbox.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        notifier.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
