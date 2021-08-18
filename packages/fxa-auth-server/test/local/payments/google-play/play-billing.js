/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');

const { mockLog } = require('../../../mocks');
const {
  AuthFirestore,
  AuthLogger,
  AppConfig,
} = require('../../../../lib/types');
const { PlayBilling } = require('../../../../lib/payments/google-play');

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
  let playBilling;
  let planDbRefMock;
  let purchasesDbRefMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    planDbRefMock = {};
    purchasesDbRefMock = {};
    const collectionMock = sinon.stub();
    collectionMock.onFirstCall().returns(planDbRefMock);
    collectionMock.onSecondCall().returns(purchasesDbRefMock);
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
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const playBilling = Container.get(PlayBilling);
    assert.strictEqual(playBilling.log, log);
    assert.strictEqual(playBilling.firestore, firestore);
    assert.strictEqual(playBilling.prefix, 'mock-fxa-iap-');
  });

  describe('plans', () => {
    beforeEach(() => {
      // Create and set a new one per test
      playBilling = new PlayBilling();
      Container.set(PlayBilling, playBilling);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({ plans: 'testObject' }),
        }),
      });
      const result = await playBilling.plans();
      assert.strictEqual(result, 'testObject');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await playBilling.plans('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'IAP Plans document does not exist for testApp'
        );
      }
    });
  });

  describe('packageName', () => {
    beforeEach(() => {
      // Create and set a new one per test
      playBilling = new PlayBilling();
      Container.set(PlayBilling, playBilling);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({
            packageName: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await playBilling.packageName('testApp');
      assert.strictEqual(result, 'org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await playBilling.packageName('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'IAP Plans document does not exist for testApp'
        );
      }
    });
  });
});
