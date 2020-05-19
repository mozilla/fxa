/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SurveyFilter from 'lib/survey-filter';
import { assert } from 'chai';
import sinon from 'sinon';

describe('lib/survey-filter', () => {
  const sandbox = sinon.createSandbox();
  const falseFn = sandbox.stub().returns(false);
  const trueFn = sandbox.stub().returns(true);
  const falsyComparator = sandbox.stub().returns(falseFn);

  beforeEach(() => {
    sandbox.resetHistory();
  });

  describe('participatedRecently', () => {
    it('should return true if the time passed is greater than configured duration', () => {
      const acutal = SurveyFilter.participatedRecently(
        Date.now() - 5000000000,
        5000005555
      );
      assert.isTrue(acutal);
    });

    it('should return false if the time passed is less than configured duration', () => {
      const acutal = SurveyFilter.participatedRecently(
        Date.now() - 5000000000,
        5000999000
      );
      assert.isTrue(acutal);
    });
  });

  describe('getConditionWithKey', () => {
    it('should return NONE if the condition is not in the config', () => {
      const actual = SurveyFilter.getConditionWithKey(
        { fizz: 'buzz' },
        'wibble'
      );
      assert.equal(actual, SurveyFilter.NONE);
      assert.isFalse(falseFn.called);
    });

    it('should return the configured condition value', () => {
      const actual = SurveyFilter.getConditionWithKey({ fizz: 'buzz' }, 'fizz');
      assert.equal(actual, 'buzz');
    });
  });

  describe('createConditionCheckFn', () => {
    it('should create a function that returns true if the condition is not in the config', () => {
      const valSourceCheck = sinon.stub();
      const condCheck = SurveyFilter.createConditionCheckFn(valSourceCheck)(
        falsyComparator
      )('quuz');
      const actual = condCheck({ fizz: 'buzz' }, {});
      assert.isTrue(actual);
      assert.isFalse(valSourceCheck.called);
      assert.isFalse(falsyComparator.called);
      assert.isFalse(falseFn.called);
    });

    it('should create a function that returns the result of the comparator', () => {
      const valSoureCheck = sinon.stub().returns(fn => fn('TESTO'));
      const condCheck = SurveyFilter.createConditionCheckFn(valSoureCheck)(
        falsyComparator
      )('quuz');
      const actual = condCheck({ quuz: 'buzz' }, { fxa: 'surveys' });
      assert.isFalse(actual);
      assert.isTrue(valSoureCheck.calledOnce);
      assert.deepEqual(valSoureCheck.args[0], [{ fxa: 'surveys' }]);
      assert.isTrue(falsyComparator.calledOnce);
      assert.deepEqual(falsyComparator.args[0], ['TESTO']);
      assert.isTrue(falseFn.calledOnce);
      assert.deepEqual(falseFn.args[0], ['buzz']);
    });
  });

  describe('createAsyncConditionCheckFn', () => {
    it('should create an async function that returns true if the condition is not in the config', async () => {
      const valSoureCheck = sinon.stub().resolves('the future');
      const condCheck = SurveyFilter.createAsyncConditionCheckFn(valSoureCheck)(
        falsyComparator
      )('quuz');
      const actual = await condCheck({ fizz: 'buzz' }, {});
      assert.isTrue(actual);
      assert.isFalse(valSoureCheck.called);
      assert.isFalse(falsyComparator.called);
      assert.isFalse(falseFn.called);
    });

    it('should create an async function that returns the result of the comparator', async () => {
      const resultFn = sinon.stub().callsFake(x => x === 'TESTO');
      const valSourceCheck = sinon
        .stub()
        .callsFake(valSource => async checkVal => {
          const val = await Promise.resolve('meow');
          return checkVal(val);
        });
      const comparator = sinon
        .stub()
        .callsFake(condVal => (condVal === 'meow' ? resultFn : falseFn));
      const condCheck = SurveyFilter.createAsyncConditionCheckFn(
        valSourceCheck
      )(comparator)('quuz');
      const actual = await condCheck({ quuz: 'TESTO' }, { fxa: 'surveys' });
      assert.isTrue(actual);
      assert.isTrue(valSourceCheck.calledOnce);
      assert.deepEqual(valSourceCheck.args[0], [{ fxa: 'surveys' }]);
      assert.isTrue(comparator.calledOnce);
      assert.deepEqual(comparator.args[0], ['meow']);
      assert.isTrue(resultFn.called);
      assert.isFalse(falseFn.called);
    });
  });

  describe('checkConditionInUa', () => {
    it('should return a () => false when the window object is not passed', () => {
      const actual = SurveyFilter.checkConditionInUa()(trueFn)();
      assert.isFalse(actual);
    });

    it('should return a () => false when the window.navigator is not defined', () => {
      const actual = SurveyFilter.checkConditionInUa({})(trueFn)();
      assert.isFalse(actual);
    });

    it('should return a () => false when the window.navigator.userAgent is not defined', () => {
      const actual = SurveyFilter.checkConditionInUa({ navigator: {} })(
        trueFn
      )();
      assert.isFalse(actual);
    });

    it('should parse the useragent string and call the comparator with the result', () => {
      const uaString =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0';
      const condCheck = SurveyFilter.checkConditionInUa({
        navigator: {
          userAgent: uaString,
        },
      })(falsyComparator);
      const actual = condCheck();
      // Because sinon cannot spy ES modules, the tests are a bit lacking.
      // Also see the TODO in the function under test.
      assert.isFalse(actual);
      assert.isTrue(falsyComparator.calledOnce);
      assert.equal(falsyComparator.args[0][0].ua, uaString);
      assert.isTrue(falseFn.calledOnce);
    });
  });
});
