/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/metrics',
  '../../mocks/window',
  'models/notifications',
  'models/refresh-observer',
  'sinon'
],
function (chai, Metrics, WindowMock, Notifications, RefreshObserver, sinon) {
  'use strict';

  var assert = chai.assert;

  describe('models/refresh-observer', function () {
    var metrics;
    var notifications;
    var refreshObserver;
    var windowMock;

    var ViewMock = function () {};

    function createDeps () {
      metrics = new Metrics();
      notifications = new Notifications();
      windowMock = new WindowMock();

      refreshObserver = new RefreshObserver({
        metrics: metrics,
        notifications: notifications,
        window: windowMock
      });
    }

    beforeEach(function () {
      createDeps();
    });

    describe('logIfRefresh', function () {
      beforeEach(function () {
        sinon.spy(metrics, 'logScreenEvent');
      });

      describe('with two consecutive views with different names', function () {
        beforeEach(function () {
          refreshObserver.logIfRefresh('screen1');
          refreshObserver.logIfRefresh('screen2');
        });

        it('does not log a page refresh', function () {
          assert.isFalse(metrics.logScreenEvent.called);
        });
      });

      describe('with two consecutive views with the same name', function () {
        beforeEach(function () {
          refreshObserver.logIfRefresh('screen1');
          refreshObserver.logIfRefresh('screen1');
        });

        it('logs a page refresh', function () {
          assert.isTrue(
              metrics.logScreenEvent.calledWith('screen1', 'refresh'));
        });
      });
    });

    describe('notifications', function () {
      beforeEach(function () {
        sinon.spy(refreshObserver, 'logIfRefresh');
      });

      describe('show-view', function () {
        beforeEach(function () {
          notifications.trigger('show-view', ViewMock, { screenName: 'screen1' });
        });

        it('calls `logIfRefresh', function () {
          assert.isTrue(refreshObserver.logIfRefresh.calledWith('screen1'));
        });
      });

      describe('show-sub-view', function () {
        beforeEach(function () {
          notifications.trigger('show-sub-view', ViewMock, ViewMock, { screenName: 'screen1' });
        });

        it('calls `logIfRefresh', function () {
          assert.isTrue(refreshObserver.logIfRefresh.calledWith('screen1'));
        });
      });
    });
  });
});

