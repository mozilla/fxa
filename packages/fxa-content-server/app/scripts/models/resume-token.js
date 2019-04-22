/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * stringify and parse the `resume` token that is set in the URL
 * search parameters post-verification in the OAuth flow
 */

'use strict';

import _ from 'underscore';
import Backbone from 'backbone';

var ResumeToken = Backbone.Model.extend({
  defaults: {
    deviceId: undefined,
    email: undefined,
    entrypoint: undefined,
    flowBegin: undefined,
    flowId: undefined,
    needsOptedInToMarketingEmail: undefined,
    resetPasswordConfirm: undefined,
    uniqueUserId: undefined,
    utmCampaign: null,
    utmContent: null,
    utmMedium: null,
    utmSource: null,
    utmTerm: null
  },

  initialize (options) {
    this.allowedKeys = Object.keys(this.defaults);

    // get rid of any data in the options block that is not expected.
    this.clear();

    var allowedData = _.pick(options, this.allowedKeys);
    this.set(allowedData);
  },

  stringify () {
    return stringify(this.pick(this.allowedKeys));
  }
});

function parse(resumeToken) {
  try {
    return JSON.parse(atob(resumeToken));
  } catch (e) {
    // do nothing, its an invalid token.
  }
}

function stringify(resumeObj) {
  var encoded = btoa(JSON.stringify(resumeObj));
  return encoded;
}

function createFromStringifiedResumeToken(stringifiedResumeToken) {
  var parsedResumeToken = parse(stringifiedResumeToken);
  return new ResumeToken(parsedResumeToken);
}


// static methods on the ResumeToken object itself, not its prototype.
_.extend(ResumeToken, {
  createFromStringifiedResumeToken: createFromStringifiedResumeToken,
  parse: parse,
  stringify: stringify
});

export default ResumeToken;
