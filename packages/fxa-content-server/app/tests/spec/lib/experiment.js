/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  '../../mocks/window',
  'lib/session',
  'lib/able',
  'lib/metrics',
  'models/user',
  'models/notifications',
  'lib/experiment'
],
function (chai, sinon, WindowMock, Session, Able,
          Metrics, User, Notifications, ExperimentInterface) {
  'use strict';

  var assert = chai.assert;
  var expInt;
  var expOptions;
  var notifications;
  var windowMock;
  var able;
  var metrics;
  var user;
  var UUID = 'a mock uuid';
  var mockExperiment = {
    initialize: function () {
      return true;
    },
    isInGroup: function () {
      return true;
    }
  };

  describe('lib/experiment', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.navigator.userAgent = 'mocha';
      able = new Able();
      metrics = new Metrics();
      user = new User({
        uniqueUserId: UUID
      });

      notifications = new Notifications();
      expOptions = {
        able: able,
        metrics: metrics,
        notifications: notifications,
        user: user,
        window: windowMock
      };
      expInt = new ExperimentInterface(expOptions);
    });

    afterEach(function () {
      Session.testClear();
    });

    describe('constructor', function () {
      it('requires options', function () {
        var expInt = new ExperimentInterface();
        assert.isFalse(expInt.initialized);
      });

      it('supports ua override and forcing experiments', function () {
        assert.isTrue(expInt.initialized, 'properly init');

        expOptions.window.navigator.userAgent = 'Something/1.0 FxATester/1.0';
        var expInt2 = new ExperimentInterface(expOptions);
        assert.isFalse(expInt2.initialized, 'do not init if override');

        expOptions.window.location.search = 'forceExperiment=something';
        var expInt3 = new ExperimentInterface(expOptions);
        assert.equal(expInt3.forceExperiment, 'something');
        assert.isTrue(expInt3.initialized, 'forceExperiment overrides user agent');
      });
    });

    describe('isInExperiment', function () {
      it('checks experiment opt in', function () {
        expInt._activeExperiments = {
          'mockExperiment': mockExperiment
        };

        assert.isTrue(expInt.isInExperiment('mockExperiment'));
        assert.isFalse(expInt.isInExperiment('otherExperiment'));
        assert.isFalse(expInt.isInExperiment());
      });
    });

    describe('isInExperimentGroup', function () {
      it('is true when opted in', function () {
        expInt._activeExperiments = {
          'mockExperiment': mockExperiment
        };

        assert.isTrue(expInt.isInExperimentGroup('mockExperiment'));
        assert.isFalse(expInt.isInExperimentGroup('otherExperiment'));
        assert.isFalse(expInt.isInExperimentGroup());
      });
    });

    describe('chooseExperiments', function () {
      it('does not choose when not init', function () {
        sinon.spy(expInt.able, 'choose');
        expInt.initialized = false;
        expInt.chooseExperiments();
        assert.isFalse(expInt.able.choose.called);
      });

      it('choose experiments', function () {
        expInt._allExperiments = {
          'mock': function () { return mockExperiment; }
        };
        sinon.stub(expInt.able, 'choose', function () {
          return 'mock';
        });

        assert.isUndefined(expInt._activeExperiments.mock);
        expInt.chooseExperiments();
        assert.isTrue(expInt.able.choose.called);
        assert.isNotNull(expInt._activeExperiments.mock);
      });
    });

  });
});
