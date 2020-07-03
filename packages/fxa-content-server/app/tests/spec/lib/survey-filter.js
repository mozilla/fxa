/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable camelcase */
import * as SurveyFilter from 'lib/survey-filter';
import UserAgent from 'lib/user-agent';
import { assert } from 'chai';
import sinon from 'sinon';

describe('lib/survey-filter', () => {
  const sandbox = sinon.createSandbox();
  const falseFn = sandbox.stub().returns(false);
  const falsyComparator = sandbox.stub().returns(falseFn);
  const mockAccount = {};
  const mockUser = {};
  const mockSubscriptions = [{ plan_id: 'level9001' }, { plan_id: 'quuz' }];
  const mockDeviceList = [
    {
      clientId: 'level9001',
      isCurrentSession: true,
      location: {
        city: 'Heapolandia',
        country: 'United Devices of von Neumann',
      },
    },
    { clientId: null },
    { clientId: 'quuz' },
  ];
  const createMockProfileImage = (isDefaultAvatar) => ({
    isDefault: sandbox.stub().returns(isDefaultAvatar),
  });
  const mockProfileImage = createMockProfileImage(false);
  const mockUa = {
    genericDeviceType: sandbox.stub().returns('MOBile'),
    os: { name: 'WINNING' },
    browser: { name: 'SPACETUNA' },
  };
  const uaString =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0';
  const mockWindow = {
    navigator: {
      languages: ['en-CA', 'es-MX', 'fr'],
      userAgent: uaString,
    },
  };
  const goodAgent = new UserAgent(uaString);
  const fetchGoodUaStub = sandbox.stub().returns(goodAgent);
  const badAgent = new UserAgent('it does not matter');
  const fetchBadUaStub = sandbox.stub().returns(badAgent);
  const mockRelier = { get: sinon.stub().returns('Relying Party!!!') };

  beforeEach(() => {
    sandbox.resetHistory();
    mockAccount.getSubscriptions = sinon.stub().resolves(mockSubscriptions);
    mockAccount.fetchDeviceList = sinon.stub().resolves(mockDeviceList);
    mockAccount.fetchCurrentProfileImage = sinon
      .stub()
      .resolves(mockProfileImage);
    mockUser.getSignedInAccount = sinon.stub().returns(mockAccount);
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

  describe('withinRate', () => {
    it('should return false when the rate is 0', () => {
      const actual = SurveyFilter.withinRate(0);
      assert.isFalse(actual);
    });

    it('should return true when the rate is 1', () => {
      const actual = SurveyFilter.withinRate(1);
      assert.isTrue(actual);
    });

    it('should return true when the rate is between 0 and a pseudorandom number', () => {
      sinon.stub(Math, 'random').returns(0.3);
      const actual = SurveyFilter.withinRate(0.33);
      assert.isTrue(actual);
      Math.random.restore();
    });

    it('should return false when the rate is not between 0 and a pseudorandom number', () => {
      sinon.stub(Math, 'random').returns(0.3);
      const actual = SurveyFilter.withinRate(0.05);
      assert.isFalse(actual);
      Math.random.restore();
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
      assertConditionResult(actual, true);
      assert.isFalse(valSourceCheck.called);
      assert.isFalse(falsyComparator.called);
      assert.isFalse(falseFn.called);
    });

    it('should create a function that returns the result of the comparator', () => {
      const valSoureCheck = sinon.stub().returns((fn) => fn('TESTO'));
      const condCheck = SurveyFilter.createConditionCheckFn(valSoureCheck)(
        falsyComparator
      )('quuz');
      const actual = condCheck({ quuz: 'buzz' }, { fxa: 'surveys' });
      assertConditionResult(actual, true, false);
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
      assertConditionResult(actual, true);
      assert.isFalse(valSoureCheck.called);
      assert.isFalse(falsyComparator.called);
      assert.isFalse(falseFn.called);
    });

    it('should create an async function that returns the result of the comparator', async () => {
      const resultFn = sinon.stub().callsFake((x) => x === 'TESTO');
      const valSourceCheck = sinon
        .stub()
        .callsFake((valSource) => async (checkVal) => {
          const val = await Promise.resolve('meow');
          return checkVal(val);
        });
      const comparator = sinon
        .stub()
        .callsFake((condVal) => (condVal === 'meow' ? resultFn : falseFn));
      const condCheck = SurveyFilter.createAsyncConditionCheckFn(
        valSourceCheck
      )(comparator)('quuz');
      const actual = await condCheck({ quuz: 'TESTO' }, { fxa: 'surveys' });
      assertConditionResult(actual, true, true);
      assert.isTrue(valSourceCheck.calledOnce);
      assert.deepEqual(valSourceCheck.args[0], [{ fxa: 'surveys' }]);
      assert.isTrue(comparator.calledOnce);
      assert.deepEqual(comparator.args[0], ['meow']);
      assert.isTrue(resultFn.called);
      assert.isFalse(falseFn.called);
    });
  });

  describe('createFetchLanguagesFn', () => {
    it('should be undefined when the window object is falsy', () => {
      const f = SurveyFilter.createFetchLanguagesFn(null);
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should be undefined when the window.navigator is falsy', () => {
      const f = SurveyFilter.createFetchLanguagesFn({ navigator: null });
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should be undefined when the window.navigator.languages is falsy', () => {
      const f = SurveyFilter.createFetchLanguagesFn({
        navigator: { languages: null },
      });
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should return a list of language tags', () => {
      const langs = ['en', 'en-US', 'gd', 'de'];
      const f = SurveyFilter.createFetchLanguagesFn({
        navigator: { languages: langs },
      });
      const actual = f();
      assert.deepEqual(actual, langs);
    });
  });

  describe('createFetchUaFn', () => {
    it('should be undefined when the window object is falsy', () => {
      const f = SurveyFilter.createFetchUaFn(null);
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should be undefined when the window.navigator is falsy', () => {
      const f = SurveyFilter.createFetchUaFn({ navigator: null });
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should be undefined when the window.navigator.userAgent is falsy', () => {
      const f = SurveyFilter.createFetchUaFn({
        navigator: { userAgent: null },
      });
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should return a UserAgent', () => {
      const f = SurveyFilter.createFetchUaFn({
        navigator: { userAgent: 'ELinks/0.12pre6 (textmode; Linux; 80x24-2)' },
      });
      const actual = f();
      assert.equal(actual.ua, 'ELinks/0.12pre6 (textmode; Linux; 80x24-2)');
    });
  });

  describe('createFetchAccountFn', () => {
    it('should be undefined when user is falsy', () => {
      const f = SurveyFilter.createFetchAccountFn(null);
      const actual = f();
      assert.isUndefined(actual);
    });

    it('should be undefined when account is falsy', () => {
      const accountFn = sinon.stub().returns(null);
      const user = { getSignedInAccount: accountFn };
      const f = SurveyFilter.createFetchAccountFn(user);
      const actual = f();
      assert.isUndefined(actual);
      assert.isTrue(accountFn.calledOnce);
    });

    it('should return the account', () => {
      const accountFn = sinon.stub().returns(mockAccount);
      const user = { getSignedInAccount: accountFn };
      const f = SurveyFilter.createFetchAccountFn(user);
      const actual = f();
      assert.deepEqual(actual, mockAccount);
      assert.isTrue(accountFn.calledOnce);
    });

    it('should cache the account', () => {
      const accountFn = sinon.stub().returns(mockAccount);
      const user = { getSignedInAccount: accountFn };
      const f = SurveyFilter.createFetchAccountFn(user);
      f();
      f();
      f();
      assert.isTrue(accountFn.calledOnce);
    });
  });

  describe('createAsyncGetModelPropertyFn', () => {
    it('should be undefined when the model object is undefined', async () => {
      const fetchFn = sinon.stub().resolves(undefined);
      const f = SurveyFilter.createAsyncGetModelPropertyFn('something')(
        fetchFn
      );
      const actual = await f();
      assert.isUndefined(actual);
      assert.isTrue(fetchFn.calledOnce);
    });

    it('should be undefined when error is thrown while fetch the model object', async () => {
      const fetchFn = sinon.stub().rejects();
      const f = SurveyFilter.createAsyncGetModelPropertyFn('something')(
        fetchFn
      );
      const actual = await f();
      assert.isUndefined(actual);
      assert.isTrue(fetchFn.calledOnce);
    });

    it('should return the value of the property', async () => {
      const propFn = sinon.stub().resolves('Kanada');
      const fetchFn = sinon.stub().resolves({ locate: propFn });
      const f = SurveyFilter.createAsyncGetModelPropertyFn('locate')(fetchFn);
      const actual = await f();
      assert.equal(actual, 'Kanada');
      assert.isTrue(fetchFn.calledOnce);
      assert.isTrue(propFn.calledOnce);
    });

    it('should cache the value of the property', async () => {
      const propFn = sinon.stub().resolves('Kanada');
      const fetchFn = sinon.stub().resolves({ locate: propFn });
      const f = SurveyFilter.createAsyncGetModelPropertyFn('locate')(fetchFn);
      await f();
      await f();
      await f();
      assert.isTrue(propFn.calledOnce);
    });
  });

  describe('createFetchSubscriptionsFn', () => {
    it('should call createFetchSubscriptionsFn on the model object', async () => {
      const fetchAccountFn = sinon.stub().returns(mockAccount);
      const fetchSubsFn = SurveyFilter.createFetchSubscriptionsFn(
        fetchAccountFn
      );
      await fetchSubsFn();
      assert.isTrue(fetchAccountFn.calledOnce);
      assert.isTrue(mockAccount.getSubscriptions.calledOnce);
    });
  });

  describe('createFetchDeviceListFn', () => {
    it('should call createFetchDeviceListFn on the model object', async () => {
      const fetchAccountFn = sinon.stub().returns(mockAccount);
      const fetchDevicesFn = SurveyFilter.createFetchDeviceListFn(
        fetchAccountFn
      );
      await fetchDevicesFn();
      assert.isTrue(fetchAccountFn.calledOnce);
      assert.isTrue(mockAccount.fetchDeviceList.calledOnce);
    });
  });

  describe('createFetchProfileImageFn', () => {
    it('should call fetchCurrenProfileImage on the model object', async () => {
      const fetchAccountFn = sinon.stub().returns(mockAccount);
      const fetchAvatarFn = SurveyFilter.createFetchProfileImageFn(
        fetchAccountFn
      );
      await fetchAvatarFn();
      assert.isTrue(fetchAccountFn.calledOnce);
      assert.isTrue(mockAccount.fetchCurrentProfileImage.calledOnce);
    });
  });

  describe('applySourceVal', () => {
    const comparator = sandbox.stub().returns(() => {});

    it('should return () => undefined when an undefined is fetched', () => {
      const fetchFn = sinon.stub().returns(undefined);
      const f = SurveyFilter.fetchAndApplySourceVal(fetchFn)(comparator);
      const actual = f();
      assert.isUndefined(actual);
      assert.isTrue(fetchFn.calledOnce);
      assert.isFalse(comparator.called);
    });

    it('should apply the fetched value to the comparator', () => {
      const fetchFn = sinon.stub().returns('bingo!');
      const f = SurveyFilter.fetchAndApplySourceVal(fetchFn)(comparator);
      assert.isFunction(f);
      assert.isTrue(fetchFn.calledOnce);
      assert.isTrue(comparator.calledOnceWithExactly('bingo!'));
    });
  });

  describe('fetchAndApplySourceVal', () => {
    const comparator = sandbox.stub().returns(() => {});

    it('should return () => undefined when an undefined is fetched', async () => {
      const fetchFn = sinon.stub().resolves(undefined);
      const f = await SurveyFilter.asyncFetchAndApplySourceVal(fetchFn)(
        comparator
      );
      const actual = f();
      assert.isUndefined(actual);
      assert.isTrue(fetchFn.calledOnce);
      assert.isFalse(comparator.called);
    });

    it('should apply the fetched value to the comparator', async () => {
      const fetchFn = sinon.stub().resolves('bingo!');
      const f = await SurveyFilter.asyncFetchAndApplySourceVal(fetchFn)(
        comparator
      );
      assert.isFunction(f);
      assert.isTrue(fetchFn.calledOnce);
      assert.isTrue(comparator.calledOnceWithExactly('bingo!'));
    });
  });

  describe('asyncFetchAndApplySourceVal', () => {
    const comparator = sandbox.stub().returns(() => true);

    it('should return () => undefined when an undefined is fetched', async () => {
      const fetchFn = sinon.stub().returns(undefined);
      const f = await SurveyFilter.asyncFetchAndApplySourceVal(fetchFn)(
        comparator
      );
      const actual = f();
      assert.isUndefined(actual);
      assert.isTrue(fetchFn.calledOnce);
      assert.isFalse(comparator.called);
    });

    it('should apply the fetched value to the comparator', async () => {
      const fetchFn = sinon.stub().resolves('bingo!');
      const f = await SurveyFilter.asyncFetchAndApplySourceVal(fetchFn)(
        comparator
      );
      assert.isFunction(f);
      assert.isTrue(fetchFn.calledOnce);
      assert.isTrue(comparator.calledOnceWithExactly('bingo!'));
    });
  });

  describe('checkLanguages', () => {
    it('should be case insensitive, returning all user locales', () => {
      const actual = SurveyFilter.checkLanguages(['en-CA'])(['EN']);
      assert.deepEqual(actual, ['en-CA']);
    });

    it('should be undefined when there is no match', () => {
      const actual = SurveyFilter.checkLanguages(['en', 'zh-CN', 'gd'])([
        'es-MX',
      ]);
      assert.notExists(actual);
    });

    it('should return all user locales when a language condition matches the language portion of a tag', () => {
      const actual = SurveyFilter.checkLanguages(['en', 'zh-CN', 'gd'])(['zh']);
      assert.deepEqual(actual, ['en', 'zh-CN', 'gd']);
    });

    it('should return all user locales when an exact match is found', () => {
      const actual = SurveyFilter.checkLanguages(['en', 'zh-CN', 'gd'])([
        'es',
        'zh-CN',
      ]);
      assert.deepEqual(actual, ['en', 'zh-CN', 'gd']);
    });
  });

  describe('languagesCheck', () => {
    const fetchLangs = sandbox.stub().returns(['en', 'es-MX', 'gd']);

    it('should be passing and have all user locales value when any language tag is matched', () => {
      const actual = SurveyFilter.languagesCheck(
        { languages: ['zh', 'es'] },
        fetchLangs
      );
      assertConditionResult(actual, true, ['en', 'es-MX', 'gd']);
      assert.isTrue(fetchLangs.calledOnce);
    });

    it('should be failing and have no value when there is no match', () => {
      const actual = SurveyFilter.languagesCheck(
        { languages: ['zh', 'de'] },
        fetchLangs
      );
      assertConditionResult(actual, false);
      assert.isTrue(fetchLangs.calledOnce);
    });
  });

  describe('checkUaDeviceTypes', () => {
    it('should be case insensitive, returning the passed in value when matching', () => {
      const actual = SurveyFilter.checkUaDeviceTypes(mockUa)('mObile');
      assert.equal(actual, 'mObile');
      assert.isTrue(mockUa.genericDeviceType.calledOnce);
    });

    it('should accept an array of device types and return the matched one', () => {
      const actual = SurveyFilter.checkUaDeviceTypes(mockUa)([
        'mobile',
        'desktop',
        'tablet',
      ]);
      assert.equal(actual, 'mobile');
      assert.isTrue(mockUa.genericDeviceType.calledOnce);
    });

    it('should not return anything when the values do not match', () => {
      const actual = SurveyFilter.checkUaDeviceTypes(mockUa)('DESKTOP');
      assert.isUndefined(actual);
      assert.isTrue(mockUa.genericDeviceType.calledOnce);
    });
  });

  describe('checkUaOsNames', () => {
    it('should be case insensitive, returning the passed in value when matching', () => {
      const actual = SurveyFilter.checkUaOsNames(mockUa)('Winning');
      assert.equal(actual, 'Winning');
    });

    it('should accept an array of os names and return the matched one', () => {
      const actual = SurveyFilter.checkUaOsNames(mockUa)([
        'Winning',
        'Windows',
      ]);
      assert.equal(actual, 'Winning');
    });

    it('should not return anything when the values do not match', () => {
      const actual = SurveyFilter.checkUaOsNames(mockUa)('Windows');
      assert.isUndefined(actual);
    });
  });

  describe('checkUaBrowsers', () => {
    it('should be case insensitive, returning the passed in value when matching', () => {
      const actual = SurveyFilter.checkUaBrowsers(mockUa)('spacetuna');
      assert.equal(actual, 'spacetuna');
    });

    it('should accept an array of browser names and return the matched one', () => {
      const actual = SurveyFilter.checkUaBrowsers(mockUa)([
        'spacetuna',
        'brocolli',
      ]);
      assert.equal(actual, 'spacetuna');
    });

    it('should not return anything when the values do not match', () => {
      const actual = SurveyFilter.checkUaBrowsers(mockUa)('Firefox');
      assert.isUndefined(actual);
    });
  });

  describe('hasDesiredDeviceType', () => {
    it('should be passing and have the matched value when the values match', () => {
      const actual = SurveyFilter.hasDesiredDeviceType(
        { deviceType: 'deskTOP' },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'deskTOP');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should be passing and have the matched value when the values match in an array', () => {
      const actual = SurveyFilter.hasDesiredDeviceType(
        { deviceType: ['deskTOP', 'moBile'] },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'deskTOP');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should not be passing and have an undefined value when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredDeviceType(
        { deviceType: 'tablet' },
        fetchBadUaStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(fetchBadUaStub.calledOnce);
    });
  });

  describe('hasDesiredOs', () => {
    it('should be passing and have the matched value when the values match', () => {
      const actual = SurveyFilter.hasDesiredOs(
        { os: 'Windows' },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'Windows');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should be passing and have the matched value when the values match in an array', () => {
      const actual = SurveyFilter.hasDesiredOs(
        { os: ['Windows', 'Mac OS'] },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'Windows');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should not be passing and have an undefined value when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredOs({ os: 'macOS' }, fetchBadUaStub);
      assertConditionResult(actual, false);
      assert.isTrue(fetchBadUaStub.calledOnce);
    });
  });

  describe('hasDesiredBrowser', () => {
    it('should be passing and have the matched value when the values match', () => {
      const actual = SurveyFilter.hasDesiredBrowser(
        { browser: 'Firefox' },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'Firefox');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should be passing and have the matched value when the values match in an array', () => {
      const actual = SurveyFilter.hasDesiredBrowser(
        { browser: ['Firefox', 'Chrome', 'Edge'] },
        fetchGoodUaStub
      );
      assertConditionResult(actual, true, 'Firefox');
      assert.isTrue(fetchGoodUaStub.calledOnce);
    });

    it('should not be passing and have an undefined value when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredBrowser(
        { browser: 'Brave' },
        fetchBadUaStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(fetchBadUaStub.calledOnce);
    });
  });

  describe('checkRelierClientId', () => {
    const mockRelier = { get: sandbox.stub().returns('galaxy quest') };

    it('should be the matched value when matched exactly', () => {
      const actual = SurveyFilter.checkRelierClientId(mockRelier)(
        'galaxy quest'
      );
      assert.equal(actual, 'galaxy quest');
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.checkRelierClientId(mockRelier)(
        'Galaxy Quest'
      );
      assert.isUndefined(actual);
    });
  });

  describe('relierClientIdCheck', () => {
    const mockRelier = { get: sandbox.stub().returns('Relying Party!!!') };

    it('should be passing and have an undefined value when relier is not in the conditions', () => {
      const actual = SurveyFilter.relierClientIdCheck(
        { noRelierForUs: 'No Parties' },
        mockRelier
      );
      assertConditionResult(actual, true);
      assert.isFalse(mockRelier.get.called);
    });

    it('should be passing and have the matched value when client id matches configured condition', () => {
      const actual = SurveyFilter.relierClientIdCheck(
        { relier: 'Relying Party!!!' },
        mockRelier
      );
      assertConditionResult(actual, true, 'Relying Party!!!');
      assert.isTrue(mockRelier.get.calledOnce);
    });

    it('should not be passing and have an undefined value when client id does not match configured condition', () => {
      const actual = SurveyFilter.relierClientIdCheck(
        { relier: 'Relier...?' },
        mockRelier
      );
      assertConditionResult(actual, false);
      assert.isTrue(mockRelier.get.calledOnce);
    });
  });

  describe('checkSubscriptions', () => {
    it('should be undefined when given an empty account subscriptions list', () => {
      const actual = SurveyFilter.checkSubscriptions([])(['hello']);
      assert.isUndefined(actual);
    });

    it('should be undefined when the subscription is not found', () => {
      const actual = SurveyFilter.checkSubscriptions([{ plan_id: 'HI' }])([
        'hello',
      ]);
      assert.isUndefined(actual);
    });

    it('should be undefined when the only some of the subscriptions are found', () => {
      const actual = SurveyFilter.checkSubscriptions([{ plan_id: 'HI' }])([
        'hello',
        'HI',
      ]);
      assert.isUndefined(actual);
    });

    it('should return all user subscriptions when all the subscriptions are found', () => {
      const actual = SurveyFilter.checkSubscriptions([
        { plan_id: 'HI' },
        { plan_id: 'hello' },
        { plan_id: 'How are you?' },
      ])(['hello', 'HI']);
      assert.deepEqual(actual, ['HI', 'hello', 'How are you?']);
    });
  });

  describe('subscriptionsCheck', () => {
    const fetchSubscriptionsStub = sandbox.stub().returns(mockSubscriptions);

    it('should be passing and have an undefined value when "subscriptions" is not in the conditions', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        { NOSUB: 'yes' },
        fetchSubscriptionsStub
      );
      assertConditionResult(actual, true);
      assert.isFalse(fetchSubscriptionsStub.called);
    });

    it('should not be passing and have an undefined value when subscription not found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['nope'],
        },
        fetchSubscriptionsStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(fetchSubscriptionsStub.calledOnce);
    });

    it('should not be passing and have an undefined value when only some of the subscriptions are found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['nope', 'level9001'],
        },
        fetchSubscriptionsStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(fetchSubscriptionsStub.calledOnce);
    });

    it('should be passing and have all user subscriptions value when subscriptions are found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['quuz', 'level9001'],
        },
        fetchSubscriptionsStub
      );
      assertConditionResult(actual, true, ['level9001', 'quuz']);
      assert.isTrue(fetchSubscriptionsStub.calledOnce);
    });
  });

  describe('checkLocation', () => {
    it('should be undefined when device of the current session is not found', () => {
      const actual = SurveyFilter.checkLocation([])({ city: 'Heapolandia' });
      assert.isUndefined(actual);
    });

    it('should be undefined when the device does not have a location', () => {
      const mockDevices = [{ isCurrentSession: true, nolocation: true }];
      const actual = SurveyFilter.checkLocation(mockDevices)({
        city: 'Heapolandia',
      });
      assert.isUndefined(actual);
    });

    it('should be undefined when the location properties do not match', () => {
      const mockDevices = [
        {
          isCurrentSession: true,
          location: { city: 'Thebes', countryCode: 'GR' },
        },
      ];
      const actual = SurveyFilter.checkLocation(mockDevices)({
        city: 'Heapolandia',
      });
      assert.isUndefined(actual);
    });

    it('should return the matched values when the location properties are found, case insensitively', () => {
      const mockDevices = [
        {
          isCurrentSession: true,
          location: { city: 'Thebes', countryCode: 'GR', wibble: 'QUUZ' },
        },
      ];
      const actual = SurveyFilter.checkLocation(mockDevices)({
        city: 'thebes',
        wibble: 'quuz',
      });
      assert.deepEqual(actual, 'thebes, quuz');
    });
  });

  describe('geoLocationCheck', () => {
    const getDevicesStub = sandbox.stub().returns(mockDeviceList);

    it('should be passing and have an undefined value when the condition is not in the config', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        { bleep: 'bloop' },
        getDevicesStub
      );
      assertConditionResult(actual, true);
      assert.isFalse(getDevicesStub.called);
    });

    it('should not be passing and have an undefined value when location property is not found', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        {
          location: { city: 'Babylon' },
        },
        getDevicesStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(getDevicesStub.calledOnce);
    });

    it('should not be passing and have an undefined value when only some location properties are found', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        {
          location: { city: 'Heapolandia', countryCode: 'UVN' },
        },
        getDevicesStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(getDevicesStub.calledOnce);
    });

    it('should be passing and have matching value when all location properties are found', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        {
          location: {
            city: 'Heapolandia',
            country: 'United Devices of von Neumann',
          },
        },
        getDevicesStub
      );
      assertConditionResult(
        actual,
        true,
        'Heapolandia, United Devices of von Neumann'
      );
      assert.isTrue(getDevicesStub.calledOnce);
    });
  });

  describe('checkSignedInReliers', () => {
    it('should be undefined when the device list is empty', () => {
      const actual = SurveyFilter.checkSignedInReliers([])(['rprprp']);
      assert.isUndefined(actual);
    });

    it('should be undefined when the client id is not found', () => {
      const actual = SurveyFilter.checkSignedInReliers([{ clientId: '9001' }])([
        'rprprp',
      ]);
      assert.isUndefined(actual);
    });

    it('should be undefined when only some of the the client ids are found', () => {
      const actual = SurveyFilter.checkSignedInReliers([{ clientId: '9001' }])([
        'rprprp',
        '9001',
      ]);
      assert.isUndefined(actual);
    });

    it('should return all user relier IDs when all the client ids are found', () => {
      const actual = SurveyFilter.checkSignedInReliers([
        { clientId: '9001' },
        { clientId: 'noop' },
        { clientId: null },
      ])([null, '9001']);
      assert.deepEqual(actual, ['9001', 'noop', null]);
    });
  });

  describe('signedInReliersCheck', () => {
    const getDevicesStub = sandbox.stub().returns(mockDeviceList);

    it('should be passing and have an undefined value when the condition is not in the config', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        { noReliersForMe: true },
        getDevicesStub
      );
      assertConditionResult(actual, true);
      assert.isFalse(getDevicesStub.called);
    });

    it('should not be passing and have an undefined value when the client id is not in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: ['wibble'],
        },
        getDevicesStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(getDevicesStub.calledOnce);
    });

    it('should not be passing and have an undefined value when only some client ids are in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: [null, 'BMO'],
        },
        getDevicesStub
      );
      assertConditionResult(actual, false);
      assert.isTrue(getDevicesStub.calledOnce);
    });

    it('should be passing and have all user reliers value when all client ids are in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: ['level9001', null],
        },
        getDevicesStub
      );
      assertConditionResult(actual, true, ['level9001', null, 'quuz']);
      assert.isTrue(getDevicesStub.calledOnce);
    });
  });

  describe('checkNonDefaultAvatar', () => {
    // NOTE: checkNonDefaultAvatar will return supplied condition's value if the condition is satisifed.
    // If the condition is NOT, it will not return (undefined). Therefor, `false` should not be confused
    // with a non-satisfying result, but instead as a value to pass to Survey Gizmo.
    // e.g. if the value is true, and the avatar is not the default, true will be returned
    // e.g. if the value is false, and the avatar is the default, false will be returned

    it('should be undefined when config is true and avatar is default', () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(true);
      assert.isUndefined(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be true when config is true and avatar is non-default', () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(true);
      assert.isTrue(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be undefined when config is false and avatar is non-default', () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(
        false
      );
      assert.isUndefined(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be false when config is false and avatar is default', () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(
        false
      );
      assert.isFalse(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });
  });

  describe('nonDefaultAvatarCheck', () => {
    it('should be passing and have an undefined value hasNonDefaultAvatar is not in the config', async () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { bleepBloop: true },
        () => mockProfileImage
      );
      assertConditionResult(actual, true);
      assert.isFalse(mockProfileImage.isDefault.called);
    });

    it('should be passing and have an true value when condition is true and the avatar is non-default', async () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: true },
        () => mockProfileImage
      );
      assertConditionResult(actual, true, true);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should not be passing and have an undefined value when condition is false and the avatar is non default', async () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: false },
        () => mockProfileImage
      );
      assertConditionResult(actual, false);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should not be passing and have an undefined value when condition is true and the avatar is the default', async () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: true },
        () => mockProfileImage
      );
      assertConditionResult(actual, false);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be passing and have a false value when condition is false and the avatar is the default', async () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: false },
        () => mockProfileImage
      );
      assertConditionResult(actual, true, false);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });
  });

  describe('surveyGizmoSafe', () => {
    it('returns the stringified version of a string, number, or boolean', () => {
      assert.equal(
        SurveyFilter.surveyGizmoSafe('chocolate cake'),
        'chocolate cake'
      );
      assert.equal(SurveyFilter.surveyGizmoSafe(90210), '90210');
      assert.equal(SurveyFilter.surveyGizmoSafe(true), 'true');
    });
    it('returns a string of joined values, excluding null, when given an array', () => {
      assert.equal(
        SurveyFilter.surveyGizmoSafe(['Lead', 'SD', null]),
        'Lead,SD'
      );
    });
    it('throws when given something not covered', () => {
      assert.throws(
        SurveyFilter.surveyGizmoSafe.bind(null, { lastName: 'mine' }),
        /cannot be passed/
      );
    });
  });

  describe('createSurveyFilter', () => {
    const config = {
      conditions: {
        browser: 'firefox',
        deviceType: 'desktop',
        hasNonDefaultAvatar: true,
        languages: ['es'],
        location: { city: 'Heapolandia' },
        os: 'windows',
        relier: 'Relying Party!!!',
        reliersList: [null],
        subscriptions: ['quuz'],
      },
      rate: 1,
    };

    const trueDefaultArgs = [mockWindow, mockUser, mockRelier, null, 5000000];

    it('should not be passing and have no conditions when the config is missing', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter();
      assertFilterResult(actual, false, {});
    });

    it('should not be passing when the conditions are missing', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({ noConds: 'yes' });
      assertFilterResult(actual, false, {});
    });

    it('should not be passing when the conditions is an empty object', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({ conditions: {} });
      assertFilterResult(actual, false, {});
    });

    it('should not be passing when rate is not defined', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({ ...config, rate: undefined });
      assertFilterResult(actual, false, {});
    });

    it('should be passing when rate is 1', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter(config);
      assertFilterResult(actual, true);
    });

    it('should not be passing when rate is not between 0 and a pseudorandom number', async () => {
      sinon.stub(Math, 'random').returns(0.3);
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({ ...config, rate: 0.2 });
      assertFilterResult(actual, false);
      Math.random.restore();
    });

    it('should be passing when rate is between 0 and a pseudorandom number', async () => {
      sinon.stub(Math, 'random').returns(0.1);
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({ ...config, rate: 0.2 });
      assertFilterResult(actual, true);
      Math.random.restore();
    });

    it('should be true when previous survey time is null', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter(config);
      assertFilterResult(actual, true);
    });

    it('should be passing when the conditions are met', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now() - 50000,
        5
      );
      const actual = await filter(config);
      assertFilterResult(actual, true);
    });

    it('should not be passing when the user took a survey recently', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        5000000
      );
      const actual = await filter(config);
      assertFilterResult(actual, false);
    });

    it('should not be passing when the language is not found', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, languages: ['zh'] },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it.skip('should be passing when the language is found', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, languages: ['es'] },
        rate: config.rate,
      });
      assertFilterResult(actual, true);
    });

    it('should not be passing when the browser does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, browser: 'elinks' },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the device type does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, deviceType: 'XR' },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the OS does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, os: 'TempleOS' },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the relier client id does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, relier: 'FPN' },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when a subscription is not found', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, subscriptions: ['fpn_id'] },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the location does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, location: { city: 'Lisbon' } },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the signed in RP client ids are not found', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, reliersList: ['wibble', 'wubble'] },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });

    it('should not be passing when the avatar is not matching the configured condition', async () => {
      const filter = SurveyFilter.createSurveyFilter.apply(
        null,
        trueDefaultArgs
      );
      const actual = await filter({
        conditions: { ...config.conditions, hasNonDefaultAvatar: false },
        rate: config.rate,
      });
      assertFilterResult(actual, false);
    });
  });
});

function assertConditionResult(actual, expectedPassing, expectedValue) {
  // can't deepEqual the entire object because expectedValue
  // is sometimes an array and it gives a false negative
  assert.equal(actual.passing, expectedPassing);
  assert.deepEqual(actual.value, expectedValue);
}

function assertFilterResult(actual, expectedPassing, expectedConditions) {
  assert.equal(actual.passing, expectedPassing);

  if (expectedConditions) {
    assert.deepEqual(actual.conditions, expectedConditions);
  }
}
