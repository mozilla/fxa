/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Able = require('lib/able');
  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Metrics = require('lib/metrics');
  const Mixin = require('views/mixins/experiment-mixin');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/test_template');
  const User = require('models/user');
  const WindowMock = require('../../../mocks/window');

  const View = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    View,
    Mixin
  );

  describe('views/mixins/experiment-mixin', () => {
    let able;
    let metrics;
    let notifier;
    let user;
    let view;
    let windowMock;

    beforeEach(() => {
      able = new Able();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      user = new User();
      windowMock = new WindowMock();

      view = new View({
        able: able,
        metrics: metrics,
        notifier: notifier,
        user: user,
        window: windowMock
      });
    });

    afterEach(() => {
      return view.destroy();
    });

    describe('initialize', () => {
      it('chooses experiments', () => {
        // pass in an experimentsMock otherwise a new
        // ExperimentInterface is created before
        // a spy can be added to `chooseExperiments`
        const experimentsMock = {
          chooseExperiments: sinon.spy(),
          destroy () {}
        };

        view.initialize({
          experiments: experimentsMock
        });

        assert.isTrue(experimentsMock.chooseExperiments.called);
      });
    });


    describe('destroy', () => {
      it('destroys the experiments instance', () => {
        let experiments = view.experiments;
        sinon.spy(experiments, 'destroy');

        view.destroy();

        assert.isTrue(experiments.destroy.called);
      });
    });

    describe('isInExperiment', () => {
      it('returns `true` if user is in experiment, `false` if not', () => {
        sinon.stub(view.experiments, 'isInExperiment', (experimentName) => {
          return experimentName === 'realExperiment';
        });

        assert.isTrue(view.isInExperiment('realExperiment'));
        assert.isFalse(view.isInExperiment('fakeExperiment'));
      });
    });

    describe('isInExperimentGroup', () => {
      it('returns `true` if user is in experiment group, `false` otw', () => {
        sinon.stub(view.experiments, 'isInExperimentGroup', (experimentName, groupName) => {
          return experimentName === 'realExperiment' &&
                 groupName === 'treatment';
        });

        assert.isTrue(view.isInExperimentGroup('realExperiment', 'treatment'));
        assert.isFalse(view.isInExperimentGroup('realExperiment', 'control'));
      });
    });
  });
});
