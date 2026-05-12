/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
