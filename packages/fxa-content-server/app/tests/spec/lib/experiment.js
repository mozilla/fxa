/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules/index';
import ExperimentInterface from 'lib/experiment';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../mocks/window';

let experimentGroupingRules;
let expInt;
let expOptions;
let metrics;
let notifier;
let user;
let windowMock;

const UUID = 'a mock uuid';
const mockExperiment = {
  initialize() {
    return true;
  },
  destroy() {},
};

describe('lib/experiment', () => {
  beforeEach(() => {
    windowMock = new WindowMock();
    windowMock.navigator.userAgent = 'mocha';
    experimentGroupingRules = new ExperimentGroupingRules();
    user = new User({
      uniqueUserId: UUID,
    });

    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    expOptions = {
      experimentGroupingRules,
      metrics,
      notifier,
      user,
      window: windowMock,
    };
    expInt = new ExperimentInterface(expOptions);
  });

  describe('constructor', () => {
    it('requires options', () => {
      var expInt = new ExperimentInterface();
      assert.isFalse(expInt.initialized);
    });

    it('supports ua override and forcing experiments', () => {
      assert.isTrue(expInt.initialized, 'properly init');

      expOptions.window.navigator.userAgent = 'Something/1.0 FxATester/1.0';
      var expInt2 = new ExperimentInterface(expOptions);
      assert.isFalse(expInt2.initialized, 'do not init if override');

      expOptions.window.location.search = 'forceExperiment=something';
      var expInt3 = new ExperimentInterface(expOptions);
      assert.equal(expInt3.forceExperiment, 'something');
      assert.isTrue(
        expInt3.initialized,
        'forceExperiment overrides user agent'
      );
    });

    it('supports webdriver override', () => {
      expOptions.window.navigator.webdriver = true;
      const expInt = new ExperimentInterface(expOptions);
      assert.isFalse(expInt.initialized, 'do not init if webdriver override');

      expOptions.window.location.search = 'forceExperiment=something';
      const expInt2 = new ExperimentInterface(expOptions);
      assert.equal(expInt2.forceExperiment, 'something');
      assert.isTrue(
        expInt2.initialized,
        'forceExperiment overrides user agent'
      );
    });
  });

  describe('createExperiment', () => {
    it('creates an experiment, only once', () => {
      const firstExperiment = expInt.createExperiment('sendSms', 'treatment');
      assert.ok(firstExperiment);
      const secondExperiment = expInt.createExperiment('sendSms', 'treatment');
      // It's the same object, not updated
      assert.strictEqual(firstExperiment, secondExperiment);
    });
  });

  describe('isInExperiment', () => {
    it('checks experiment opt in', () => {
      sinon
        .stub(expInt, 'getExperimentGroup')
        .callsFake((experimentName, additionalData = {}) => {
          return !!(
            experimentName === 'mockExperiment' && additionalData.isEligible
          );
        });

      assert.isTrue(
        expInt.isInExperiment('mockExperiment', { isEligible: true })
      );
      assert.isFalse(expInt.isInExperiment('mockExperiment'));
      assert.isFalse(expInt.isInExperiment('otherExperiment'));
      assert.isFalse(expInt.isInExperiment());
    });
  });

  describe('isInExperimentGroup', () => {
    it('is true when opted in', () => {
      sinon
        .stub(expInt, 'getExperimentGroup')
        .callsFake((experimentName, additionalData = {}) => {
          const isInExperimentGroup = !!(
            experimentName === 'mockExperiment' && additionalData.isEligible
          );
          return isInExperimentGroup ? 'treatment' : false;
        });

      assert.isTrue(
        expInt.isInExperimentGroup('mockExperiment', 'treatment', {
          isEligible: true,
        })
      );
      assert.isFalse(expInt.isInExperimentGroup('mockExperiment', 'treatment'));
      assert.isFalse(expInt.isInExperimentGroup('otherExperiment', 'control'));
      assert.isFalse(expInt.isInExperimentGroup());
    });
  });

  describe('chooseExperiments', () => {
    beforeEach(() => {
      sinon.spy(expInt, 'createExperiment');
      expInt._startupExperiments = {
        experiment1: function() {
          return mockExperiment;
        },
        experiment2: function() {
          return mockExperiment;
        },
        experiment3: function() {
          return mockExperiment;
        },
      };
    });

    it('does not choose when not initialized', () => {
      sinon.spy(expInt, 'isInExperiment');
      expInt.initialized = false;
      expInt.chooseExperiments();
      assert.isFalse(expInt.isInExperiment.called);
    });

    describe('user is not part of any experiment', () => {
      it('does not create the experiment', () => {
        sinon.stub(expInt, 'getExperimentGroup').callsFake(() => false);

        expInt.chooseExperiments();

        assert.isFalse(expInt.createExperiment.called);
      });
    });

    describe('user is part of at least one experiment', () => {
      it('creates the experiment', () => {
        sinon.stub(expInt, 'getExperimentGroup').callsFake(choiceName => {
          if (choiceName === 'experiment1') {
            return 'treatment';
          } else if (choiceName === 'experiment3') {
            return 'control';
          }
          return false;
        });

        expInt.chooseExperiments();

        assert.equal(expInt.createExperiment.callCount, 2);
        assert.isTrue(
          expInt.createExperiment.calledWith('experiment1', 'treatment')
        );
        assert.isTrue(
          expInt.createExperiment.calledWith('experiment3', 'control')
        );
      });
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      expInt._activeExperiments = {
        experiment1: mockExperiment,
        experiment2: mockExperiment,
        experiment3: mockExperiment,
      };
      sinon.spy(mockExperiment, 'destroy');

      expInt.destroy();
    });

    it('destroys each active experiment', () => {
      assert.equal(mockExperiment.destroy.callCount, 3);
    });
  });
});
