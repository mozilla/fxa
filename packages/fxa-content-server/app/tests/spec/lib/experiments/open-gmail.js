/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Able = require('lib/able');
  var Account = require('models/account');
  var chai = require('chai');
  var Experiment = require('lib/experiments/open-gmail');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var WindowMock = require('../../../mocks/window');

  var able;
  var account;
  var assert = chai.assert;
  var experiment;
  var metrics;
  var notifier;
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
      notifier = new Notifier();
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
        notifier: notifier,
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
          notifier: notifier,
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
        notifier.trigger('verification.success');

        assert.isTrue(experiment.saveState.called);
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.verified'));

        notifier.trigger('verification.success');
        notifier.trigger('verification.success');

        assert.isTrue(experiment.metrics.logEvent.calledOnce, 'verification event logged');
      });

      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered'), 'not triggered');
        notifier.trigger('openGmail.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered'), 'triggered');

        notifier.trigger('openGmail.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked'), 'clicked');

        notifier.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.openGmail.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        notifier.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
