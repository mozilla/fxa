/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import { mockLog } from '../../../../mocks';
import { AuthFirestore, AuthLogger, AppConfig } from '../../../../../lib/types';
import { PlayBilling } from '../../../../../lib/payments/iap/google-play';

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
  let sandbox;
  let firestore;
  let log;
  let purchasesDbRefMock;

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
    assert.strictEqual(playBilling.log, log);
    assert.strictEqual(playBilling.firestore, firestore);
    assert.strictEqual(playBilling.prefix, 'mock-fxa-iap-');
  });
});
