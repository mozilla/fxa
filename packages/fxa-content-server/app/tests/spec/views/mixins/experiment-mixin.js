/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'chai',
  'sinon',
  '../../../mocks/window',
  'views/mixins/experiment-mixin',
  'views/base',
  'stache!templates/test_template',
  'models/user',
  'models/notifications',
  'lib/able',
  'lib/metrics'
], function (Cocktail, Chai, sinon, WindowMock, Mixin, BaseView, TestTemplate, User,
  Notifications, Able, Metrics) {
  'use strict';

  var assert = Chai.assert;
  var View = BaseView.extend({
    template: TestTemplate
  });
  Cocktail.mixin(View, Mixin);

  var mockExperiment = {
    isOptedInTo: function () {
      return true;
    },
    isGroup: function () {
      return true;
    }
  };

  describe('views/mixins/experiment-mixin', function () {
    var view;
    var windowMock;
    var metrics;
    var able;
    var notifications;
    var user;
    var UUID = 'a mock uuid';

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.navigator.userAgent = 'mocha';
      able = new Able();
      metrics = new Metrics();
      user = new User({
        uniqueUserId: UUID
      });
      notifications = new Notifications();

      view = new View({
        able: able,
        metrics: metrics,
        user: user,
        window: windowMock,
        notifications: notifications
      });

      return view.render();
    });

    afterEach(function () {
      return view.destroy();
    });

    describe('initialize', function () {
      it('initializes', function () {
        assert.isTrue(view.experiments.initialized);
      });
    });

    describe('isInExperiment', function () {
      it('returns if user is in experiment', function () {
        view.experiments._activeExperiments = {
          'realExperiment': mockExperiment
        };

        assert.isTrue(view.isInExperiment('realExperiment'));
      });

      it('returns if user is not in experiment', function () {
        view.experiments._activeExperiments = {
          'realExperiment': mockExperiment
        };

        assert.isFalse(view.isInExperiment('fakeExperiment'));
      });
    });

    describe('isInExperimentGroup', function () {
      it('returns if user is in experiment group', function () {
        view.experiments._activeExperiments = {
          'realExperiment': mockExperiment
        };

        assert.isTrue(view.isInExperimentGroup('realExperiment', 'treatment'));
        assert.isTrue(view.isInExperimentGroup('realExperiment', 'control'));
      });

      it('returns if user is not in experiment group', function () {
        view.experiments._activeExperiments = {
          'realExperiment': mockExperiment
        };

        assert.isFalse(view.isInExperimentGroup('fakeExperiment', 'treatment'));
        assert.isFalse(view.isInExperimentGroup('fakeExperiment', 'control'));
      });
    });

    describe('experimentTrigger', function () {
      it('does not trigger if there is no event name', function () {
        sinon.spy(view.experiments.notifications, 'trigger');
        view.experimentTrigger();
        assert.isTrue(view.experiments.notifications.trigger.notCalled);
      });

      it('triggers notifications', function () {
        sinon.spy(view.experiments.notifications, 'trigger');
        view.experimentTrigger('notifications');
        assert.isTrue(view.experiments.notifications.trigger.called);
      });
    });

  });
});
