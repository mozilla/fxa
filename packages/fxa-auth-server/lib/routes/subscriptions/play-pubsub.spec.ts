/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { Container } from 'typedi';
const uuid = require('uuid');

const mocks = require('../../../test/mocks');
const { PlayPubsubHandler } = require('./play-pubsub');
const { AuthLogger } = require('../../types');
const { PlayBilling } = require('../../payments/iap/google-play');
const { CapabilityService } = require('../../payments/capability');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

describe('PlayPubsubHandler', () => {
  let sandbox: sinon.SinonSandbox;
  let playPubsubHandlerInstance: any;
  let mockRequest: any;
  let mockPlayBilling: any;
  let mockCapabilityService: any;
  let log: any;
  let db: any;
  let mockDeveloperNotification: any;
  let mockPurchase: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    log = mocks.mockLog();
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
    mockCapabilityService.iapUpdate = sinon.fake.resolves({});

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
      expect(result).toEqual({});
      sinon.assert.calledOnce(playPubsubHandlerInstance.extractMessage);
      sinon.assert.calledOnce(mockPlayBilling.purchaseManager.getPurchase);
      sinon.assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      sinon.assert.calledOnce(mockCapabilityService.iapUpdate);
    });

    it('test notification', async () => {
      mockDeveloperNotification.testNotification = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      sinon.assert.calledOnceWithExactly(
        log.info,
        'play-test-notification',
        mockDeveloperNotification
      );
      sinon.assert.notCalled(mockPlayBilling.purchaseManager.getPurchase);
    });

    it('missing subscription notification', async () => {
      mockDeveloperNotification.subscriptionNotification = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      sinon.assert.calledOnceWithExactly(
        log.info,
        'play-other-notification',
        mockDeveloperNotification
      );
      sinon.assert.notCalled(mockPlayBilling.purchaseManager.getPurchase);
    });

    it('non-existing purchase', async () => {
      mockPlayBilling.purchaseManager.getPurchase = sinon.fake.resolves(null);
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      sinon.assert.calledOnce(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      sinon.assert.notCalled(db.account);
    });

    it('no userId', async () => {
      mockPurchase.userId = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      sinon.assert.notCalled(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      sinon.assert.notCalled(db.account);
    });

    it('replaced purchase', async () => {
      mockPurchase.userId = 'invalid';
      mockPurchase.replacedByAnotherPurchase = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      sinon.assert.notCalled(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      );
      sinon.assert.notCalled(db.account);
    });
  });
});
