/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import Storage from 'lib/storage';

let experiment;
let expOptions;
let metrics;
let notifier;
let storage;

function createExperiment(experimentName, ExperimentConstructor) {
  notifier = new Notifier();
  metrics = new Metrics({ notifier });

  sinon.spy(metrics, 'logExperiment');
  sinon.spy(metrics, 'logEvent');

  storage = new Storage();

  experiment = new ExperimentConstructor();
  expOptions = {
    groupType: 'treatment',
    metrics: metrics,
    notifier: notifier,
    storage: storage,
  };

  experiment.initialize(experimentName, expOptions);
}

describe('lib/experiments/base', () => {
  beforeEach(() => {
    createExperiment('baseExperiment', Experiment);
  });

  describe('initialize', () => {
    it('requires options', () => {
      const experiment = new Experiment();
      experiment.initialize();
      assert.isFalse(experiment._initialized);
    });

    it('initializes', () => {
      assert.isTrue(experiment._initialized);
      assert.equal(experiment._groupType, 'treatment');
      assert.equal(
        experiment._loggingNamespace,
        'experiment.treatment.baseExperiment.'
      );
      assert.equal(experiment._storageNamespace, 'experiment.baseExperiment');

      assert.isTrue(metrics.logExperiment.calledOnce);
      assert.isTrue(
        metrics.logExperiment.calledWith('baseExperiment', 'treatment')
      );
    });
  });

  describe('saveState', () => {
    it('saves state', () => {
      sinon.spy(experiment, 'logEvent');

      experiment.saveState('clicked');
      assert.isTrue(
        JSON.parse(storage.get(experiment._storageNamespace)).clicked
      );

      assert.isTrue(experiment.logEvent.calledOnce);
      assert.isTrue(experiment.logEvent.calledWith('clicked'));
    });

    it('requires state', () => {
      assert.isFalse(experiment.saveState());
    });
  });

  describe('hasState', () => {
    it('returns if part treatment', () => {
      storage.set(
        experiment._storageNamespace,
        JSON.stringify({
          clicked: true,
        })
      );
      assert.isTrue(experiment.hasState('clicked'));
    });

    it('returns null if no state', () => {
      assert.isNull(experiment.hasState());
      assert.isFalse(experiment.hasState('randomState'));
    });
  });

  describe('notifications', () => {
    let twoSpy;

    beforeEach(() => {
      twoSpy = sinon.spy();
      const ConcreteExperiment = Experiment.extend({
        notifications: {
          one: Experiment.createSaveStateDelegate('thing'),
          two: twoSpy,
        },

        saveState: sinon.spy(),
      });

      createExperiment('concreteExperiment', ConcreteExperiment);
    });

    it('attaches notifications', () => {
      assert.isTrue(experiment.saveState.calledOnce, 'enrolled');
      assert.isTrue(experiment.saveState.calledWith('enrolled'), 'enrolled');

      notifier.trigger('one');
      assert.isTrue(experiment.saveState.calledTwice, 'notification');
      assert.isTrue(experiment.saveState.calledWith('thing'), 'one logs thing');

      notifier.trigger('two');
      assert.isTrue(twoSpy.calledOnce);
    });

    it('ignores notifications once destroyed', () => {
      experiment.destroy();
      notifier.trigger('two');

      assert.isFalse(twoSpy.called);
    });
  });
});
