/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { PaymentsGleanClientManager } from './glean-client.manager';
import { PaymentsGleanClientConfig } from './glean.config';
import {
  PageViewEventFactory,
  RetentionFlowEventFactory,
} from './glean.factory';

jest.mock('@mozilla/glean/web', () => {
  return {
    __esModule: true,
    default: {
      initialize: jest.fn(),
    },
  };
});

jest.mock('./__generated__/subscriptions', () => ({
  pageView: { record: jest.fn() },
  retentionFlow: { record: jest.fn() },
  interstitialOffer: { record: jest.fn() },
}));

const mockGlean = jest.requireMock('@mozilla/glean/web').default;
const mockSubscriptions = jest.requireMock('./__generated__/subscriptions');

describe('PaymentsGleanClientManager', () => {
  const originalEnv = process.env;
  let paymentsGleanClientManager: PaymentsGleanClientManager;

  const mockConfigValue: PaymentsGleanClientConfig = {
    enabled: true,
    applicationId: 'test.app',
    version: '0.0.0-test',
    channel: 'development',
  };

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv, CI: '' };
    (global as any).window = {};

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: PaymentsGleanClientConfig, useValue: mockConfigValue },
        PaymentsGleanClientManager,
      ],
    }).compile();

    paymentsGleanClientManager = moduleRef.get(PaymentsGleanClientManager);
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

    it('does not initialize Glean when disabled', async () => {
      const disabledConfigValue = {
        ...mockConfigValue,
        enabled: false,
      };
      const moduleRef = await Test.createTestingModule({
        providers: [
          { provide: PaymentsGleanClientConfig, useValue: disabledConfigValue },
          PaymentsGleanClientManager,
        ],
      }).compile();
      const manager = moduleRef.get(PaymentsGleanClientManager);

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

      const moduleRef = await Test.createTestingModule({
        providers: [
          { provide: PaymentsGleanClientConfig, useValue: disabledConfig },
          PaymentsGleanClientManager,
        ],
      }).compile();

      const manager = moduleRef.get(PaymentsGleanClientManager);

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
    it('initializes and records retention flow when enabled', () => {
      paymentsGleanClientManager.recordRetentionFlow(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledWith(
        expect.objectContaining({
          flow_type: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );
      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledTimes(1);
    });

    it('does not recordRetentionFlow when disabled', async () => {
      const disabledConfigValue = { ...mockConfigValue, enabled: false };

      const moduleRef = await Test.createTestingModule({
        providers: [
          { provide: PaymentsGleanClientConfig, useValue: disabledConfigValue },
          PaymentsGleanClientManager,
        ],
      }).compile();

      const manager = moduleRef.get(PaymentsGleanClientManager);

      manager.recordRetentionFlow(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockSubscriptions.retentionFlow.record).not.toHaveBeenCalled();
    });

    it('does not recordRetentionFlow in non-browser environment', () => {
      delete (global as any).window;

      paymentsGleanClientManager.recordRetentionFlow(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockSubscriptions.retentionFlow.record).not.toHaveBeenCalled();
    });

    it('does not throw if recordRetentionFlow throws', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockSubscriptions.retentionFlow.record.mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() =>
        paymentsGleanClientManager.recordRetentionFlow(
          RetentionFlowEventFactory({
            flowType: 'cancel',
            step: 'engage',
            outcome: 'success',
          })
        )
      ).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Glean client metric record failed',
        expect.any(Error)
      );
    });

    it('initializes only once when recording retention flow multiple times', () => {
      paymentsGleanClientManager.recordRetentionFlow(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );
      paymentsGleanClientManager.recordRetentionFlow(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'submit',
          outcome: 'success',
        })
      );

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.retentionFlow.record).toHaveBeenCalledTimes(2);
    });
  });

  describe('recordInterstitialOffer', () => {
    it('initializes and records interstitial offer', () => {
      paymentsGleanClientManager.recordInterstitialOffer(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockGlean.initialize).toHaveBeenCalledWith(
        mockConfigValue.applicationId,
        true,
        {
          appDisplayVersion: mockConfigValue.version,
          channel: mockConfigValue.channel,
        }
      );

      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledWith(
        expect.objectContaining({
          flow_type: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );
    });

    it('does not record interstitial offer in non-browser environment', () => {
      delete (global as any).window;

      paymentsGleanClientManager.recordInterstitialOffer(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockSubscriptions.interstitialOffer.record).not.toHaveBeenCalled();
      expect(mockGlean.initialize).not.toHaveBeenCalled();
    });

    it('does not record interstitial offer when CI=true', () => {
      process.env = { ...process.env, CI: 'true' };

      paymentsGleanClientManager.recordInterstitialOffer(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      expect(mockSubscriptions.interstitialOffer.record).not.toHaveBeenCalled();
    });

    it('does not throw if interstitialOffer.record throws', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      mockSubscriptions.interstitialOffer.record.mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() =>
        paymentsGleanClientManager.recordInterstitialOffer(
          RetentionFlowEventFactory({
            flowType: 'cancel',
            step: 'engage',
            outcome: 'success',
          })
        )
      ).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Glean client metric record failed',
        expect.any(Error)
      );
    });

    it('initializes Glean only once when recording interstitial offer multiple times', () => {
      paymentsGleanClientManager.recordInterstitialOffer(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'engage',
          outcome: 'success',
        })
      );

      paymentsGleanClientManager.recordInterstitialOffer(
        RetentionFlowEventFactory({
          flowType: 'cancel',
          step: 'result',
          outcome: 'success',
        })
      );

      expect(mockGlean.initialize).toHaveBeenCalledTimes(1);
      expect(mockSubscriptions.interstitialOffer.record).toHaveBeenCalledTimes(
        2
      );
    });
  });
});
