import { PaymentsGleanService } from './glean.service';
import { PaymentsGleanProvider } from './glean.types';

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
      recordSubscriptionTrialConverted: () => {},
    }) as any,
};

export const MockPaymentsGleanServiceFactory = {
  provide: PaymentsGleanService,
  useFactory: () =>
    ({
      handleUserDelete: () => {},
      recordGenericSubManageEvent: () => {},
      retrieveSubManageMetricsData: () => {},
      mapStripeMetricsData: () => {},
      mapAccountsMetricsData: () => {},
      mapSubPlatCmsMetricsData: () => {},
      mapSessionMetricsData: () => {},
      mapExperimentationMetricsData: () => {},
    }) as any,
};
