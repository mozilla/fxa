/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Mixin from 'views/mixins/experiment-mixin';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';
import WindowMock from '../../../mocks/window';

const View = BaseView.extend({
  template: TestTemplate,
});

Cocktail.mixin(View, Mixin);

describe('views/mixins/experiment-mixin', () => {
  let experiments;
  let metrics;
  let notifier;
  let translator;
  let view;
  let windowMock;

  beforeEach(() => {
    // pass in an experimentsMock otherwise a new
    // ExperimentInterface is created before
    // a spy can be added to `chooseExperiments`
    experiments = {
      chooseExperiments: sinon.spy(),
      getAndReportExperimentGroup: sinon.spy(),
      createExperiment: sinon.spy(() => {
        return {};
      }),
      destroy() {},
      getExperimentGroup: sinon.spy(),
      isInExperiment: sinon.spy(),
      isInExperimentGroup: sinon.spy(),
    };

    metrics = {};

    notifier = {
      trigger: sinon.spy(),
    };

    translator = {};

    windowMock = new WindowMock();

    view = new View({
      experiments,
      metrics,
      notifier,
      translator,
      window: windowMock,
    });
  });

  afterEach(() => {
    return view.destroy();
  });

  describe('_createExperimentInterface', () => {
    const experimentGroupingRules = {};
    const notifier = {};
    const user = {};

    const getAccountAccount = { uid: 'get-account-account' };
    const _accountAccount = { uid: '_account-account' };

    describe('view has `this.getAccount', () => {
      it('creates ExperimentInterface with account returned by this.getAccount', () => {
        view.getAccount = sinon.spy(() => getAccountAccount);
        view._account = _accountAccount;

        const experimentInterface = view._createExperimentInterface({
          experimentGroupingRules,
          notifier,
          user,
        });

        assert.strictEqual(experimentInterface.account, getAccountAccount);
        assert.strictEqual(
          experimentInterface.experimentGroupingRules,
          experimentGroupingRules
        );
        assert.strictEqual(experimentInterface.notifier, notifier);
        assert.strictEqual(experimentInterface.metrics, metrics);
        assert.strictEqual(experimentInterface.translator, translator);
        assert.strictEqual(experimentInterface.user, user);
        assert.strictEqual(experimentInterface.window, windowMock);
      });
    });

    describe('view does not have this.getAccount, has this._account', () => {
      it('creates ExperimentInterface with this._account', () => {
        view._account = _accountAccount;

        const experimentInterface = view._createExperimentInterface({
          experimentGroupingRules,
          notifier,
          user,
        });

        assert.strictEqual(experimentInterface.account, _accountAccount);
        assert.strictEqual(
          experimentInterface.experimentGroupingRules,
          experimentGroupingRules
        );
        assert.strictEqual(experimentInterface.notifier, notifier);
        assert.strictEqual(experimentInterface.metrics, metrics);
        assert.strictEqual(experimentInterface.translator, translator);
        assert.strictEqual(experimentInterface.user, user);
        assert.strictEqual(experimentInterface.window, windowMock);
      });
    });
  });

  describe('initialize', () => {
    it('chooses experiments', () => {
      assert.isTrue(experiments.chooseExperiments.calledOnce);
    });
  });

  describe('destroy', () => {
    it('destroys the experiments instance', () => {
      const experiments = view.experiments;
      sinon.spy(experiments, 'destroy');

      view.destroy();

      assert.isTrue(experiments.destroy.called);
    });
  });

  describe('delegate methods', () => {
    const delegateMethods = [
      'getAndReportExperimentGroup',
      'createExperiment',
      'getExperimentGroup',
      'isInExperiment',
      'isInExperimentGroup',
    ];
    delegateMethods.forEach(methodName => {
      it(`delegates ${methodName} correctly`, () => {
        assert.isFunction(view[methodName]);

        view[methodName]('foo', 'bar', 'baz');
        assert.isTrue(experiments[methodName].calledOnce);
        assert.isTrue(experiments[methodName].calledWith('foo', 'bar', 'baz'));

        view.destroy();
        view[methodName]('foo', 'bar', 'baz');
        // the view is destroyed, can no longer delegate to experiments.
        assert.isTrue(experiments[methodName].calledOnce);
      });
    });
  });
});
