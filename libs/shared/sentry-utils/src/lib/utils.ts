/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ErrorEvent } from '@sentry/types';
import { CommonPiiActions } from './pii/filter-actions';
import { SentryPiiFilter } from './pii/filters';

export function tagFxaName(data: any, name?: string) {
  data.tags = data.tags || {};
  data.tags['fxa.name'] = name || 'unknown';
  return data;
}

const piiFilter = new SentryPiiFilter([
  CommonPiiActions.breadthFilter,
  CommonPiiActions.depthFilter,
  CommonPiiActions.piiKeys,
  CommonPiiActions.emailValues,
  CommonPiiActions.tokenValues,
  CommonPiiActions.ipV4Values,
  CommonPiiActions.ipV6Values,
  CommonPiiActions.urlUsernamePassword,
]);

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param event Sentry ErrorEvent
 */
export function filterObject(event: ErrorEvent) {
  return piiFilter.filter(event);
}

/**
 * Filter potential PII from a sentry event.
 *
 * - Limits depth data beyond 5 levels
 * - Filters out pii keys, See CommonPiiActions.piiKeys for more details
 * - Filters out strings that look like emails addresses
 * - Filters out strings that look like tokens value (32 char length alphanumeric values)
 * - Filters out strings that look like ip addresses (v4/v6)
 * - Filters out urls with user name / password data
 * @param event A sentry event
 * @returns a sanitized sentry event
 */
export function filterSentryEvent(
  event: ErrorEvent,
  _hint: unknown
): ErrorEvent {
  return piiFilter.filter(event);
}

/**
 * Query parameters we allow to propagate to sentry
 */
const ALLOWED_QUERY_PARAMETERS = [
  'automatedBrowser',
  'client_id',
  'context',
  'entrypoint',
  'keys',
  'migration',
  'redirect_uri',
  'scope',
  'service',
  'setting',
  'style',
];

/**
 * Overwrites sensitive query parameters with a dummy value.
 *
 * @param url
 * @returns url
 */
export function cleanUpQueryParam(url = '') {
  const urlObj = new URL(url);

  if (!urlObj.search.length) {
    return url;
  }

  // Iterate the search parameters.
  urlObj.searchParams.forEach((_, key) => {
    if (!ALLOWED_QUERY_PARAMETERS.includes(key)) {
      // if the param is a PII (not allowed) then reset the value.
      urlObj.searchParams.set(key, 'VALUE');
    }
  });

  return urlObj.href;
}
