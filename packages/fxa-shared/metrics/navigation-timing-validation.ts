/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import joi from 'joi';

const TIMESTAMP_MS = joi.number().required();
// Validate the subset of PerformanceNavgationTiming properties used here.
// (Ref: https://www.w3.org/TR/navigation-timing-2/#dom-performancenavigationtiming)
export const navigationTimingSchema = joi.object().keys({
  domainLookupStart: TIMESTAMP_MS.min(0),
  domComplete: TIMESTAMP_MS.min(joi.ref('domInteractive')),
  domInteractive: TIMESTAMP_MS.min(joi.ref('responseEnd')),
  loadEventEnd: TIMESTAMP_MS.min(joi.ref('loadEventStart')),
  loadEventStart: TIMESTAMP_MS.min(joi.ref('domComplete')),
  name: joi.string().uri().required(),
  redirectStart: TIMESTAMP_MS,
  requestStart: TIMESTAMP_MS.min(joi.ref('domainLookupStart')),
  responseEnd: TIMESTAMP_MS.min(joi.ref('responseStart')),
  responseStart: TIMESTAMP_MS.min(joi.ref('requestStart')),
});

export default { navigationTimingSchema };
