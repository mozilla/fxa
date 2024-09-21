/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { createEventsServerEventLogger } from './__generated__/server_events';
import { PaymentsGleanConfig } from './glean.config';

export type PaymentsGleanServerEventsLogger = ReturnType<
  typeof createEventsServerEventLogger
>;
export const PaymentsGleanProvider = Symbol('GleanServerEventsProvider');

export const PaymentsGleanFactory: Provider<PaymentsGleanServerEventsLogger> = {
  provide: PaymentsGleanProvider,
  useFactory: (config: PaymentsGleanConfig) => {
    return createEventsServerEventLogger({
      applicationId: config.applicationId,
      appDisplayVersion: config.version,
      channel: config.channel,
      logger_options: {
        app: config.loggerAppName,
      },
    });
  },
  inject: [PaymentsGleanConfig],
};

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
    } as any),
} satisfies Provider<PaymentsGleanServerEventsLogger>;
