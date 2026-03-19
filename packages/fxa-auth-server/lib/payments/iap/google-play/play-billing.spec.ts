/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/iap/google-play/play-billing.js (Mocha → Jest). */

import sinon from 'sinon';
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
  let sandbox: sinon.SinonSandbox;
  let firestore: any;
  let log: any;
  let purchasesDbRefMock: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    purchasesDbRefMock = {};
    const collectionMock = sinon.stub();
    collectionMock.returns(purchasesDbRefMock);
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
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const playBilling = Container.get(PlayBilling);
    expect((playBilling as any).log).toBe(log);
    expect((playBilling as any).firestore).toBe(firestore);
    expect((playBilling as any).prefix).toBe('mock-fxa-iap-');
  });
});
