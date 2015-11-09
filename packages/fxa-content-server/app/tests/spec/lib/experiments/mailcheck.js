/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Able = require('lib/able');
  var chai = require('chai');
  var Experiment = require('lib/experiments/mailcheck');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var WindowMock = require('../../../mocks/window');

  var able;
  var assert = chai.assert;
  var experiment;
  var notifier;
  var metrics;
  var storage;
  var user;
  var UUID = 'a mock uuid';
  var windowMock;

  describe('lib/experiments/mailcheck', function () {
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
      experiment.initialize('mailcheck', {
        able: able,
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
    });

    describe('_onSignupSubmit', function () {
      it('logs the corrected event', function () {
        var mockView = {
          $el: {
            find: function () {
              return {
                val: function () {
                  return 'a@gmail.com';
                },
                data: function () {
                  return 'a@gmail.com';
                }
              };
            }
          }
        };
        notifier.trigger('signup.submit', {}, mockView);
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.corrected'));
      });

      it('does not log the corrected event if email value does not match', function () {
        var mockView = {
          $el: {
            find: function () {
              return {
                val: function () {
                  return 'a@snailmail.com';
                },
                data: function () {
                  return 'a@gmail.com';
                }
              };
            }
          }
        };
        notifier.trigger('signup.submit', {}, mockView);
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.corrected'));
      });
    });

    describe('_onVerificationSuccess', function () {
      it('works with plain saveState', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.enrolled'));
        notifier.trigger('verification.success');

        assert.isTrue(experiment.saveState.called);
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.verified'));

        notifier.trigger('verification.success');
        notifier.trigger('verification.success');

        assert.isTrue(experiment.metrics.logEvent.calledOnce, 'verification event logged');
      });

      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered'), 'not triggered');
        notifier.trigger('mailcheck.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered'), 'triggered');

        notifier.trigger('mailcheck.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked'), 'clicked');

        notifier.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        notifier.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
