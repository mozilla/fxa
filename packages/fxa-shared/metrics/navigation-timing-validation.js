const joi = require('joi');

const TIMESTAMP_MS = joi.number().required();
// Validate the subset of PerformanceNavgationTiming properties used here.
// (Ref: https://www.w3.org/TR/navigation-timing-2/#dom-performancenavigationtiming)
module.exports.navigationTimingSchema = joi.object().keys({
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
