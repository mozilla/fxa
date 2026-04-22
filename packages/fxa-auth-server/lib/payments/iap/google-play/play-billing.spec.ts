/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { AuthFirestore, AuthLogger, AppConfig } from '../../../types';
import { PlayBilling } from '.';

const { mockLog } = require('../../../../test/mocks');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
  subscriptions: {
    playApiServiceAccount: {
      credentials: {
        clientEmail: 'mock-client-email',
      },
      keyFile: 'mock-private-keyfile',
    },
  },
};

describe('PlayBilling', () => {
  let firestore: any;
  let log: any;
  let purchasesDbRefMock: any;

  beforeEach(() => {
    purchasesDbRefMock = {};
    const collectionMock = jest.fn();
    collectionMock.mockReturnValue(purchasesDbRefMock);
    firestore = {
      collection: collectionMock,
    };
    log = mockLog();
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    Container.remove(PlayBilling);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  it('can be instantiated', () => {
    const playBilling = Container.get(PlayBilling);
    expect((playBilling as any).log).toBe(log);
    expect((playBilling as any).firestore).toBe(firestore);
    expect((playBilling as any).prefix).toBe('mock-fxa-iap-');
  });
});
