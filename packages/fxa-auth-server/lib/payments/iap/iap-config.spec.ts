/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { AuthFirestore, AuthLogger, AppConfig } from '../../types';
import { IAPConfig } from './iap-config';

const { mockLog } = require('../../../test/mocks');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
};

describe('IAPConfig', () => {
  let firestore: any;
  let log: any;
  let iapConfig: any;
  let planDbRefMock: any;

  beforeEach(() => {
    planDbRefMock = {};
    const collectionMock = jest.fn();
    collectionMock.mockReturnValue(planDbRefMock);
    firestore = {
      collection: collectionMock,
    };
    log = mockLog();
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    Container.remove(IAPConfig);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  it('can be instantiated', () => {
    const iapConfig = Container.get(IAPConfig);
    expect((iapConfig as any).log).toBe(log);
    expect((iapConfig as any).firestore).toBe(firestore);
    expect((iapConfig as any).prefix).toBe('mock-fxa-iap-');
  });

  describe('plans', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: jest.fn().mockReturnValue({ plans: 'testObject' }),
        }),
      });
      const result = await iapConfig.plans();
      expect(result).toBe('testObject');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });
      await expect(iapConfig.plans('testApp')).rejects.toMatchObject({
        message: 'Unknown app name',
      });
    });
  });

  describe('packageName', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: jest.fn().mockReturnValue({
            packageName: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await iapConfig.packageName('testApp');
      expect(result).toBe('org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });
      await expect(iapConfig.packageName('testApp')).rejects.toMatchObject({
        message: 'Unknown app name',
      });
    });
  });

  describe('getBundleId', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: jest.fn().mockReturnValue({
            bundleId: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await iapConfig.getBundleId('testApp');
      expect(result).toBe('org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });
      await expect(iapConfig.getBundleId('testApp')).rejects.toMatchObject({
        message: 'Unknown app name',
      });
    });
  });
});
