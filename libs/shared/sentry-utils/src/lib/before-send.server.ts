/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InitSentryOpts } from './models/sentry-config-opts';
import { tagFxaName } from './utils';
import { ErrorEvent } from '@sentry/types';

export function beforeSendServer(
  config: InitSentryOpts,
  event: ErrorEvent,
  hint: any
) {
  if (config.ignoreErrors) {
    const ignore = config.ignoreErrors(event);
    if (ignore) {
      return null;
    }
  }

  // Default
  event = tagFxaName(event, config.sentry?.serverName || 'unknown');

  // Custom filters
  config.eventFilters?.forEach((filter) => {
    event = filter(event, hint);
  });
  return event;
}
