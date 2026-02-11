/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * stringify and parse the `resume` token that is set in the URL
 * search parameters post-verification in the OAuth flow
 */

import _ from 'underscore';
import Backbone from 'backbone';

const ALLOWED_KEYS = [
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

const ResumeToken = Backbone.Model.extend(
  {
    defaults: {
      utmCampaign: null,
      utmContent: null,
      utmMedium: null,
      utmSource: null,
      utmTerm: null,
    },

    initialize(options) {
      // get rid of any data in the options block that is not expected.
      this.clear();

      const allowedData = _.pick(options, ALLOWED_KEYS);
      this.set(allowedData);
    },

    stringify() {
      return stringify(this.pick(ALLOWED_KEYS));
    },
  },
  {
    ALLOWED_KEYS,
    createFromStringifiedResumeToken,
    parse,
    stringify,
  }
);

function parse(resumeToken) {
  try {
    return JSON.parse(atob(resumeToken));
  } catch (e) {
    // do nothing, its an invalid token.
  }
}

function stringify(resumeObj) {
  const encoded = btoa(JSON.stringify(resumeObj));
  return encoded;
}

function createFromStringifiedResumeToken(stringifiedResumeToken) {
  const parsedResumeToken = parse(stringifiedResumeToken);
  return new ResumeToken(parsedResumeToken);
}

export default ResumeToken;
