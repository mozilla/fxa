/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mock AppStoreHelper to avoid PKCS#8 key parsing in AppStoreServerAPI constructor
jest.mock('./app-store-helper', () => ({
  AppStoreHelper: class MockAppStoreHelper {},
}));

import { Container } from 'typedi';

import { AuthFirestore, AuthLogger, AppConfig } from '../../../types';
import { AppleIAP } from '.';

const { mockLog } = require('../../../../test/mocks');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
  subscriptions: {
    appStore: {
      credentials: {
        org_mozilla_ios_FirefoxVPN: {
          issuerId: 'issuer_id',
          serverApiKey: 'key',
          serverApiKeyId: 'key_id',
        },
      },
    },
  },
};

describe('AppleIAP', () => {
  let collectionMock: jest.Mock;
  let purchasesDbRefMock: any;
  let firestore: any;
  let log: any;

  beforeEach(() => {
    log = mockLog();
    collectionMock = jest.fn();
    firestore = {
      collection: collectionMock,
    };
    purchasesDbRefMock = {};
    collectionMock.mockReturnValue(purchasesDbRefMock);
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    Container.remove(AppleIAP);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  it('can be instantiated', () => {
    const appleIAP = Container.get(AppleIAP);
    expect((appleIAP as any).log).toBe(log);
    expect((appleIAP as any).firestore).toBe(firestore);
    expect((appleIAP as any).prefix).toBe('mock-fxa-iap-');
  });
});
