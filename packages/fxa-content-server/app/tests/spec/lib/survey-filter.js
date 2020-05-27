/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable camelcase */
import * as SurveyFilter from 'lib/survey-filter';
import { assert } from 'chai';
import sinon from 'sinon';

describe('lib/survey-filter', () => {
  const sandbox = sinon.createSandbox();
  const falseFn = sandbox.stub().returns(false);
  const trueFn = sandbox.stub().returns(true);
  const falsyComparator = sandbox.stub().returns(falseFn);
  // we need to hold references to certain objects but allow their properties
  // to be overwritten as needed
  const mockAccount = {};
  const mockUser = {};
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
      userAgent: uaString,
    },
  };
  const junkWindow = {
    navigator: {
      userAgent: 'it does not matter',
    },
  };
  const mockRelier = { get: sinon.stub().returns('Relying Party!!!') };

  beforeEach(() => {
    sandbox.resetHistory();
    mockAccount.getSubscriptions = sinon
      .stub()
      .resolves([{ plan_id: 'level9001' }, { plan_id: 'quuz' }]);
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
      const valSoureCheck = sinon.stub().returns((fn) => fn('TESTO'));
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
      const condCheck = SurveyFilter.checkConditionInUa(mockWindow)(
        falsyComparator
      );
      const actual = condCheck();
      // Because sinon cannot spy ES modules, the tests are a bit lacking.
      // Also see the TODO in the function under test.
      assert.isFalse(actual);
      assert.isTrue(falsyComparator.calledOnce);
      assert.equal(falsyComparator.args[0][0].ua, uaString);
      assert.isTrue(falseFn.calledOnce);
    });
  });

  describe('checkUaDeviceType', () => {
    it('should be case insensitive', () => {
      const actual = SurveyFilter.checkUaDeviceType(mockUa)('mObile');
      assert.isTrue(actual);
      assert.isTrue(mockUa.genericDeviceType.calledOnce);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.checkUaDeviceType(mockUa)('DESKTOP');
      assert.isFalse(actual);
      assert.isTrue(mockUa.genericDeviceType.calledOnce);
    });
  });

  describe('checkUaOsName', () => {
    it('should be case insensitive', () => {
      const actual = SurveyFilter.checkUaOsName(mockUa)('Winning');
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.checkUaOsName(mockUa)('Windows');
      assert.isFalse(actual);
    });
  });

  describe('checkUaBrowser', () => {
    it('should be case insensitive', () => {
      const actual = SurveyFilter.checkUaBrowser(mockUa)('spacetuna');
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.checkUaBrowser(mockUa)('Firefox');
      assert.isFalse(actual);
    });
  });

  // The following four `describe`s work the way they do because the useragent
  // was already parsed in one of the tests for `checkConditionInUa`
  // IMPORTANT This also means that if you use the grep feature to run them
  // individually they will fail.

  describe('hasDesiredDeviceType', () => {
    it('should be true when the values match', () => {
      const actual = SurveyFilter.hasDesiredDeviceType(
        { deviceType: 'deskTOP' },
        junkWindow
      );
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredDeviceType(
        { deviceType: 'tablet' },
        junkWindow
      );
      assert.isFalse(actual);
    });
  });

  describe('hasDesiredOs', () => {
    it('should be true when the values match', () => {
      const actual = SurveyFilter.hasDesiredOs({ os: 'Windows' }, junkWindow);
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredOs({ os: 'macOS' }, junkWindow);
      assert.isFalse(actual);
    });
  });

  describe('hasDesiredBrowser', () => {
    it('should be true when the values match', () => {
      const actual = SurveyFilter.hasDesiredBrowser(
        { browser: 'Firefox' },
        junkWindow
      );
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const actual = SurveyFilter.hasDesiredBrowser(
        { browser: 'Brave' },
        junkWindow
      );
      assert.isFalse(actual);
    });
  });

  describe('userAgentChecks', () => {
    it('should be true when all three conditions are met', () => {
      const actual = SurveyFilter.userAgentChecks(
        { deviceType: 'desktop', os: 'windows', browser: 'firefox' },
        junkWindow
      );
      assert.isTrue(actual);
    });

    it('should be false when any condition is false', () => {
      [
        { deviceType: 'mobile', os: 'windows', browser: 'firefox' },
        { deviceType: 'desktop', os: 'ios', browser: 'firefox' },
        { deviceType: 'desktop', os: 'windows', browser: 'waterweasel' },
        { deviceType: 'desktop', os: 'mac', browser: 'webkit' },
        { deviceType: 'webos', os: 'windows', browser: 'spacetuna' },
        { deviceType: 'desktop', os: 'beOS', browser: 'navigator' },
      ].forEach((conds) => {
        const actual = SurveyFilter.userAgentChecks(conds, junkWindow);
        assert.isFalse(actual);
      });
    });
  });

  describe('checkRelierClientId', () => {
    it('should be true when both values are null', () => {
      const mockRelier = { get: sinon.stub().returns(null) };
      const actual = SurveyFilter.checkRelierClientId(mockRelier)(null);
      assert.isTrue(actual);
    });

    it('should be true when matched exactly', () => {
      const mockRelier = { get: sinon.stub().returns('galaxy quest') };
      const actual = SurveyFilter.checkRelierClientId(mockRelier)(
        'galaxy quest'
      );
      assert.isTrue(actual);
    });

    it('should be false when the values do not match', () => {
      const mockRelier = { get: sinon.stub().returns('galaxy quest') };
      const actual = SurveyFilter.checkRelierClientId(mockRelier)(
        'Galaxy Quest'
      );
      assert.isFalse(actual);
    });
  });

  describe('relierClientIdCheck', () => {
    it('should be true when client id matches configured condition', () => {
      const mockRelier = { get: sinon.stub().returns('Relying Party!!!') };
      const actual = SurveyFilter.relierClientIdCheck(
        { relier: 'Relying Party!!!' },
        mockRelier
      );
      assert.isTrue(actual);
    });

    it('should be false when client id does not match configured condition', () => {
      const mockRelier = { get: sinon.stub().returns('Relying Party!!!') };
      const actual = SurveyFilter.relierClientIdCheck(
        { relier: 'Relier...?' },
        mockRelier
      );
      assert.isFalse(actual);
    });
  });

  describe('checkAccountSubscriptions', () => {
    it('should be false when there is no user', async () => {
      const actual = (
        await SurveyFilter.checkAccountSubscriptions()(() => {})
      )();
      assert.isFalse(actual);
    });

    it('should be false when the user has no account', async () => {
      mockUser.getSignedInAccount = sinon.stub().returns(null);
      const actual = (
        await SurveyFilter.checkAccountSubscriptions(mockUser)(() => {})
      )();
      assert.isFalse(actual);
      assert.isTrue(mockUser.getSignedInAccount.calledOnce);
    });

    it('should be false when an error is thrown while getting subscriptions', async () => {
      mockAccount.getSubscriptions = sinon.stub().rejects();
      const actual = (
        await SurveyFilter.checkAccountSubscriptions(mockUser)(() => {})
      )();
      assert.isFalse(actual);
      assert.isTrue(mockUser.getSignedInAccount.calledOnce);
      assert.isTrue(mockAccount.getSubscriptions.calledOnce);
    });

    it('should be false when subscriptions are missing', async () => {
      mockAccount.getSubscriptions = sinon.stub().resolves(null);
      const actual = (
        await SurveyFilter.checkAccountSubscriptions(mockUser)(() => {})
      )();
      assert.isFalse(actual);
      // account is cached at this point
      assert.isFalse(mockUser.getSignedInAccount.called);
      assert.isTrue(mockAccount.getSubscriptions.calledOnce);
    });

    it('should return the result of the comparator when there are subscriptions', async () => {
      const actual = (
        await SurveyFilter.checkAccountSubscriptions(mockUser)(falsyComparator)
      )();
      assert.isFalse(actual);
      assert.isTrue(mockAccount.getSubscriptions.calledOnce);
      assert.isTrue(falsyComparator.calledOnce);
      assert.isTrue(falseFn.calledOnce);
    });
  });

  describe('checkSubscriptions', () => {
    it('should be false when given an empty account subscriptions list', () => {
      const actual = SurveyFilter.checkSubscriptions([])(['hello']);
      assert.isFalse(actual);
    });

    it('should be false when the subscription is not found', () => {
      const actual = SurveyFilter.checkSubscriptions([{ plan_id: 'HI' }])([
        'hello',
      ]);
      assert.isFalse(actual);
    });

    it('should be false when the only some of the subscriptions are found', () => {
      const actual = SurveyFilter.checkSubscriptions([{ plan_id: 'HI' }])([
        'hello',
        'HI',
      ]);
      assert.isFalse(actual);
    });

    it('should be true when all the subscriptions are found', () => {
      const actual = SurveyFilter.checkSubscriptions([
        { plan_id: 'HI' },
        { plan_id: 'hello' },
        { plan_id: 'How are you?' },
      ])(['hello', 'HI']);
      assert.isTrue(actual);
    });
  });

  describe('subscriptionsCheck', () => {
    it('should be true when "subscriptions" is not in the conditions', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        { NOSUB: 'yes' },
        mockUser
      );
      assert.isTrue(actual);
      assert.isFalse(mockAccount.getSubscriptions.called);
    });

    it('should be false when subscription not found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['nope'],
        },
        mockUser
      );
      assert.isFalse(actual);
      assert.isFalse(mockAccount.getSubscriptions.called);
    });

    it('should be false when only some of the subscriptions are found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['nope', 'level9001'],
        },
        mockUser
      );
      assert.isFalse(actual);
      assert.isFalse(mockAccount.getSubscriptions.called);
    });

    it('should be true when subscriptions are found', async () => {
      const actual = await SurveyFilter.subscriptionsCheck(
        {
          subscriptions: ['quuz', 'level9001'],
        },
        mockUser
      );
      assert.isTrue(actual);
      assert.isFalse(mockAccount.getSubscriptions.called);
    });
  });

  describe('checkAccountDevices', () => {
    it('should be false when there is no user', async () => {
      const actual = (await SurveyFilter.checkAccountDevices()(() => {}))();
      assert.isFalse(actual);
    });

    it('should be false when an error is thrown while fetching device list', async () => {
      mockAccount.fetchDeviceList = sinon.stub().rejects();
      const actual = (
        await SurveyFilter.checkAccountDevices(mockUser)(() => {})
      )();
      assert.isFalse(actual);
      assert.isFalse(mockUser.getSignedInAccount.called);
      assert.isTrue(mockAccount.fetchDeviceList.calledOnce);
    });

    it('should return the result of the comparator when device list exist', async () => {
      const actual = (
        await SurveyFilter.checkAccountDevices(mockUser)(falsyComparator)
      )();
      assert.isFalse(actual);
      assert.isFalse(mockUser.getSignedInAccount.called);
      assert.isTrue(mockAccount.fetchDeviceList.calledOnce);
      assert.isTrue(falsyComparator.calledOnce);
      assert.isTrue(falseFn.calledOnce);
    });
  });

  describe('checkLocation', () => {
    it('should be false when device of the current session is not found', () => {
      const actual = SurveyFilter.checkLocation([])({ city: 'Heapolandia' });
      assert.isFalse(actual);
    });

    it('should be false when the device does not have a location', () => {
      const mockDevices = [{ isCurrentSession: true, nolocation: true }];
      const actual = SurveyFilter.checkLocation(mockDevices)({
        city: 'Heapolandia',
      });
      assert.isFalse(actual);
    });

    it('should be false when the location properties do not match', () => {
      const mockDevices = [
        {
          isCurrentSession: true,
          location: { city: 'Thebes', countryCode: 'GR' },
        },
      ];
      const actual = SurveyFilter.checkLocation(mockDevices)({
        city: 'Heapolandia',
      });
      assert.isFalse(actual);
    });

    it('should be true when the location properties are found, case insensitively', () => {
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
      assert.isTrue(actual);
    });
  });

  describe('geoLocationCheck', () => {
    it('should be false when location property is not found', async () => {
      const actual = await SurveyFilter.geoLocationCheck({
        location: { city: 'Babylon' },
        mockUser,
      });
      assert.isFalse(actual);
    });

    it('should be false when only some location properties are found', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        {
          location: { city: 'Heapolandia', countryCode: 'UVN' },
        },
        mockUser
      );
      assert.isFalse(actual);
    });

    it('should be true when all location properties are found', async () => {
      const actual = await SurveyFilter.geoLocationCheck(
        {
          location: {
            city: 'Heapolandia',
            country: 'United Devices of von Neumann',
          },
        },
        mockUser
      );
      assert.isTrue(actual);
    });
  });

  describe('checkSignedInReliers', () => {
    it('should be false when the device list is empty', () => {
      const actual = SurveyFilter.checkSignedInReliers([])(['rprprp']);
      assert.isFalse(actual);
    });

    it('should be false when the client id is not found', () => {
      const actual = SurveyFilter.checkSignedInReliers([{ clientId: '9001' }])([
        'rprprp',
      ]);
      assert.isFalse(actual);
    });

    it('should be false when only some of the the client ids are found', () => {
      const actual = SurveyFilter.checkSignedInReliers([{ clientId: '9001' }])([
        'rprprp',
        '9001',
      ]);
      assert.isFalse(actual);
    });

    it('should be true when all the client ids are found', () => {
      const actual = SurveyFilter.checkSignedInReliers([
        { clientId: '9001' },
        { clientId: 'noop' },
        { clientId: null },
      ])([null, '9001']);
      assert.isTrue(actual);
    });
  });

  describe('signedInReliersCheck', () => {
    it('should be true when the condition is not in the config', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        { noReliersForMe: true },
        mockUser
      );
      assert.isTrue(actual);
    });

    it('should be false when the client id is not in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: ['wibble'],
        },
        mockUser
      );
      assert.isFalse(actual);
    });

    it('should be false when only some client ids are in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: [null, 'BMO'],
        },
        mockUser
      );
      assert.isFalse(actual);
    });

    it('should be true when all client ids are in the list', async () => {
      const actual = await SurveyFilter.signedInReliersCheck(
        {
          reliersList: ['level9001', null],
        },
        mockUser
      );
      assert.isTrue(actual);
    });
  });

  describe('checkAccountProfileImage', () => {
    it('should be false when there is no user', async () => {
      const actual = (
        await SurveyFilter.checkAccountProfileImage()(() => {})
      )();
      assert.isFalse(actual);
    });

    it('should be false when an error is thrown while fetching the profile image', async () => {
      mockAccount.fetchCurrentProfileImage = sinon.stub().rejects();
      const actual = (
        await SurveyFilter.checkAccountProfileImage(mockUser)(() => {})
      )();
      assert.isFalse(actual);
      assert.isFalse(mockUser.getSignedInAccount.called);
      assert.isTrue(mockAccount.fetchCurrentProfileImage.calledOnce);
    });

    it('should return the result of the comparator when the profile image exists', async () => {
      const actual = (
        await SurveyFilter.checkAccountProfileImage(mockUser)(falsyComparator)
      )();
      assert.isFalse(actual);
      assert.isFalse(mockUser.getSignedInAccount.called);
      assert.isTrue(mockAccount.fetchCurrentProfileImage.calledOnce);
      assert.isTrue(falsyComparator.calledOnce);
      assert.isTrue(falseFn.calledOnce);
    });
  });

  describe('checkNonDefaultAvatar', () => {
    it('should be false when config is true but avatar is default', () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(true);
      assert.isFalse(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be true when config is true but avatar is non-default', () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(true);
      assert.isTrue(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be false when config is false but avatar is non-default', () => {
      const mockProfileImage = createMockProfileImage(true);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(
        false
      );
      assert.isTrue(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be false when config is false but avatar is default', () => {
      const mockProfileImage = createMockProfileImage(false);
      const actual = SurveyFilter.checkNonDefaultAvatar(mockProfileImage)(
        false
      );
      assert.isFalse(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });
  });

  describe('nonDefaultAvatarCheck', () => {
    it('should be true when hasNonDefaultAvatar is not in the config', async () => {
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { bleepBloop: true },
        mockUser
      );
      assert.isTrue(actual);
      assert.isFalse(mockProfileImage.isDefault.called);
    });

    // Since the profile image is cached we can only test scenarios when it is a non-default here.

    it('should be true when condition is true and the avatar is non-default', async () => {
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: true },
        mockUser
      );
      assert.isTrue(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });

    it('should be false when condition is false and the avatar is non default', async () => {
      const actual = await SurveyFilter.nonDefaultAvatarCheck(
        { hasNonDefaultAvatar: false },
        mockUser
      );
      assert.isFalse(actual);
      assert.isTrue(mockProfileImage.isDefault.calledOnce);
    });
  });

  describe('createSurveyFilter', () => {
    const config = {
      conditions: {
        browser: 'firefox',
        deviceType: 'desktop',
        hasNonDefaultAvatar: true,
        location: { city: 'Heapolandia' },
        os: 'windows',
        relier: 'Relying Party!!!',
        reliersList: [null],
        subscriptions: ['quuz'],
      },
    };

    it('should be false when the config is missing', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        5000000
      );
      const actual = await filter();
      assert.isFalse(actual);
    });

    it('should be false when the conditions are missing', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        5000000
      );
      const actual = await filter({ noConds: 'yes' });
      assert.isFalse(actual);
    });

    it('should be false when the conditions is an empty object', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        5000000
      );
      const actual = await filter({ conditions: {} });
      assert.isFalse(actual);
    });

    it('should be true when previous survey time is null', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        null,
        5000000000
      );
      const actual = await filter(config);
      assert.isTrue(actual);
    });

    it('should be true when the conditions are met', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now() - 50000,
        5
      );
      const actual = await filter(config);
      assert.isTrue(actual);
    });

    it('should be false when the user took a survey recently', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        5000000
      );
      const actual = await filter(config);
      assert.isFalse(actual);
    });

    it('should be false when the browser does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, browser: 'elinks' },
      });
      assert.isFalse(actual);
    });

    it('should be false when the device type does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, deviceType: 'XR' },
      });
      assert.isFalse(actual);
    });

    it('should be false when the OS does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, os: 'TempleOS' },
      });
      assert.isFalse(actual);
    });

    it('should be false when the relier client id does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, relier: 'FPN' },
      });
      assert.isFalse(actual);
    });

    it('should be false when a subscription is not found', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, subscriptions: ['fpn_id'] },
      });
      assert.isFalse(actual);
    });

    it('should be false when the location does not match', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, location: { city: 'Lisbon' } },
      });
      assert.isFalse(actual);
    });

    it('should be false when the signed in RP client ids are not found', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, reliersList: ['wibble', 'wubble'] },
      });
      assert.isFalse(actual);
    });

    it('should be false when the avatar is not matching the configured condition', async () => {
      const filter = SurveyFilter.createSurveyFilter(
        mockWindow,
        mockUser,
        mockRelier,
        Date.now(),
        0
      );
      const actual = await filter({
        conditions: { ...config.conditions, hasNonDefaultAvatar: false },
      });
      assert.isFalse(actual);
    });
  });
});
