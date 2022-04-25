/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');
const mocks = require('../../../mocks');

const {
  PlayPubsubHandler,
} = require('../../../../lib/routes/subscriptions/play-pubsub');

const { default: Container } = require('typedi');
const { mockLog } = require('../../../mocks');
const { AuthLogger } = require('../../../../lib/types');
const { PlayBilling } = require('../../../../lib/payments/iap/google-play');
const { CapabilityService } = require('../../../../lib/payments/capability');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

describe('PlayPubsubHandler', () => {
  let sandbox;
  let playPubsubHandlerInstance;
  let mockRequest;
  let mockPlayBilling;
  let mockCapabilityService;
  let log;
  let db;
  let mockDeveloperNotification;
  let mockPurchase;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    log = mockLog();
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    mockPlayBilling = {};
    mockCapabilityService = {};
    mockRequest = {};
    mockDeveloperNotification = {
      packageName: 'com.mozilla.test',
    };
    mockPurchase = {
      userId: 'test1234',
    };
    mockDeveloperNotification.subscriptionNotification = {
      purchaseToken: 'test',
    };
    db.account = sinon.fake.resolves({ primaryEmail: { email: TEST_EMAIL } });
    mockCapabilityService.playUpdate = sinon.fake.resolves({});

    Container.set(AuthLogger, log);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(CapabilityService, mockCapabilityService);

    playPubsubHandlerInstance = new PlayPubsubHandler(db);
    playPubsubHandlerInstance.extractMessage = sinon.fake.returns(
      mockDeveloperNotification
    );
    mockRequest.payload = {
      message: { data: 'BASE64DATA' },
    };
    mockPlayBilling.purchaseManager = {
      getPurchase: sinon.fake.resolves(mockPurchase),
      processDeveloperNotification: sinon.fake.resolves({}),
    };
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
  });

  describe('rtdn', () => {
    it('notification that requires profile updating', async () => {
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnce(playPubsubHandlerInstance.extractMessage);
      assert.calledOnce(mockPlayBilling.purchaseManager.getPurchase);
      assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.calledOnce(mockCapabilityService.playUpdate);
    });

    it('test notification', async () => {
      mockDeveloperNotification.testNotification = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnceWithExactly(
        log.info,
        'play-test-notification',
        mockDeveloperNotification
      );
      assert.notCalled(mockPlayBilling.purchaseManager.getPurchase);
    });

    it('missing subscription notification', async () => {
      mockDeveloperNotification.subscriptionNotification = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnceWithExactly(
        log.info,
        'play-other-notification',
        mockDeveloperNotification
      );
      assert.notCalled(mockPlayBilling.purchaseManager.getPurchase);
    });

    it('non-existing purchase', async () => {
      mockPlayBilling.purchaseManager.getPurchase = sinon.fake.resolves(null);
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.notCalled(db.account);
    });

    it('no userId', async () => {
      mockPurchase.userId = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.deepEqual(result, {});
      assert.notCalled(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.notCalled(db.account);
    });
  });
});
