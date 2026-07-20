/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentsGleanClientManager } from './glean-client.manager';
import { PaymentsGleanClientConfig } from './glean.config';
import {
  PageViewEventFactory,
  RetentionFlowResultFactory,
} from './glean.factory';

const mockGlean = jest.requireMock('@mozilla/glean/web').default;
const mockSubscriptions = jest.requireMock('./__generated__/subscriptions');

describe('PaymentsGleanClientManager', () => {
  const originalEnv = process.env;
  let paymentsGleanClientManager: PaymentsGleanClientManager;

  const mockConfigValue: PaymentsGleanClientConfig = {
    enabled: true,
    applicationId: 'test.app',
    uploadEnabled: true,
    version: '0.0.0-test',
    channel: 'development',
  };

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv, CI: '' };
    (global as any).window = {};

    paymentsGleanClientManager = new PaymentsGleanClientManager(
      mockConfigValue
    );
  });

  afterEach(() => {
    delete (global as any).window;
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(paymentsGleanClientManager).toBeDefined();
  });

  describe('initialize', () => {
    it('does not initialize Glean in non-browser environment', () => {
      delete (global as any).window;

      paymentsGleanClientManager.initialize();

      expect(mockGlean.initialize).not.toHaveBeenCalled();
    });

    it('initializes Glean with correct config', async () => {
      paymentsGleanClientManager.initialize();

      expect(mockGlean.initialize).toHaveBeenCalledWith(
        mockConfigValue.applicationId,
        true,
        {
          appDisplayVersion: mockConfigValue.version,
          channel: mockConfigValue.channel,
        }
      );
    });

    it('initializes Glean with uploadEnabled false when config.uploadEnabled is false', () => {
      const manager = new PaymentsGleanClientManager({
        ...mockConfigValue,
        uploadEnabled: false,
      });

      manager.initialize();

      expect(mockGlean.initialize).toHaveBeenCalledWith(
        mockConfigValue.applicationId,
        false,
        {
          appDisplayVersion: mockConfigValue.version,
          channel: mockConfigValue.channel,
        }
      );
    });

    it('does not initialize Glean when disabled', async () => {
      const disabledConfigValue = {
        ...mockConfigValue,
        enabled: false,
      };
      const manager = new PaymentsGleanClientManager(disabledConfigValue);

      manager.initialize();

      expect(mockGlean.initialize).not.toHaveBeenCalled();
    });
  });

  describe('recordPageView', () => {
    it('initializes and records page view', async () => {
      paymentsGleanClientManager.recordPageView(
        PageViewEventFactory({ pageName: 'management' })
      );

      expect(mockGlean.initialize).toHaveBeenCalledWith(
        mockConfigValue.applicationId,
        true,
        {
          appDisplayVersion: mockConfigValue.version,
          channel: mockConfigValue.channel,
        }
      );
      expect(mockSubscriptions.pageView.record).toHaveBeenCalledWith(
        expect.objectContaining({
          page_name: 'management',
        })
      );
      expect(mockSubscriptions.pageView.record).toHaveBeenCalledTimes(1);
    });

    it('initializes Glean only once', () => {
      paymentsGleanClientManager.recordPageView(
        PageViewEventFactory({ pageName: 'management' })
      );
      paymentsGleanClientManager.recordPageView(
        PageViewEventFactory({
          pageName: 'management',
        })
      );

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
    });

    it('does not record page_view when config.enabled=false', async () => {
      const disabledConfig = { ...mockConfigValue, enabled: false };
      const manager = new PaymentsGleanClientManager(disabledConfig);

      manager.recordPageView(PageViewEventFactory({ pageName: 'management' }));

      expect(mockSubscriptions.pageView.record).not.toHaveBeenCalled();
    });

    it('does not record page_view when CI=true', () => {
      process.env['CI'] = 'true';

      paymentsGleanClientManager.recordPageView(
        PageViewEventFactory({ pageName: 'management' })
      );

      expect(mockSubscriptions.pageView.record).not.toHaveBeenCalled();
    });

    it('does not throw if window is undefined', () => {
      delete (global as any).window;

      expect(() =>
        paymentsGleanClientManager.recordPageView(
          PageViewEventFactory({ pageName: 'management' })
        )
      ).not.toThrow();
    });
  });

  describe('recordRetentionFlow', () => {
    const baseArgs = { flowType: 'cancel' as const };

    it('records retention flow view', () => {
      paymentsGleanClientManager.recordRetentionFlowView(baseArgs);

      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledWith(
        expect.objectContaining({
          flow_type: 'cancel',
          step: 'view',
        })
      );
      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
    });

    it('records retention flow engage with action', () => {
      paymentsGleanClientManager.recordRetentionFlowEngage({
        ...baseArgs,
        action: 'redeem_coupon',
      });

      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledWith(
        expect.objectContaining({
          flow_type: 'cancel',
          step: 'engage',
          action: 'redeem_coupon',
        })
      );
    });

    it('records retention flow result with action and outcome', () => {
      const resultData = RetentionFlowResultFactory({
        flowType: 'cancel',
      });
      paymentsGleanClientManager.recordRetentionFlowResult(resultData);

      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledWith(
        expect.objectContaining({
          flow_type: 'cancel',
          step: 'result',
          action: resultData.action,
          outcome: resultData.outcome,
        })
      );
    });

    it('does not record when disabled', () => {
      const manager = new PaymentsGleanClientManager({
        ...mockConfigValue,
        enabled: false,
      });

      manager.recordRetentionFlowEngage({
        ...baseArgs,
        action: 'redeem_coupon',
      });

      expect(mockSubscriptions.retentionFlow.record).not.toHaveBeenCalled();
    });

    it('does not record in non-browser environment', () => {
      delete (global as any).window;

      paymentsGleanClientManager.recordRetentionFlowEngage({
        ...baseArgs,
        action: 'redeem_coupon',
      });

      expect(mockSubscriptions.retentionFlow.record).not.toHaveBeenCalled();
    });

    it('does not throw if record throws', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockSubscriptions.retentionFlow.record.mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() =>
        paymentsGleanClientManager.recordRetentionFlowEngage({
          ...baseArgs,
          action: 'redeem_coupon',
        })
      ).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Glean client metric record failed',
        expect.any(Error)
      );
    });

    it('initializes only once across multiple calls', () => {
      paymentsGleanClientManager.recordRetentionFlowEngage({
        ...baseArgs,
        action: 'redeem_coupon',
      });
      paymentsGleanClientManager.recordRetentionFlowSubmit({
        ...baseArgs,
        action: 'redeem_coupon',
      });

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledTimes(2);
    });
  });

  describe('recordInterstitialOffer', () => {
    const baseArgs = { offeringId: 'test-offering' };

    it('records interstitial offer view', () => {
      paymentsGleanClientManager.recordInterstitialOfferView(baseArgs);

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'view',
          offering_id: 'test-offering',
        })
      );
    });

    it('records interstitial offer view with action', () => {
      paymentsGleanClientManager.recordInterstitialOfferView({
        ...baseArgs,
        action: 'upgrade',
      });

      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'view',
          action: 'upgrade',
          offering_id: 'test-offering',
        })
      );
    });

    it('records interstitial offer engage with action', () => {
      paymentsGleanClientManager.recordInterstitialOfferEngage({
        ...baseArgs,
        action: 'upgrade',
      });

      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'engage',
          action: 'upgrade',
        })
      );
    });

    it('does not record in non-browser environment', () => {
      delete (global as any).window;

      paymentsGleanClientManager.recordInterstitialOfferEngage({
        action: 'upgrade',
      });

      expect(mockSubscriptions.interstitialOffer.record).not.toHaveBeenCalled();
      expect(mockGlean.initialize).not.toHaveBeenCalled();
    });

    it('does not record when CI=true', () => {
      process.env = { ...process.env, CI: 'true' };

      paymentsGleanClientManager.recordInterstitialOfferEngage({
        action: 'upgrade',
      });

      expect(mockSubscriptions.interstitialOffer.record).not.toHaveBeenCalled();
    });

    it('does not throw if record throws', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockSubscriptions.interstitialOffer.record.mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() =>
        paymentsGleanClientManager.recordInterstitialOfferEngage({
          action: 'upgrade',
        })
      ).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Glean client metric record failed',
        expect.any(Error)
      );
    });

    it('initializes only once across multiple calls', () => {
      paymentsGleanClientManager.recordInterstitialOfferEngage({
        action: 'upgrade',
      });
      paymentsGleanClientManager.recordInterstitialOfferResult({
        action: 'cancel_subscription',
        outcome: 'customer_canceled',
      });

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledTimes(
        2
      );
    });
  });
});
