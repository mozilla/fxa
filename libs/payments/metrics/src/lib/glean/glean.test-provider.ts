import {
  PaymentsGleanClientProvider,
  PaymentsGleanProvider,
} from './glean.types';

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * maxmind.
 * Note: this will cause errors to be thrown if geodb is used
 */
export const MockPaymentsGleanFactory = {
  provide: PaymentsGleanProvider,
  useFactory: () =>
    ({
      recordPaySetupView: () => {},
      recordPaySetupEngage: () => {},
      recordPaySetupSubmit: () => {},
      recordPaySetupSuccess: () => {},
      recordPaySetupFail: () => {},
      recordSubscriptionEnded: () => {},
    }) as any,
};

export const MockPaymentsGleanClientFactory = {
  provide: PaymentsGleanClientProvider,
  useFactory: () =>
    ({
      recordPageView: () => {},
      recordRetentionFlow: () => {},
      recordInterstitialOffer: () => {},
    }) as any,
};
