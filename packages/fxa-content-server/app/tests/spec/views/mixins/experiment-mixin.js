/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Mixin = require('views/mixins/experiment-mixin');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/test_template');
  const WindowMock = require('../../../mocks/window');

  const View = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    View,
    Mixin
  );

  describe('views/mixins/experiment-mixin', () => {
    let experiments;
    let notifier;
    let view;
    let windowMock;

    beforeEach(() => {
      // pass in an experimentsMock otherwise a new
      // ExperimentInterface is created before
      // a spy can be added to `chooseExperiments`
      experiments = {
        chooseExperiments: sinon.spy(),
        createExperiment: sinon.spy(() => {
          return {};
        }),
        destroy () {}
      };

      notifier = {
        trigger: sinon.spy()
      };
      windowMock = new WindowMock();

      view = new View({
        experiments,
        notifier,
        window: windowMock
      });
    });

    afterEach(() => {
      return view.destroy();
    });

    describe('initialize', () => {
      it('chooses experiments', () => {
        assert.isTrue(experiments.chooseExperiments.calledOnce);
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

    describe('createExperiment', () => {
      it('forces the flow model to initialize, then creates the experiment', () => {
        assert.ok(view.createExperiment('experimentName', 'control'));

        assert.isTrue(notifier.trigger.calledOnce);
        assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
        assert.isTrue(experiments.createExperiment.calledOnce);
        assert.isTrue(experiments.createExperiment.calledWith('experimentName', 'control'));
      });
    });

    it('contains delegate functions', () => {
      assert.isFunction(view.getExperimentGroup);
      assert.isFunction(view.isInExperiment);
      assert.isFunction(view.isInExperimentGroup);
    });
  });
});
