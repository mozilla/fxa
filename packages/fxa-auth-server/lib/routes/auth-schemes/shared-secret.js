/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Boom from '@hapi/boom';

import AppError from '../../error';
import crypto from 'crypto';

const constantTimeCompare = (subject, object) => {
  const size = Buffer.byteLength(object);
  return (
    crypto.timingSafeEqual(Buffer.alloc(size, subject), Buffer.from(object)) &&
    subject.length === object.length
  );
};

export const strategy = (secret, authStrategyOptions = { throwOnFailure: true }) =>
(server, options) => ({
  authenticate: (request, h) => {
    if (constantTimeCompare(request.headers.authorization, secret)) {
      return h.authenticated({ credentials: {} });
    }

    if (authStrategyOptions.throwOnFailure) {
      throw AppError.invalidToken();
    }

    // This is what allows us to continue on to the next auth strategy when
    // there is one.  There is at least one route that needs this at the time
    // of writing.
    return Boom.unauthorized(null, 'sharedSecret');
  },
});
