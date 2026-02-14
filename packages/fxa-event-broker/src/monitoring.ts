/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Config, { AppConfig } from './config';
import mozLog from 'mozlog';
import { initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/shared/sentry-node';

const log = mozLog(Config.getProperties().log)(Config.getProperties().log.app);
const appConfig = Config.getProperties() as AppConfig;
initTracing(appConfig.tracing, log);
initSentry(appConfig, {
  error(type: string, data: unknown) {
    log.error(type, toObject(data));
  },
  debug(type: string, data: unknown) {
    log.debug(type, toObject(data));
  },
  info(type: string, data: unknown) {
    log.info(type, toObject(data));
  },
  warn(type: string, data: unknown) {
    log.warn(type, toObject(data));
  },
});

function toObject(data: unknown): object {
  if (data === null) {
    return {};
  }
  if (typeof data === 'object') {
    return data;
  }
  return { data };
}
