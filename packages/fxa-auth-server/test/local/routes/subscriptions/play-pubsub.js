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
const { AuthLogger, ProfileClient } = require('../../../../lib/types');
const { PlayBilling } = require('../../../../lib/payments/google-play');
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
  let profile;
  let log;
  let db;
  let mockDeveloperNotification;
  let mockPurchase;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    log = mockLog();
    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async (uid) => ({})),
    });

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
    const mockSubCalls = sinon.stub();
    mockSubCalls.onFirstCall().resolves(['prod_1234']);
    mockSubCalls.onSecondCall().resolves(['prod_2345']);
    mockCapabilityService.subscribedProductIds = mockSubCalls;
    mockCapabilityService.processProductDiff = sinon.fake.resolves({});

    Container.set(AuthLogger, log);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(CapabilityService, mockCapabilityService);
    Container.set(ProfileClient, profile);

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
    sandbox.restore();
  });

  describe('rtdn', () => {
    it('notification that requires profile updating', async () => {
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.isUndefined(result);
      assert.calledOnce(playPubsubHandlerInstance.extractMessage);
      assert.calledOnce(mockPlayBilling.purchaseManager.getPurchase);
      assert.calledOnce(db.account);
      assert.calledTwice(mockCapabilityService.subscribedProductIds);
      assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.calledOnce(profile.deleteCache);
      assert.calledOnce(mockCapabilityService.processProductDiff);
    });

    it('notification that does not require profile udpates', async () => {
      mockCapabilityService.subscribedProductIds = sinon.fake.resolves([
        'prod_1234',
      ]);
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.isUndefined(result);
      assert.calledOnce(playPubsubHandlerInstance.extractMessage);
      assert.calledOnce(mockPlayBilling.purchaseManager.getPurchase);
      assert.calledOnce(db.account);
      assert.calledTwice(mockCapabilityService.subscribedProductIds);
      assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.notCalled(profile.deleteCache);
      assert.notCalled(mockCapabilityService.processProductDiff);
    });

    it('test notification', async () => {
      mockDeveloperNotification.testNotification = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.isUndefined(result);
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
      assert.isUndefined(result);
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
      assert.isUndefined(result);
      assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.notCalled(db.account);
    });

    it('no userId', async () => {
      mockPurchase.userId = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      assert.isUndefined(result);
      assert.notCalled(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      assert.notCalled(db.account);
    });
  });
});
