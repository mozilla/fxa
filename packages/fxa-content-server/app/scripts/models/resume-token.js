/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * stringify and parse the `resume` token that is set in the URL
 * search parameters post-verification in the OAuth flow
 */

import _ from 'underscore';
import Backbone from 'backbone';
import {
  ALLOWED_KEYS,
  DEFAULTS,
  parse,
  stringify,
} from 'fxa-shared/lib/resume-token';

const ResumeToken = Backbone.Model.extend(
  {
    defaults: DEFAULTS,

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

function createFromStringifiedResumeToken(stringifiedResumeToken) {
  const parsedResumeToken = parse(stringifiedResumeToken);
  return new ResumeToken(parsedResumeToken);
}

export default ResumeToken;
