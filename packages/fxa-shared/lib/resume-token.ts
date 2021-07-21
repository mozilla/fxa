/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is shareable code extracted from the content-server so that we can use
 * it in Payments.  Not all of the Resume Token code was moved because the
 * model in content-server depends on backbone.js and underscore.js.
 *
 * The tests are in content-server and Payments.
 */

export type ResumeToken = { [key: string]: any };

export const ALLOWED_KEYS = [
  'deviceId',
  'email',
  'entrypoint',
  'entrypointExperiment',
  'entrypointVariation',
  'flowBegin',
  'flowId',
  'newsletters',
  'planId',
  'productId',
  'resetPasswordConfirm',
  'style',
  'uniqueUserId',
  'utmCampaign',
  'utmContent',
  'utmMedium',
  'utmSource',
  'utmTerm',
];

export const DEFAULTS = {
  utmCampaign: null,
  utmContent: null,
  utmMedium: null,
  utmSource: null,
  utmTerm: null,
};

export function parse(resumeToken: string): ResumeToken | void {
  try {
    return JSON.parse(atob(resumeToken));
  } catch (e) {
    // do nothing, it's an invalid token.
  }
}

export function stringify(resumeObj: ResumeToken) {
  const encoded = btoa(JSON.stringify(resumeObj));
  return encoded;
}

export default { ALLOWED_KEYS, DEFAULTS, parse, stringify };
