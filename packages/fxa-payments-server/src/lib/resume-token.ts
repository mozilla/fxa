/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * We need to create a Resume Token for the sign up process.  The exported
 * function will produce a resume token that's compatible with the
 * content-server.
 */

import {
  ALLOWED_KEYS,
  DEFAULTS,
  ResumeToken,
  stringify,
} from 'fxa-shared/lib/resume-token';

export function createResumeToken(x: ResumeToken) {
  const merged: ResumeToken = { ...DEFAULTS, ...x };
  const picked = Object.keys(merged).reduce((acc: ResumeToken, k) => {
    if (ALLOWED_KEYS.includes(k)) {
      acc[k] = merged[k];
    }
    return acc;
  }, {});
  return stringify(picked);
}

export default createResumeToken;
