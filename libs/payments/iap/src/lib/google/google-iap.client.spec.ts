import { Test, TestingModule } from '@nestjs/testing';
import { GoogleIapClient } from './google-iap.client';
import { GoogleIapUnknownError } from './google-iap.error';
import { MockGoogleIapClientConfigProvider } from './google-iap.client.config';
import { faker } from '@faker-js/faker';

jest.mock('@googleapis/androidpublisher', () => ({
  androidpublisher: jest.fn().mockReturnValue({
    purchases: {
      subscriptions: {
        get: jest.fn(),
      },
    },
  }),
  auth: {
    GoogleAuth: jest.fn(),
  },
}));

describe('GoogleIapClient', () => {
  let googleIapClient: GoogleIapClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockGoogleIapClientConfigProvider, GoogleIapClient],
    }).compile();

    googleIapClient = module.get(GoogleIapClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSubscriptions', () => {
    it('should return subscription data', async () => {
      const mockPackageName = faker.string.uuid();
      const mockSku = faker.string.uuid();
      const mockPurchaseToken = faker.string.uuid();
      const mockResponseData = {
        kind: 'androidpublisher#subscriptionPurchase',
      };

      jest
        .spyOn(
          googleIapClient.playDeveloperApiClient.purchases.subscriptions as any,
          'get'
        )
        .mockResolvedValue({ data: mockResponseData });

      const result = await googleIapClient.getSubscriptions(
        mockPackageName,
        mockSku,
        mockPurchaseToken
      );

      expect(result).toEqual(mockResponseData);
      expect(
        googleIapClient.playDeveloperApiClient.purchases.subscriptions.get
      ).toHaveBeenCalledWith({
        packageName: mockPackageName,
        subscriptionId: mockSku,
        token: mockPurchaseToken,
      });
    });

    it('should throw GoogleIapUnknownError on failure', async () => {
      const mockPackageName = faker.string.uuid();
      const mockSku = faker.string.uuid();
      const mockPurchaseToken = faker.string.uuid();
      const error = new Error('Google API error');

      jest
        .spyOn(
          googleIapClient.playDeveloperApiClient.purchases.subscriptions as any,
          'get'
        )
        .mockRejectedValue(error);

      await expect(
        googleIapClient.getSubscriptions(
          mockPackageName,
          mockSku,
          mockPurchaseToken
        )
      ).rejects.toThrow(
        new GoogleIapUnknownError('Unknown Google IAP Error', { cause: error })
      );
    });
  });
});
