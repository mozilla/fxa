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
  'lib/experiments/mailcheck'
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

  describe('lib/experiments/mailcheck', function () {
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
      experiment.initialize('mailcheck', {
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
        experiment._notifications.trigger('signup.submit', {}, mockView);
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
        experiment._notifications.trigger('signup.submit', {}, mockView);
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.corrected'));
      });
    });

    describe('_onVerificationSuccess', function () {
      it('works with plain saveState', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.enrolled'));
        experiment._notifications.trigger('verification.success');

        assert.isTrue(experiment.saveState.called);
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.verified'));

        experiment._notifications.trigger('verification.success');
        experiment._notifications.trigger('verification.success');

        assert.isTrue(experiment.metrics.logEvent.calledOnce, 'verification event logged');
      });

      it('properly logs events', function () {
        sinon.spy(experiment, 'saveState');
        sinon.spy(experiment.metrics, 'logEvent');

        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.enrolled'), 'enrolled');
        assert.equal(metrics.getFilteredData().events.length, 1, 'should log the events that happened');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked'), 'not clicked');
        assert.isFalse(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered'), 'not triggered');
        experiment._notifications.trigger('mailcheck.triggered');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered'), 'triggered');

        experiment._notifications.trigger('mailcheck.clicked');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked'), 'clicked');

        experiment._notifications.trigger('verification.success');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.verified'), 'verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.triggered.verified'), 'triggered.verified');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'experiment.treatment.mailcheck.clicked.verified'), 'clicked.verified');

        assert.equal(metrics.getFilteredData().events.length, 6, 'should log the events that happened');
        experiment._notifications.trigger('verification.success');
        assert.equal(metrics.getFilteredData().events.length, 6, 'should not log events that already happened');
      });
    });

  });
});
