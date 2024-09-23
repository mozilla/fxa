/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import { mockLog } from '../../../mocks';
import { AuthFirestore, AuthLogger, AppConfig } from '../../../../lib/types';
import { IAPConfig } from '../../../../lib/payments/iap/iap-config';

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
};

describe('IAPConfig', () => {
  let sandbox;
  let firestore;
  let log;
  let iapConfig;
  let planDbRefMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    planDbRefMock = {};
    const collectionMock = sinon.stub();
    collectionMock.returns(planDbRefMock);
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
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const iapConfig = Container.get(IAPConfig);
    assert.strictEqual(iapConfig.log, log);
    assert.strictEqual(iapConfig.firestore, firestore);
    assert.strictEqual(iapConfig.prefix, 'mock-fxa-iap-');
  });

  describe('plans', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({ plans: 'testObject' }),
        }),
      });
      const result = await iapConfig.plans();
      assert.strictEqual(result, 'testObject');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.plans('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(err.message, 'Unknown app name');
      }
    });
  });

  describe('packageName', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
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
      const result = await iapConfig.packageName('testApp');
      assert.strictEqual(result, 'org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.packageName('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(err.message, 'Unknown app name');
      }
    });
  });

  describe('getBundleId', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({
            bundleId: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await iapConfig.getBundleId('testApp');
      assert.strictEqual(result, 'org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.getBundleId('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(err.message, 'Unknown app name');
      }
    });
  });
});
