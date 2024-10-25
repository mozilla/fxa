/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nestjs';
import Config from './config';
import mozLog from 'mozlog';
import { initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/shared/sentry-nest';
import { version } from '../package.json';

const config = Config.getProperties();
const log = mozLog(config.log)(config.log.app);

initTracing(config.tracing, log);
initSentry(
  {
    ...config,
    release: version,
    integrations: [Sentry.extraErrorDataIntegration({ depth: 5 })],
  },
  {
    warn: (type, data) => log.warn(type.replace(/ /g, '-'), data as any),
    debug: (type, data) => log.debug(type.replace(/ /g, '-'), data as any),
    info: (type, data) => log.info(type.replace(/ /g, '-'), data as any),
    error: (type, data) => log.error(type.replace(/ /g, '-'), data as any),
  }
);
