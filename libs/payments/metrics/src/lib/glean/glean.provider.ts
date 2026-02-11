/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { PaymentsGleanConfig } from './glean.config';
import { createEventsServerEventLogger } from './__generated__/server_events';
import { PaymentsGleanProvider } from './glean.types';

const getRandomValue = () => Math.floor(Math.random() * 10000);

export type PaymentsGleanServerEventsLogger = ReturnType<
  typeof createEventsServerEventLogger
>;

export const PaymentsGleanFactory: Provider<PaymentsGleanServerEventsLogger> = {
  provide: PaymentsGleanProvider,
  useFactory: (config: PaymentsGleanConfig) => {
    // In development, we want to have a unique logger name. Without it, each time the
    // nestapp restarts, a new logger handler is added and  the events will be logged
    // multiple times, once per handler.
    const loggerAppName =
      process.env['NODE_ENV'] === 'development'
        ? `${config.loggerAppName}-${getRandomValue()}`
        : config.loggerAppName;
    return createEventsServerEventLogger({
      applicationId: config.applicationId,
      appDisplayVersion: config.version,
      channel: config.channel,
      logger_options: {
        app: loggerAppName,
      },
    });
  },
  inject: [PaymentsGleanConfig],
};
