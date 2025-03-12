import { Test, TestingModule } from '@nestjs/testing';
import { GoogleIapClient } from './google-iap.client';
import { GoogleIapUnknownError } from './google-iap.error';
import { MockGoogleIapClientConfigProvider } from './google-iap.client.config';
import { faker } from '@faker-js/faker';

jest.mock('googleapis', () => ({
  google: {
    androidpublisher: jest.fn().mockReturnValue({
      purchases: {
        subscriptions: {
          get: jest.fn(),
        },
      },
    }),
  },
  Auth: {
    JWT: jest.fn(),
  },
}));

describe('GoogleIapClient', () => {
  let googleIapClient: GoogleIapClient;
  let mockApiInstance: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockGoogleIapClientConfigProvider, GoogleIapClient],
    }).compile();

    googleIapClient = module.get(GoogleIapClient);
    mockApiInstance =
      googleIapClient.playDeveloperApiClient.purchases.subscriptions;
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
        .spyOn(mockApiInstance, 'get')
        .mockResolvedValue({ data: mockResponseData });

      const result = await googleIapClient.getSubscriptions(
        mockPackageName,
        mockSku,
        mockPurchaseToken
      );

      expect(result).toEqual(mockResponseData);
      expect(mockApiInstance.get).toHaveBeenCalledWith({
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

      jest.spyOn(mockApiInstance, 'get').mockRejectedValue(error);

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
