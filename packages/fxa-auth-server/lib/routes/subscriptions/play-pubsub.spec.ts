/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  let playPubsubHandlerInstance: any;
  let mockRequest: any;
  let mockPlayBilling: any;
  let mockCapabilityService: any;
  let log: any;
  let db: any;
  let mockDeveloperNotification: any;
  let mockPurchase: any;

  beforeEach(() => {
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
    db.account = jest
      .fn()
      .mockResolvedValue({ primaryEmail: { email: TEST_EMAIL } });
    mockCapabilityService.iapUpdate = jest.fn().mockResolvedValue({});

    Container.set(AuthLogger, log);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(CapabilityService, mockCapabilityService);

    playPubsubHandlerInstance = new PlayPubsubHandler(db);
    playPubsubHandlerInstance.extractMessage = jest
      .fn()
      .mockReturnValue(mockDeveloperNotification);
    mockRequest.payload = {
      message: { data: 'BASE64DATA' },
    };
    mockPlayBilling.purchaseManager = {
      getPurchase: jest.fn().mockResolvedValue(mockPurchase),
      processDeveloperNotification: jest.fn().mockResolvedValue({}),
    };
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  describe('rtdn', () => {
    it('notification that requires profile updating', async () => {
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(playPubsubHandlerInstance.extractMessage).toHaveBeenCalledTimes(1);
      expect(mockPlayBilling.purchaseManager.getPurchase).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      ).toHaveBeenCalledTimes(1);
      expect(mockCapabilityService.iapUpdate).toHaveBeenCalledTimes(1);
    });

    it('test notification', async () => {
      mockDeveloperNotification.testNotification = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        'play-test-notification',
        mockDeveloperNotification
      );
      expect(
        mockPlayBilling.purchaseManager.getPurchase
      ).not.toHaveBeenCalled();
    });

    it('missing subscription notification', async () => {
      mockDeveloperNotification.subscriptionNotification = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        'play-other-notification',
        mockDeveloperNotification
      );
      expect(
        mockPlayBilling.purchaseManager.getPurchase
      ).not.toHaveBeenCalled();
    });

    it('non-existing purchase', async () => {
      mockPlayBilling.purchaseManager.getPurchase = jest
        .fn()
        .mockResolvedValue(null);
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      ).toHaveBeenCalledTimes(1);
      expect(db.account).not.toHaveBeenCalled();
    });

    it('no userId', async () => {
      mockPurchase.userId = null;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      ).not.toHaveBeenCalled();
      expect(db.account).not.toHaveBeenCalled();
    });

    it('replaced purchase', async () => {
      mockPurchase.userId = 'invalid';
      mockPurchase.replacedByAnotherPurchase = true;
      const result = await playPubsubHandlerInstance.rtdn(mockRequest);
      expect(result).toEqual({});
      expect(
        mockPlayBilling.purchaseManager.processDeveloperNotification
      ).not.toHaveBeenCalled();
      expect(db.account).not.toHaveBeenCalled();
    });
  });
});
