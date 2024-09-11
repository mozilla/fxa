/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import { mockLog } from '../../../../mocks';
import { AuthFirestore, AuthLogger, AppConfig } from '../../../../../lib/types';
import { AppleIAP } from '../../../../../lib/payments/iap/apple-app-store';

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
  let collectionMock;
  let purchasesDbRefMock;
  let sandbox;
  let firestore;
  let log;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = mockLog();
    collectionMock = sinon.stub();
    firestore = {
      collection: collectionMock,
    };
    purchasesDbRefMock = {};
    collectionMock.returns(purchasesDbRefMock);
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    Container.remove(AppleIAP);
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const appleIAP = Container.get(AppleIAP);
    assert.strictEqual(appleIAP.log, log);
    assert.strictEqual(appleIAP.firestore, firestore);
    assert.strictEqual(appleIAP.prefix, 'mock-fxa-iap-');
  });
});
