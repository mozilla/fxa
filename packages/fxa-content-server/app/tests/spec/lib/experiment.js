/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Able = require('lib/able');
  const { assert } = require('chai');
  const ExperimentInterface = require('lib/experiment');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const User = require('models/user');
  const WindowMock = require('../../mocks/window');

  let able;
  let expInt;
  let expOptions;
  let metrics;
  let notifier;
  let user;
  let windowMock;

  const UUID = 'a mock uuid';
  const mockExperiment = {
    initialize () {
      return true;
    },
    isInGroup () {
      return true;
    }
  };

  describe('lib/experiment', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.navigator.userAgent = 'mocha';
      able = new Able();
      user = new User({
        uniqueUserId: UUID
      });

      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      expOptions = {
        able: able,
        metrics: metrics,
        notifier: notifier,
        user: user,
        window: windowMock
      };
      expInt = new ExperimentInterface(expOptions);
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
        sinon.stub(expInt, 'isInExperiment', (experimentName) => {
          return experimentName === 'mockExperiment';
        });

        assert.isTrue(expInt.isInExperiment('mockExperiment'));
        assert.isFalse(expInt.isInExperiment('otherExperiment'));
        assert.isFalse(expInt.isInExperiment());
      });
    });

    describe('isInExperimentGroup', function () {
      it('is true when opted in', function () {
        sinon.stub(expInt, 'isInExperiment', (experimentName) => {
          return experimentName === 'mockExperiment';
        });
        expInt._activeExperiments = {
          'mockExperiment': mockExperiment
        };

        assert.isTrue(expInt.isInExperimentGroup('mockExperiment'));
        assert.isFalse(expInt.isInExperimentGroup('otherExperiment'));
        assert.isFalse(expInt.isInExperimentGroup());
      });
    });

    describe('chooseExperiments', function () {
      beforeEach(() => {
        sinon.spy(expInt, 'createExperiment');
        expInt._allExperiments = {
          experiment1: function () {
            return mockExperiment;
          },
          experiment2: function () {
            return mockExperiment;
          },
          experiment3: function () {
            return mockExperiment;
          }
        };
      });

      it('does not choose when not initialized', function () {
        sinon.spy(expInt, 'isInExperiment');
        expInt.initialized = false;
        expInt.chooseExperiments();
        assert.isFalse(expInt.isInExperiment.called);
      });

      describe('user is not part of any experiment', () => {
        it('does not create the experiment', () => {
          sinon.stub(expInt, 'isInExperiment', () => false);

          expInt.chooseExperiments();

          assert.isTrue(expInt.isInExperiment.calledWith('experiment1'));
          assert.isFalse(expInt.createExperiment.calledWith('experiment1'));
          assert.isFalse(expInt.isInExperiment('experiment1'));

          assert.isTrue(expInt.isInExperiment.calledWith('experiment2'));
          assert.isFalse(expInt.createExperiment.calledWith('experiment2'));
          assert.isFalse(expInt.isInExperiment('experiment2'));

          assert.isTrue(expInt.isInExperiment.calledWith('experiment3'));
          assert.isFalse(expInt.createExperiment.calledWith('experiment3'));
          assert.isFalse(expInt.isInExperiment('experiment3'));
        });
      });

      describe('user is part of at least one experiment', () => {
        it('creates the experiment', () => {
          sinon.stub(expInt, 'isInExperiment', (choiceName) => {
            if (choiceName === 'experiment1') {
              return true;
            } else if (choiceName === 'experiment3') {
              return true;
            }
            return false;
          });

          expInt.chooseExperiments();

          assert.isTrue(expInt.isInExperiment('experiment1'));
          assert.isFalse(expInt.isInExperiment('experiment2'));
          assert.isTrue(expInt.isInExperiment('experiment3'));
        });
      });
    });
  });
});
